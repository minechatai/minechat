import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Define the Result interface
interface Result {
  conversationId: string;
  lead: {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    email: string | null;
    phoneNumber: string | null;
    leadSource: string | null;
  };
  opportunity: any; // Adjust this type as needed
  opportunityDetails?: any; // Optional, adjust as needed
  error?: string; // Include error property
}

export async function POST(request: NextRequest) {
  console.log("POST request received")
  try {
    // Parse the incoming JSON body.
    const body = await request.json()
    console.log("Parsed request body:", body)

    const { userId, fbPageName, conversations, supabaseUrl, supabaseKey, products } = body

    if (!userId || !fbPageName) {
      console.error("Missing userId or fbPageName in request")
      return NextResponse.json(
        { error: "Invalid request: userId and fbPageName are required." },
        { status: 400 }
      )
    }
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing supabaseUrl or supabaseKey in request")
      return NextResponse.json(
        { error: "Invalid request: supabaseUrl and supabaseKey are required." },
        { status: 400 }
      )
    }
    if (!conversations || !Array.isArray(conversations)) {
      console.error("Conversations is missing or not an array")
      return NextResponse.json(
        { error: "Invalid request: 'conversations' must be an array of conversation objects." },
        { status: 400 }
      )
    }

    console.log(`Processing ${conversations.length} conversation(s)`)

    // Create a Supabase client instance using the passed credentials
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Initialize results array
    const results: Result[] = []

    for (const conv of conversations) {
      console.log(`Processing conversation with id: ${conv.id}`)
      if (!conv.history || !Array.isArray(conv.history)) {
        console.warn(`Skipping conversation ${conv.id} because history is not an array`)
        continue
      }
      console.log(`Conversation ${conv.id} has ${conv.history.length} message(s)`)

      // Sort conversation history by date (oldest first)
      const sortedHistory = conv.history.sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      
      // Check if there are any messages after sorting
      if (sortedHistory.length === 0) {
        console.warn(`Skipping conversation ${conv.id} because it has no messages`)
        results.push({
          conversationId: conv.id,
          lead: {
            id: "",
            userId: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: "",
            email: null,
            phoneNumber: null,
            leadSource: null
          },
          opportunity: null,
          error: "Conversation has no messages."
        })
        continue
      }
      
      // Get the 2 latest messages
      const latestTwoMessages = sortedHistory.slice(-2)
      console.log(`Latest 2 messages for conversation ${conv.id}:`, latestTwoMessages)

      // Determine the first message date (oldest) and last touch date (latest message)
      const firstMessageDate = sortedHistory[0].date;
      const latestMessageDate = sortedHistory[sortedHistory.length - 1].date;
      console.log(`First message date for conversation ${conv.id}: ${firstMessageDate}`)
      console.log(`Latest message date for conversation ${conv.id}: ${latestMessageDate}`)

      // Determine the lead's name: pick the first sender that is not the fbPageName.
      let leadName = "Unknown"
      for (const msg of conv.history) {
        if (msg.sender && msg.sender !== fbPageName) {
          leadName = msg.sender
          break
        }
      }
      console.log(`Determined lead name for conversation ${conv.id}: ${leadName}`)

      // Combine all message contents into one string.
      const conversationText = conv.history.map((m: any) => m.content).join(" ")
      console.log(`Combined conversation text for ${conv.id}: ${conversationText.slice(0, 50)}...`)

      // Extract email using a regex.
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
      const emails = conversationText.match(emailRegex)
      const email = emails ? emails[0] : null
      console.log(`Extracted email for ${conv.id}: ${email}`)

      // Extract phone number using a simple regex.
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/
      const phoneMatch = conversationText.match(phoneRegex)
      const phoneNumber = phoneMatch ? phoneMatch[0] : null
      console.log(`Extracted phone number for ${conv.id}: ${phoneNumber}`)

      // Create a Lead record in Supabase.
      console.log(`Creating lead record for conversation ${conv.id}`)
      const leadId = crypto.randomUUID ? crypto.randomUUID() : require('uuid').v4()
      const { data: leadData, error: leadError } = await supabase
        .from("Lead")
        .insert([
          {
            id: leadId,
            userId,
            name: leadName,
            email,
            phoneNumber,
            leadSource: "Facebook",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
        .select('*')
      if (leadError || !leadData || leadData.length === 0) {
        console.error(`Error creating lead for conversation ${conv.id}:`, leadError)
        results.push({ 
          conversationId: conv.id, 
          lead: {
            id: "",
            userId: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: "",
            email: null,
            phoneNumber: null,
            leadSource: null
          },
          opportunity: null,
          error: "Error creating lead record."
        })
        continue
      }
      const lead = leadData[0]
      console.log(`Lead created with id: ${lead.id} for conversation ${conv.id}`)

      // Prepare messages for the OpenAI API call to determine opportunity.
      const messages = [
        {
          role: "system",
          content:
            "You are an assistant that analyzes a conversation history to determine if it qualifies as an opportunity. Evaluate the conversation and decide if this conversation represents a potential business opportunity by checking if any of the available products is mentioned or can be matched. Return a JSON object with the following signature: { \"isOpportunity\": true or false, \"product\": string or null, \"opportunityDetails\": \"Details about the opportunity if any, or null\" }. Do not include any additional keys or text."
        },
        {
          role: "user",
          content: `Here is the conversation history:\n\n${JSON.stringify(conv.history)}\n\nAvailable products: ${JSON.stringify(products)}`
        }
      ]
      console.log(`Prepared OpenAI messages for conversation ${conv.id}`)

      // Ensure the API key is set in the environment.
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        console.error("OPENAI_API_KEY is not set")
        return NextResponse.json(
          { error: "Server configuration error: OPENAI_API_KEY is not set." },
          { status: 500 }
        )
      }

      // Call the OpenAI API using the gpt-4o-mini model.
      console.log(`Calling OpenAI API for conversation ${conv.id}`)
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          response_format: { type: "json_object" },
          temperature: 0
        })
      })
      console.log(`OpenAI response status for conversation ${conv.id}: ${openaiResponse.status}`)

      if (!openaiResponse.ok) {
        const errText = await openaiResponse.text()
        console.error(`OpenAI API error for conversation ${conv.id}: ${openaiResponse.status} ${errText}`)
        results.push({ 
          conversationId: conv.id, 
          lead: {
            id: "",
            userId: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: "",
            email: null,
            phoneNumber: null,
            leadSource: null
          },
          opportunity: null,
          error: `OpenAI API error: ${openaiResponse.status} ${errText}`
        })
        continue
      }

      const openaiData = await openaiResponse.json()
      console.log(`OpenAI response data for conversation ${conv.id}:`, openaiData)
      const jsonString = openaiData.choices[0].message.content

      let opportunityResult
      try {
        opportunityResult = JSON.parse(jsonString)
        console.log(`Parsed opportunity result for conversation ${conv.id}:`, opportunityResult)
      } catch (e) {
        console.error(`Failed to parse JSON from OpenAI API for conversation ${conv.id}`)
        results.push({ 
          conversationId: conv.id, 
          lead: {
            id: "",
            userId: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: "",
            email: null,
            phoneNumber: null,
            leadSource: null
          },
          opportunity: null,
          error: "Failed to parse JSON response from OpenAI API." 
        })
        continue
      }

      // Check if the conversation qualifies as an opportunity by ensuring a product is provided.
      if (opportunityResult.isOpportunity && opportunityResult.product) {
        console.log(`Conversation ${conv.id} qualifies as an opportunity. Creating Opportunity record.`)
        const opportunityId = crypto.randomUUID ? crypto.randomUUID() : require('uuid').v4()
        const { data: oppData, error: oppError } = await supabase
          .from("Opportunity")
          .insert([
            {
              id: opportunityId,
              userId,
              leadId: lead.id,
              product: opportunityResult.product,
              details: opportunityResult.opportunityDetails,
              status: "new",
              startDate: firstMessageDate,
              lastTouch: latestMessageDate,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ])
          .select('*')
        if (oppError || !oppData || oppData.length === 0) {
          console.error(`Error creating opportunity for conversation ${conv.id}:`, oppError)
          results.push({ 
            conversationId: conv.id, 
            lead,
            opportunity: null,
            error: "Error creating opportunity record."
          })
          continue
        }
        const opportunity = oppData[0]
        console.log(`Opportunity created with id: ${opportunity.id} for conversation ${conv.id}`)
        results.push({ conversationId: conv.id, lead, opportunity, opportunityDetails: opportunityResult.opportunityDetails })
      } else {
        console.log(`Conversation ${conv.id} does not qualify as an opportunity.`)
        results.push({ conversationId: conv.id, lead, opportunity: null })
      }
      console.log(`Finished processing conversation ${conv.id}`)
    }

    console.log("All conversations processed. Returning results:", results)
    return NextResponse.json({ results })
  } catch (error: any) {
    console.error("Error in POST handler:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

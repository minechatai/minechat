"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

interface DBMessage {
  id: string
  conversationId: string
  content: string
  sender: string
  source?: string
  date: string
  createdAt: string
  updatedAt: string
}

interface Conversation {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  messages?: DBMessage[]
  mostInquiredProduct?: string
}

interface MessageAnalysis {
  id: string
  userId: string
  conversationId?: string
  analysis: string
  createdAt: string
  updatedAt: string
}

export default function SetupAnalyzeMessagesPage() {
  const router = useRouter()

  // All conversations
  const [conversations, setConversations] = useState<Conversation[]>([])

  // Track which conversation IDs are selected
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([])

  // For existing analyses
  const [analyses, setAnalyses] = useState<MessageAnalysis[]>([])

  // New state for displaying the Most Inquired Products update result
  const [mipResult, setMipResult] = useState<string>("")

  // New state for Unique New Questions result
  const [uniqueQuestionsResult, setUniqueQuestionsResult] = useState<string>("")

  // New state for Leads & Opportunities result
  const [leadsOpportunitiesResult, setLeadsOpportunitiesResult] = useState<string>("")

  // Loading and error states
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [analysisResult, setAnalysisResult] = useState<string>("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Session error:", error)
        return
      }
      if (!data?.session) {
        router.push("/auth")
      }
    })
  }, [router])

  useEffect(() => {
    fetchConversations()
    fetchAnalyses()
  }, [])

  // Fetch all conversations for the logged-in user, limiting to the latest 100 messages per conversation
  async function fetchConversations() {
    try {
      setLoading(true)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        setErrorMessage("Error retrieving session.")
        setLoading(false)
        return
      }

      if (!sessionData?.session?.user?.id) {
        console.log("No user session, redirecting to /auth.")
        router.push("/auth")
        return
      }

      const userId = sessionData.session.user.id

      /*
        NOTE: This is the critical part for limiting nested records. 
        We do an overall select on "Conversation", and for the related 
        "ConversationMessage" we specify:

         - .order("date", { ascending: false, foreignTable: "ConversationMessage" })
         - .limit(100, { foreignTable: "ConversationMessage" })

        This will return each conversation plus only the 100 most recent messages 
        (by descending date) in ConversationMessage. 
      */
      const { data, error } = await supabase
        .from("Conversation")
        .select(
          `
            *,
            ConversationMessage(*)
          `
        )
        .eq("userId", userId)
        // Order conversations by createdAt
        .order("createdAt", { ascending: false })
        // Now limit and order the related messages
        .order("date", { ascending: false, foreignTable: "ConversationMessage" })
        .limit(100, { foreignTable: "ConversationMessage" })

      if (error) {
        setErrorMessage("Error fetching conversations.")
        console.error("Error fetching conversations:", error)
      } else if (data) {
        // Sort each conversation's messages in ascending order (oldest first) 
        // for easier reading in the UI
        const processed = data.map((conv: any) => {
          const sortedMessages = (conv.ConversationMessage ?? []).sort(
            (a: DBMessage, b: DBMessage) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          return { ...conv, messages: sortedMessages }
        })

        // Log the number of messages for each conversation
        processed.forEach((conv: any) => {
          console.log(`Conversation ${conv.id} has ${conv.messages.length} messages.`)
        })

        setConversations(processed)
      }
    } catch (err) {
      console.error("fetchConversations error:", err)
      setErrorMessage("Unknown error fetching conversations.")
    } finally {
      setLoading(false)
    }
  }


  // Fetch existing analyses from MessageAnalysis table
  async function fetchAnalyses() {
    try {
      setLoading(true)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        setErrorMessage("Error retrieving session.")
        setLoading(false)
        return
      }

      if (!sessionData?.session?.user?.id) {
        console.log("No user session, redirecting to /auth.")
        router.push("/auth")
        return
      }

      const userId = sessionData.session.user.id

      const { data, error } = await supabase
        .from("MessageAnalysis")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })

      if (error) {
        setErrorMessage("Error fetching analyses.")
        console.error("Error fetching analyses:", error)
      } else if (data) {
        setAnalyses(data as MessageAnalysis[])
      }
    } catch (err) {
      console.error("fetchAnalyses error:", err)
      setErrorMessage("Unknown error fetching analyses.")
    } finally {
      setLoading(false)
    }
  }

  // Helper to toggle conversation selection
  function toggleSelectedConversation(id: string) {
    setSelectedConversationIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((cid) => cid !== id)
      }
      return [...prev, id]
    })
  }

  // Placeholder for AI analysis logic
  async function simulateAIAnalysis(conversationId: string) {
    // For demo, just returning a mock string
    return `AI summary for conversation ID: ${conversationId}`
  }

  // Determine a user-friendly display name for the conversation
  function getConversationDisplayName(conversation: Conversation): string {
    const messages = conversation.messages || []
    const found = messages.find((msg) => {
      const lower = msg.sender.toLowerCase()
      return lower !== "ai" && lower !== "human"
    })
    if (found) {
      return found.sender
    }
    return `Conversation ${conversation.id.slice(0, 8)}`
  }

  // Handle analyze button for AI summaries
  async function handleAnalyze() {
    if (selectedConversationIds.length === 0) {
      setErrorMessage("Please select at least one conversation to analyze.")
      return
    }
    setErrorMessage("")
    setAnalysisResult("")

    try {
      setLoading(true)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        setErrorMessage("Error retrieving session.")
        setLoading(false)
        return
      }

      if (!sessionData?.session?.user?.id) {
        router.push("/auth")
        return
      }

      const userId = sessionData.session.user.id
      let combinedResults = ""

      for (const convId of selectedConversationIds) {
        // 1) Simulate AI analysis
        const summary = await simulateAIAnalysis(convId)
        combinedResults += `\n${summary}`

        // 2) Insert the result into MessageAnalysis
        const { error } = await supabase
          .from("MessageAnalysis")
          .insert({
            userId,
            conversationId: convId,
            analysis: summary
          })

        if (error) {
          console.error("Error inserting analysis:", error)
        }
      }

      setAnalysisResult(combinedResults.trim())
      fetchAnalyses()
    } catch (err) {
      console.error("handleAnalyze error:", err)
      setErrorMessage("An error occurred during analysis.")
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------
  // New Section: Find Unique New Questions (last 30 days)
  // ---------------------------------------------------
  async function handleFindUniqueNewQuestions() {
    setErrorMessage("")
    setUniqueQuestionsResult("")
    setLoading(true)

    try {
      // Get the current user's session and ID
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error("Session error:", sessionError)
        setErrorMessage("Error retrieving session.")
        setLoading(false)
        return
      }
      if (!sessionData?.session?.user?.id) {
        router.push("/auth")
        return
      }
      const userId = sessionData.session.user.id

      // Retrieve the current user's fbPageName from UserChannel
      const { data: userChannelData, error: userChannelError } = await supabase
        .from("UserChannel")
        .select("fbPageName")
        .eq("userId", userId)
        .single()
      if (userChannelError) {
        console.error("UserChannel fetch error:", userChannelError)
        setErrorMessage("Error fetching user channel information.")
        setLoading(false)
        return
      }
      const fbPageName = userChannelData?.fbPageName || ""

      // Determine the date 30 days ago
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // Build a list of all messages across conversations whose sender is not the same as fbPageName
      // and where the message date is within the last 30 days
      const filteredMessages = conversations.flatMap(conv =>
        (conv.messages || []).filter(msg => {
          return msg.sender !== fbPageName && new Date(msg.date) >= thirtyDaysAgo
        })
      )

      if (filteredMessages.length === 0) {
        setUniqueQuestionsResult("No messages available for analysis after filtering.")
        setLoading(false)
        return
      }

      // Call the find-unique-new-question endpoint
      const response = await fetch("/api/find-unique-new-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: filteredMessages })
      })

      if (!response.ok) {
        setErrorMessage(`Error calling find-unique-new-question: ${response.statusText}`)
        setLoading(false)
        return
      }

      const result = await response.json()
      // Expecting the result to have the following JSON signature:
      // { "uniqueNewQuestions": ["Question1", "Question2", ...] } or null
      const uniqueNewQuestions = result.uniqueNewQuestions
      if (!uniqueNewQuestions) {
        setUniqueQuestionsResult("No unique new questions found.")
        setLoading(false)
        return
      }

      // Insert each unique new question into the UniqueNewQuestion table.
      // Generate an id for each record and include createdAt and updatedAt fields.
      const now = new Date().toISOString()
      const insertPayload = uniqueNewQuestions.map((question: string) => ({
        id: crypto.randomUUID(),
        userId,
        question,
        createdAt: now,
        updatedAt: now
      }))

      const { error: insertError } = await supabase
        .from("UniqueNewQuestion")
        .insert(insertPayload)
      if (insertError) {
        console.error("Error inserting unique new questions:", JSON.stringify(insertError, null, 2))
        setErrorMessage("Error inserting unique new questions into database: " + JSON.stringify(insertError, null, 2))
        setLoading(false)
        return
      }

      // Display the unique new questions
      setUniqueQuestionsResult(uniqueNewQuestions.join("\n"))
    } catch (err: any) {
      console.error("handleFindUniqueNewQuestions error:", err)
      setErrorMessage("An error occurred: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------
  // New Section: Analyze Most Inquired Products
  // ---------------------------------------------------
  async function handleAnalyzeMostInquiredProducts() {
    if (conversations.length === 0) {
      setErrorMessage("No conversations found to analyze for most inquired products.")
      return
    }
    setErrorMessage("")
    setMipResult("")
    setLoading(true)

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData?.session?.user?.id) {
        router.push("/auth")
        return
      }
      const userId = sessionData.session.user.id

      // Fetch the user's products from the Product table
      const { data: productsData, error: productsError } = await supabase
        .from("Product")
        .select("*")
        .eq("userId", userId)
      if (productsError) {
        setErrorMessage("Error fetching products.")
        console.error("Products fetch error:", productsError)
        return
      }
      const productNames = productsData.map((p: any) => p.name)
      let updatedConversations = ""

      // Iterate over each conversation and update its mostInquiredProduct field
      for (const conversation of conversations) {
        const messagesPayload = conversation.messages || []
        const payload = {
          messages: messagesPayload,
          products: productNames
        }

        // Call your most-inquired-product API route
        const response = await fetch('/api/most-inquired-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          console.error(`Error analyzing conversation ${conversation.id}`)
          continue
        }

        const result = await response.json()
        const mostInquiredProduct = result.mostInquiredProduct

        // Update the conversation's record with the result
        const { error: updateError } = await supabase
          .from("Conversation")
          .update({ mostInquiredProduct })
          .eq("id", conversation.id)
        if (updateError) {
          console.error(`Error updating conversation ${conversation.id}:`, updateError)
        } else {
          updatedConversations += `Conversation ${conversation.id.slice(0, 8)}: ${mostInquiredProduct}\n`
        }
      }
      setMipResult(updatedConversations.trim())
      fetchConversations()
    } catch (err) {
      console.error("handleAnalyzeMostInquiredProducts error:", err)
      setErrorMessage("An error occurred during most inquired products analysis.")
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------
  // New Section: Analyze Leads & Opportunities
  // ---------------------------------------------------
  async function handleAnalyzeLeadsOpportunities() {
    setErrorMessage("")
    setLeadsOpportunitiesResult("")
    setLoading(true)

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error("Session error:", sessionError)
        setErrorMessage("Error retrieving session.")
        setLoading(false)
        return
      }
      if (!sessionData?.session?.user?.id) {
        router.push("/auth")
        return
      }
      const userId = sessionData.session.user.id

      // Retrieve the user's fbPageName from UserChannel table
      const { data: userChannelData, error: userChannelError } = await supabase
        .from("UserChannel")
        .select("fbPageName")
        .eq("userId", userId)
        .single()
      if (userChannelError) {
        console.error("UserChannel fetch error:", userChannelError)
        setErrorMessage("Error fetching user channel information.")
        setLoading(false)
        return
      }
      const fbPageName = userChannelData?.fbPageName || ""

      if (conversations.length === 0) {
        setErrorMessage("No conversations selected.")
        setLoading(false)
        return
      }

      // Fetch the user's products from the Product table
      const { data: productsData, error: productsError } = await supabase
        .from("Product")
        .select("*")
        .eq("userId", userId)
      if (productsError) {
        setErrorMessage("Error fetching products.")
        setLoading(false)
        return
      }
      const productNames = productsData.map((p: any) => p.name)

      console.log(productNames)

      // Prepare payload with conversation histories using only the latest 100 messages per conversation
      const payloadConversations = conversations.map(conv => {
        const latestMessages = (conv.messages || []).slice(-100)
        console.log(`Conversation ${conv.id} has ${latestMessages.length} messages in payload`)
        return {
          id: conv.id,
          history: latestMessages
        }
      })
      
      // Pass along Supabase credentials from env variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const response = await fetch("/api/analyze-leads-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          fbPageName,
          conversations: payloadConversations,
          supabaseUrl,
          supabaseKey,
          products: productNames
        })
      })

      if (!response.ok) {
        setErrorMessage("Error calling analyze leads & opportunities: " + response.statusText)
        setLoading(false)
        return
      }
      const result = await response.json()
      setLeadsOpportunitiesResult(JSON.stringify(result, null, 2))
    } catch (err) {
      console.error("handleAnalyzeLeadsOpportunities error:", err)
      setErrorMessage("An error occurred during analysis.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Analyze Messages</h2>
      <p className="text-sm text-gray-700">
        Check the conversations you want to analyze and generate AI insights. Results are stored in <code>MessageAnalysis</code>.
      </p>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded">
          {errorMessage}
        </div>
      )}

      {/* Main Flex Container: Two Columns on Desktop, Stacked on Mobile */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Column: Conversation List & Analyze Selected */}
        <div className="flex-1">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Your Conversations</label>
            {conversations.length === 0 ? (
              <div className="text-sm text-gray-500">No conversations found.</div>
            ) : (
              conversations.map((conv) => (
                <div key={conv.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedConversationIds.includes(conv.id)}
                    onChange={() => toggleSelectedConversation(conv.id)}
                  />
                  <span className="text-sm text-gray-800">{getConversationDisplayName(conv)}</span>
                  {conv.mostInquiredProduct && (
                    <span className="text-xs text-gray-600 ml-2">
                      [Most Inquired: {conv.mostInquiredProduct}]
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {loading ? "Analyzing..." : "Analyze Selected"}
          </button>
          {analysisResult && (
            <div className="bg-green-100 text-green-800 p-2 rounded text-sm whitespace-pre-wrap mt-2">
              <strong>Analysis Result:</strong>
              <p className="mt-1">{analysisResult}</p>
            </div>
          )}
        </div>

        {/* Right Column: Analyze Most Inquired Products */}
        <div className="flex-1">
          <div className="flex flex-col gap-2">
            <h3 className="text-md font-medium">Analyze Most Inquired Products</h3>
            <p className="text-sm text-gray-700">
              This process reviews every conversation’s messages and, using the available products, updates the conversation with the most inquired product.
            </p>
            <button
              onClick={handleAnalyzeMostInquiredProducts}
              disabled={loading}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              {loading ? "Analyzing..." : "Analyze Most Inquired Products"}
            </button>
            {mipResult && (
              <div className="bg-blue-100 text-blue-800 p-2 rounded text-sm whitespace-pre-wrap mt-2">
                <strong>Most Inquired Products Result:</strong>
                <p className="mt-1">{mipResult}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Section: Find Unique New Questions */}
      <div className="mt-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-md font-medium">Find Unique New Questions</h3>
          <p className="text-sm text-gray-700">
            This process analyzes all your conversation messages from the last 30 days—excluding those sent by your fbPageName—to extract any unique new questions. The resulting questions are saved to <code>UniqueNewQuestion</code>.
          </p>
          <button
            onClick={handleFindUniqueNewQuestions}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            {loading ? "Processing..." : "Find Unique New Questions"}
          </button>
          {uniqueQuestionsResult && (
            <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-sm whitespace-pre-wrap mt-2">
              <strong>Unique New Questions:</strong>
              <p className="mt-1">{uniqueQuestionsResult}</p>
            </div>
          )}
        </div>
      </div>

      {/* New Section: Analyze Leads & Opportunities */}
      <div className="mt-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-md font-medium">Analyze Leads & Opportunities</h3>
          <p className="text-sm text-gray-700">
            This process analyzes selected conversation messages to create a Lead record (using regex to extract emails and phone numbers, and choosing the sender name that isn’t your fbPageName). It then determines—via the OpenAI API—if the conversation qualifies as an Opportunity based on the available products. If so, an Opportunity record is created with the leadId set and the matched product.
          </p>
          <button
            onClick={handleAnalyzeLeadsOpportunities}
            disabled={loading}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          >
            {loading ? "Processing..." : "Analyze Leads & Opportunities"}
          </button>
          {leadsOpportunitiesResult && (
            <div className="bg-indigo-100 text-indigo-800 p-2 rounded text-sm whitespace-pre-wrap mt-2">
              <strong>Leads & Opportunities Result:</strong>
              <p className="mt-1">{leadsOpportunitiesResult}</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Analyses Section */}
      <div>
        <h3 className="text-md font-medium mb-2">Past Analyses</h3>
        {analyses.length === 0 ? (
          <div className="text-sm text-gray-600">No analyses found.</div>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">ID</th>
                <th className="border px-2 py-1 text-left">Conversation ID</th>
                <th className="border px-2 py-1 text-left">Snippet</th>
                <th className="border px-2 py-1 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((a) => (
                <tr key={a.id}>
                  <td className="border px-2 py-1">{a.id}</td>
                  <td className="border px-2 py-1">{a.conversationId || "-"}</td>
                  <td className="border px-2 py-1">{a.analysis.slice(0, 50)}...</td>
                  <td className="border px-2 py-1">{new Date(a.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client using your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET handler for webhook verification
export async function GET(request: Request) {
  console.log('Received GET request:', request.url);

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('GET parameters - mode:', mode, 'token:', token, 'challenge:', challenge);

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.warn('GET verification failed. Mode or token did not match.');
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  console.warn('GET missing mode or token');
  return new NextResponse('Bad Request', { status: 400 });
}

// POST handler to process incoming Facebook messages,
// call GPT-4o Mini with the conversation history if aiMode is enabled,
// store the reply, and send it to Messenger.
export async function POST(request: Request) {
  console.log('Received POST request.');
  try {
    // Parse the incoming JSON payload from Facebook
    const body = await request.json();
    console.log('Received webhook event:', JSON.stringify(body));

    // Validate that there is at least one messaging event in the payload
    const entry = body.entry?.[0];
    if (!entry || !entry.messaging || entry.messaging.length === 0) {
      console.warn('No messaging events found in the payload.');
      return new NextResponse('No messaging events', { status: 400 });
    }

    const messagingEvent = entry.messaging[0];
    const senderPSID = messagingEvent.sender?.id;
    const messageText = messagingEvent.message?.text;
    const recipientId = messagingEvent.recipient?.id; // This is the page that received the message

    console.log('Messaging event details:', { senderPSID, messageText, recipientId });

    if (!senderPSID || !messageText || !recipientId) {
      console.warn('Missing required fields in messaging event.');
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // --- Extra Lookup Step ---
    // Convert the recipient ID to a page name via the Graph API if needed.
    console.log(`Fetching page details for recipientId: ${recipientId}`);
    const fbAppAccessToken = process.env.FB_APP_ACCESS_TOKEN;
    if (!fbAppAccessToken) {
      throw new Error('FB_APP_ACCESS_TOKEN is missing in environment variables');
    }

    // Fetch the Page object from Facebook to get the page name.
    const pageLookupEndpoint = `https://graph.facebook.com/${recipientId}?fields=name&access_token=${fbAppAccessToken}`;
    console.log('Calling Graph API for page lookup:', pageLookupEndpoint);
    const pageLookupRes = await fetch(pageLookupEndpoint);
    const pageLookupData = await pageLookupRes.json();
    console.log('Page lookup response:', pageLookupData);

    if (!pageLookupData.name) {
      throw new Error(`Failed to retrieve page name for recipient ${recipientId}`);
    }
    const pageName = pageLookupData.name;
    console.log('Retrieved page name:', pageName);
    // --- End Extra Lookup Step ---

    // Look up the UserChannel by matching fbPageName with the page name we retrieved.
    console.log(`Looking up UserChannel for page name: ${pageName}`);
    const { data: userChannel, error: userChannelError } = await supabase
      .from('UserChannel')
      .select('*')
      .eq('fbPageName', pageName)
      .single();

    if (userChannelError || !userChannel) {
      throw new Error(`UserChannel not found for page name ${pageName}`);
    }
    console.log('UserChannel found:', userChannel);

    const pageId = userChannel.facebookPageId;
    const pageAccessToken = userChannel.facebookAccessToken;
    if (!pageId || !pageAccessToken) {
      throw new Error('Facebook Page ID or Access Token missing from UserChannel record');
    }

    // Retrieve the conversation (thread) ID using the Graph API
    console.log(`Fetching conversation for senderPSID: ${senderPSID} using pageId: ${pageId}`);
    const convEndpoint = `https://graph.facebook.com/v17.0/${pageId}/conversations?user_id=${senderPSID}&access_token=${pageAccessToken}`;
    console.log('Calling Graph API for conversation lookup:', convEndpoint);
    const convRes = await fetch(convEndpoint);
    const convData = await convRes.json();
    console.log('Conversation lookup response:', convData);

    if (!convData.data || convData.data.length === 0) {
      throw new Error('No conversation found for sender.');
    }

    // Use the first conversation returned (assuming one conversation per sender)
    const fbThreadId = convData.data[0].id;
    console.log('Using conversation thread ID:', fbThreadId);

    // Retrieve the sender's profile details (first and last name)
    console.log(`Fetching sender's profile details for senderPSID: ${senderPSID}`);
    const profileEndpoint = `https://graph.facebook.com/${senderPSID}?fields=first_name,last_name,profile_pic&access_token=${pageAccessToken}`;
    console.log('Calling Graph API for profile lookup:', profileEndpoint);
    const profileRes = await fetch(profileEndpoint);
    const profileData = await profileRes.json();
    console.log('Profile lookup response:', profileData);

    const firstName = profileData.first_name || '';
    const lastName = profileData.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    console.log('Sender full name:', fullName);

    // Check if a conversation record already exists for this sender PSID.
    console.log(`Looking up existing conversation for senderPSID: ${senderPSID}`);
    const { data: existingConversation, error: convLookupError } = await supabase
      .from('Conversation')
      .select('*')
      .eq('recipientPageScopeId', senderPSID)
      .single();

    let conversationRecord;
    if (convLookupError || !existingConversation) {
      console.log('No existing conversation found. Creating a new conversation record.');
      // Create a new conversation record if one does not exist.
      const { data, error } = await supabase
        .from('Conversation')
        .insert({
          userId: userChannel.userId,
          recipientPageScopeId: senderPSID,  // Sender's PSID
          updatedAt: new Date(),
        })
        .select()
        .single();
      if (error) {
        throw new Error(`Error creating conversation: ${error.message}`);
      }
      conversationRecord = data;
      console.log('New conversation record created:', conversationRecord);
    } else {
      conversationRecord = existingConversation;
      console.log('Existing conversation record found:', conversationRecord);
    }

    // Insert the user's message into the ConversationMessage table
    console.log('Inserting new user message into ConversationMessage table.');
    const { data: insertedMessage, error: msgError } = await supabase
      .from('ConversationMessage')
      .insert({
        id: uuidv4(), // Generate a unique id for the message
        conversationId: conversationRecord.id, // Foreign key to Conversation
        content: messageText,
        sender: fullName,
        source: 'Facebook',
        // sentByAI is not set here, default will be false.
        updatedAt: new Date().toISOString() // Explicitly set updatedAt to the current timestamp
      })
      .select()
      .single();

    if (msgError) {
      throw new Error(`Error inserting user message: ${msgError.message}`);
    }
    console.log('User message inserted successfully:', insertedMessage);

    // If the conversation's aiMode is false, do not call the GPT API or send an automated reply.
    if (!conversationRecord.aiMode) {
      console.log("AI mode is disabled for this conversation. Skipping automated AI reply.");
      return NextResponse.json(
        { message: 'Message stored. AI mode is disabled, no AI reply sent.' },
        { status: 200 }
      );
    }

    // ------------- Begin GPT-4o Mini Integration -------------
    // Fetch additional assistant configuration and business info from Supabase
    console.log('Fetching assistant setup and business info from Supabase...');
    const { data: assistantSetup, error: assistantSetupError } = await supabase
      .from('AIAssistantSetup')
      .select('*')
      .eq('userId', userChannel.userId)
      .single();
    if (assistantSetupError || !assistantSetup) {
      throw new Error(`Error fetching AIAssistantSetup: ${assistantSetupError?.message || 'No record found'}`);
    }
    console.log('Assistant Setup:', assistantSetup);
/*
    const { data: businessInfo, error: businessInfoError } = await supabase
      .from('BusinessInfo')
      .select('*')
      .eq('userId', userChannel.userId)
      .single();
    if (businessInfoError || !businessInfo) {
      throw new Error(`Error fetching BusinessInfo: ${businessInfoError?.message || 'No record found'}`);
    }
    console.log('Business Info:', businessInfo);
*/
    // Retrieve the last 50 conversation messages, sorted by date (latest first, then reverse order)
    console.log(`Fetching last 50 messages for conversation ID: ${conversationRecord.id}`);
    const { data: conversationHistory, error: historyError } = await supabase
      .from('ConversationMessage')
      .select('*')
      .eq('conversationId', conversationRecord.id)
      .order('date', { ascending: false })
      .limit(10);
    if (historyError) {
      throw new Error(`Error fetching conversation history: ${historyError.message}`);
    }
    // Reverse to ensure messages are in chronological order (oldest first)
    conversationHistory.reverse();
    console.log('Conversation history (last 50 messages):', conversationHistory);

    // Construct the prompt messages for GPT by mapping conversation messages
    const promptMessages = conversationHistory.map((msg: any) => {
      let role = 'user';
      if (msg.source && msg.source.toLowerCase() === 'gpt') {
        role = 'assistant';
      }
      if (msg.sender === pageName) {
        role = 'assistant';
      }
      return { role, content: msg.content };
    });

    // Prepend a system message containing the assistant configuration and business info
    const systemContent = `Assistant Name: ${assistantSetup.assistantName}\n` +
                            `Introduction Message: ${assistantSetup.introMessage}\n` +
                            `Business Info: ${assistantSetup.shortDescription}`;
    promptMessages.unshift({ role: 'system', content: systemContent });
    console.log('Constructed promptMessages (with system message):', promptMessages);

    // Call the GPT-4o Mini API
    console.log('Calling GPT-4o Mini API...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: promptMessages,
      }),
    });
    const openaiData = await openaiResponse.json();
    console.log('GPT API response:', openaiData);
    if (!openaiData.choices || openaiData.choices.length === 0) {
      throw new Error('No choices returned from GPT API');
    }
    const gptReply = openaiData.choices[0].message.content;
    console.log('GPT reply:', gptReply);

    // Insert the GPT response into the ConversationMessage table with sentByAI set to true.
    console.log('Inserting GPT response into ConversationMessage table...');
    const { data: insertedGPTMessage, error: gptMsgError } = await supabase
      .from('ConversationMessage')
      .insert({
        id: uuidv4(),
        conversationId: conversationRecord.id,
        content: gptReply,
        sender: pageName,   // Mark as bot message
        source: 'Facebook', // To help differentiate in the history
        sentByAI: true,
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();
    if (gptMsgError) {
      throw new Error(`Error inserting GPT response: ${gptMsgError.message}`);
    }
    console.log('GPT response inserted successfully:', insertedGPTMessage);

    // Send the GPT response to Facebook Messenger
    console.log('Sending GPT response to Facebook Messenger...');
    const fbSendEndpoint = `https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`;
    const fbSendPayload = {
      recipient: { id: senderPSID },
      message: { text: gptReply },
    };
    console.log('Facebook Send Payload:', fbSendPayload);
    const fbSendResponse = await fetch(fbSendEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fbSendPayload),
    });
    const fbSendData = await fbSendResponse.json();
    console.log('Facebook Send API response:', fbSendData);
    // ------------- End GPT-4o Mini Integration -------------

    return NextResponse.json(
      { message: 'Message stored and GPT response sent successfully', data: insertedGPTMessage },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error processing POST request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

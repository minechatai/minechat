import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize your own Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase URL or Service Role Key in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * Helper function to upsert data into a given table with retry logic.
 * @param table - The Supabase table name.
 * @param data - The data to upsert.
 * @param retries - Number of retry attempts (default 3).
 * @param delay - Delay between attempts in ms (default 3000).
 */
async function upsertWithRetry(
  table: string,
  data: any,
  retries: number = 3,
  delay: number = 3000
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    const { error } = await supabase.from(table).upsert(data);
    if (!error) {
      return;
    }
    console.error(`Error upserting into ${table}, attempt ${i + 1}:`, error);
    if (i < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      throw error;
    }
  }
}

/**
 * Splits an array into chunks of a specified size.
 * @param array - The array to split.
 * @param size - The maximum chunk size.
 * @returns An array of chunks.
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export async function POST(request: Request) {
  console.log("Received POST request:", request.url);

  // Parse the JSON body for facebookPageId, accessToken, and userId
  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { facebookPageId, accessToken, userId } = body;
  console.log("Request body parameters:", { facebookPageId, accessToken, userId });

  if (!facebookPageId || !accessToken || !userId) {
    console.error("Missing facebookPageId, accessToken or userId");
    return NextResponse.json(
      { error: "Missing facebookPageId, accessToken or userId" },
      { status: 400 }
    );
  }

  // Fetch all paginated conversation pages from Facebook.
  // Note: we now request the "participants" field so we can extract the recipient.
  console.log("Fetching Facebook conversation pages for pageId:", facebookPageId);
  const conversationList = await fetchFacebookConversationPages(facebookPageId, accessToken);
  console.log(`Fetched ${conversationList.length} conversations.`);

  // Process conversations in two phases.
  await processConversationsInParallel(conversationList, accessToken, userId, facebookPageId);
  console.log("All conversations processed successfully.");

  return NextResponse.json({ success: true, message: "Conversations synced" });
}

/**
 * Fetch all paginated conversation pages from Facebook.
 * @param pageId - The Facebook page ID.
 * @param accessToken - The Facebook access token.
 * @returns An array of conversation objects.
 */
async function fetchFacebookConversationPages(
  pageId: string,
  accessToken: string
): Promise<any[]> {
  let conversations: any[] = [];
  // Request the participants field so we can determine the recipient.
  let url = `https://graph.facebook.com/v12.0/${pageId}/conversations?fields=participants&access_token=${accessToken}`;
  while (url) {
    console.log("Fetching conversations from URL:", url);
    const res = await fetch(url);
    const data = await res.json();
    if (data.data) {
      console.log(`Fetched ${data.data.length} conversations from current page.`);
      conversations.push(...data.data);
    } else {
      console.warn("No conversation data found on current page.");
    }
    if (data.paging && data.paging.next) {
      url = data.paging.next;
    } else {
      url = '';
    }
  }
  console.log("Completed fetching conversations. Total count:", conversations.length);
  return conversations;
}

/**
 * Processes conversations in two phases:
 * 1. Upsert all conversation records concurrently in chunks of 100.
 * 2. Process all messages for those conversations concurrently in chunks of 100.
 *
 * The conversation upsert now includes the recipientPageScopeId field, which is determined
 * by checking the participants and picking the one whose id does not match the facebookPageId.
 */
async function processConversationsInParallel(
  conversations: any[],
  accessToken: string,
  userId: string,
  facebookPageId: string
): Promise<void> {
  console.log(`Total conversations to process: ${conversations.length}`);
  const chunkSize = 100;
  const conversationChunks = chunkArray(conversations, chunkSize);
  console.log(`Processing in ${conversationChunks.length} chunk(s) of up to ${chunkSize} conversations each.`);

  // Phase 1: Upsert conversation records (100 at a time)
  for (const chunk of conversationChunks) {
    console.log(`Upserting ${chunk.length} conversation records in this chunk.`);
    await Promise.all(
      chunk.map((conversation) => {
        console.log(`Upserting conversation with ID: ${conversation.id}`);
        let recipientPageScopeId = null;
        if (conversation.participants && conversation.participants.data) {
          // Select the participant whose id does not match the current page.
          const recipient = conversation.participants.data.find((p: any) => p.id !== facebookPageId);
          if (recipient) {
            recipientPageScopeId = recipient.id;
          }
        }
        return upsertWithRetry("Conversation", {
          id: conversation.id,
          userId: userId,
          recipientPageScopeId: recipientPageScopeId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      })
    );
  }
  console.log("All conversation records upserted successfully.");

  // Phase 2: Process messages for each conversation (100 at a time)
  for (const chunk of conversationChunks) {
    console.log(`Processing messages for ${chunk.length} conversations in this chunk.`);
    await Promise.all(
      chunk.map((conversation) => {
        console.log(`Processing messages for conversation with ID: ${conversation.id}`);
        return processMessagesForConversation(conversation, accessToken, userId);
      })
    );
  }
  console.log("All conversation messages processed successfully.");
}

/**
 * For a given conversation, fetch its messages (handling pagination)
 * and upsert each message concurrently.
 */
async function processMessagesForConversation(
  conversation: any,
  accessToken: string,
  userId: string
): Promise<void> {
  const conversationId = conversation.id;
  console.log("Fetching messages for conversation ID:", conversationId);
  let url = `https://graph.facebook.com/v12.0/${conversationId}/messages?fields=message,created_time,from&access_token=${accessToken}&limit=100`;
  let messages: any[] = [];

  // Gather all messages (pagination is handled sequentially)
  while (url) {
    console.log(`Fetching messages from URL: ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    if (data.data) {
      console.log(`Fetched ${data.data.length} messages from current page for conversation ${conversationId}`);
      messages.push(...data.data);
    } else {
      console.warn(`No messages found for conversation ${conversationId}`);
    }
    if (data.paging && data.paging.next) {
      url = data.paging.next;
    } else {
      url = '';
    }
  }
  console.log(`Total messages fetched for conversation ${conversationId}: ${messages.length}`);

  // Upsert each message concurrently.
  await Promise.all(
    messages.map(async (msg) => {
      const messageData = {
        id: msg.id,
        conversationId: conversationId,
        content: msg.message || '',
        sender: msg.from?.name || "Unknown",
        source: "Facebook",
        date: new Date(msg.created_time).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      try {
        await upsertWithRetry("ConversationMessage", messageData);
        console.log(`Successfully upserted message ${msg.id} for conversation ${conversationId}`);
      } catch (error) {
        console.error(`Error upserting message ${msg.id} for conversation ${conversationId}`, error);
      }
    })
  );
  console.log(`Processed ${messages.length} messages for conversation ${conversationId}`);
}

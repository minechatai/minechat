import { CONSTANTS } from "@/lib/constants"
import { supabase } from "@/lib/supabase-client"

export interface DBMessage {
  id: string
  conversationId: string
  content: string
  sender: string
  source: string | null
  date: string
  createdAt: string
  updatedAt: string
}

interface DBConversation {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface DBConversationWithLatest extends DBConversation {
  aiMode?: boolean
  recipientPageScopeId?: string | null
  latestMessage?: DBMessage | null
  messages?: DBMessage[]
}

export class Chat {

    async fetchUserChannel(onSuccess: any, onError: any) {
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData?.session) {
            onError(CONSTANTS.ERROR_AUTH)
            return
        }
        const userId = sessionData.session.user.id
        const { data, error } = await supabase
        .from("UserChannel")
        .select("fbPageName")
        .eq("userId", userId)
        .maybeSingle()

        console.log(data, error)

        if (error) {
            onError(CONSTANTS.ERROR_GENERIC, error)
            return
        }

        onSuccess(data)
    }

    async fetchConversations(from: number, to: number, thisUserId: string, onSuccess: any, onError: any) {

        const processConversation = async (conv: DBConversationWithLatest) => {
            
            let latestMessage: DBMessage | null = null

            if (thisUserId) {
                
                const { data: msgData, error: msgError } = await supabase
                    .from("ConversationMessage")
                    .select("*")
                    .eq("conversationId", conv.id)
                    .neq("sender", thisUserId)
                    .order("date", { ascending: false })
                    .limit(1)

                if (msgError) {
                    console.error("Error fetching latest message for conversation", conv.id, msgError)
                }
                
                if (msgData && msgData.length > 0) {
                    latestMessage = msgData[0]
                }
                else {
                    // Fallback: fetch the latest message regardless of sender.
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from("ConversationMessage")
                        .select("*")
                        .eq("conversationId", conv.id)
                        .order("date", { ascending: false })
                        .limit(1)
                    
                        if (fallbackError) {
                        console.error("Error fetching fallback latest message for conversation", conv.id, fallbackError)
                    }

                    if (fallbackData && fallbackData.length > 0) {
                        latestMessage = fallbackData[0]
                    }
                }
            } 
            else {
                // If thisUserId not set, just fetch the latest message.
                const { data: msgData, error: msgError } = await supabase
                    .from("ConversationMessage")
                    .select("*")
                    .eq("conversationId", conv.id)
                    .order("date", { ascending: false })
                    .limit(1)
                
                if (msgError) {
                    console.error("Error fetching latest message for conversation", conv.id, msgError)
                }
                
                if (msgData && msgData.length > 0) {
                    latestMessage = msgData[0]
                }
            }

            return { ...conv, latestMessage }
        }

        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData?.session) {
          onError(CONSTANTS.ERROR_AUTH)
          return
        }

        const userId = sessionData.session.user.id
        const { data, error } = await supabase
          .from("Conversation")
          .select("id, userId, createdAt, updatedAt, aiMode, recipientPageScopeId")
          .eq("userId", userId)
          .order("createdAt", { ascending: false })
          .range(from, to)
        
        if (error) {
          onError(CONSTANTS.ERROR_GENERIC)
          return
        }
        
        if (data) {
            onSuccess(await Promise.all(data.map(processConversation)))
        }
    }

    async getConversationMessages(conversation: DBConversationWithLatest, onSuccess: any, onError: any) {
      
      const { data, error } = await supabase
        .from("ConversationMessage")
        .select("*")
        .eq("conversationId", conversation.id)
        .order("date", { ascending: false })
        .limit(100)
      
      if (error) {
        onError(CONSTANTS.ERROR_GENERIC)
        return
      }
      
      // Reverse the messages to show them in chronological order (oldest first)
      const messages = data ? data.reverse() : [];
      const conversationWithMessages = { ...conversation, messages }

      onSuccess(conversationWithMessages)
    }
}
import { CONSTANTS } from "./constants"
import { supabase } from "./supabase-client"

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

export interface Chat {
  id: string
  name: string
  lastMessage: string
  timestamp: string
}

export interface DBConversationWithLatest extends DBConversation {
  aiMode?: boolean
  recipientPageScopeId?: string | null
  latestMessage?: DBMessage | null
  messages?: DBMessage[]
}

export class ChatHandler {

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
        
        console.log("fetchconvo", data, error)

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

    registerConversationTableListener(onRecordInserted: any) {
        const subscription = supabase
        .channel('conversation-messages-all')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ConversationMessage'
          },
          onRecordInserted
        )
        .subscribe()
  
      return () => {
        supabase.removeChannel(subscription)
      }
    }

    async getChatList(onSuccess: any, onError: any) {
      
      const getFbName = async (userId: string) => {
        const { data, error } = await supabase
          .from("UserChannel")
          .select("fbPageName")
          .eq("userId", userId)
          .maybeSingle()

          console.log("getFbName", data, error)
        
          if (error) {
              return null
          }
          
          return data.fbPageName
      }

      const getConversations = async (userId: string, from: Date, to: Date) => {
        const { data, error } = await supabase
          .from("Conversation")
          .select("id, userId, createdAt, updatedAt, aiMode, recipientPageScopeId")
          .eq("userId", userId)
          .order("createdAt", { ascending: false })
          .range(from, to)
      
        console.log("getConversations", data, error)
        
        if (error) {
          return null
        }
      
        return data
      }

      const convertToChatInfo = async (conv: any, filter: string): Promise<Chat> => {
        
        const { data, error } = await supabase
          .from("ConversationMessage")
          .select("sender, content, date")
          .eq("conversationId", conv.id)
          .neq("sender", filter)
          .order("date", { ascending: false })
          .limit(1)

        console.log("convertToChatInfo", data, error)

        if (error != null || data.length < 1) {
          return {
            id: "",
            name: "",
            lastMessage: "",
            timestamp: ""
          }
        }

        return {
          id: conv.id,
          name: data[0].sender,
          lastMessage: data[0].content,
          timestamp: data[0].date
        }
      }

      const getSession = async () => {

        const { data, error } = await supabase.auth.getSession()
        
        console.log("getConversations", data, error)

        if (data == null || data.session == null) {
          return null
        }

        return data
      }

      const sessionData = await getSession()
      if (sessionData == null) {
        onError(CONSTANTS.ERROR_SESSION, "no session data retrieved")
      }
      
      const userId = sessionData.session.user.id
      let fbPageName = await getFbName(userId)
      let fromRange = new Date(0)
      let toRange = new Date()
      toRange.setDate(toRange.getDate() + 2)

      let conversations = await getConversations(userId, fromRange, toRange)

      if (conversations == null) {
        onError(CONSTANTS.ERROR_GENERIC, "no conversation retrieved")
      }

      let chatInfo = await Promise.all(
        conversations.map(
          (conversationData: any) => convertToChatInfo(conversationData, fbPageName)
        )
      )
      onSuccess(chatInfo.filter((element: any) => element.id != ''))
    }
}
import { CONSTANTS } from "./constants"


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

    supabaseInterface: any

    setSupabaseInterface(obj: any) {
        this.supabaseInterface = obj
    }

    async fetchUserChannel(onSuccess: any, onError: any) {

        const user = this.supabaseInterface.getUser()
        const userId = user.id
        console.log("Current User ID:", userId)

        let supabase = this.supabaseInterface.getClient()

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

        const user = this.supabaseInterface.getUser()
        const userId = user.id
        console.log("Current User ID:", userId)

        let supabase = this.supabaseInterface.getClient()

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

    async getConversationMessages(conversationId: string, onSuccess: any, onError: any) {
      
      let supabase = this.supabaseInterface.getClient()

      const { data, error } = await supabase
        .from("ConversationMessage")
        .select("*")
        .eq("conversationId", conversationId)
        .order("date", { ascending: false })
        .limit(100)
      
      if (error) {
        onError(CONSTANTS.ERROR_GENERIC)
        return
      }
      
      // Reverse the messages to show them in chronological order (oldest first)
      const messages = data ? data.reverse() : [];

      onSuccess(messages)
    }

    async sendMessage(conversationId: string, newMessage: string, onSuccess: any, onError: any) {

      const getFacebookToken = async () => {
        
        const user = this.supabaseInterface.getUser()
        const userId = user.id
        console.log("Current User ID:", userId)

        let supabase = this.supabaseInterface.getClient()

        const { data, error } = await supabase
          .from("UserChannel")
          .select("facebookAccessToken")
          .eq("userId", userId)
          .maybeSingle()

        console.log(data, error)

        if (error) {
            return null
        }

        return data.facebookAccessToken
      }

      const getFacebookPageScopeId = async (id: string) => {
        
        let supabase = this.supabaseInterface.getClient()

        const { data, error } = await supabase
          .from("Conversation")
          .select("recipientPageScopeId")
          .eq("id", id)
          .maybeSingle()

        console.log(data, error)

        if (error) {
            return null
        }

        return data.recipientPageScopeId
      }

      try {
        // Prepare a timestamp for the inserted record
        const now = new Date().toISOString()
        const fbAccessToken = await getFacebookToken()
        const fbPageScopeId = await getFacebookPageScopeId(conversationId)
  
        const supabase = this.supabaseInterface.getClient()

        // 1. Insert the message into your ConversationMessage table using Supabase,
        // supplying an id manually using uuid() along with the createdAt, updatedAt, and date fields.
        const { error: insertError } = await supabase
          .from("ConversationMessage")
          .insert({
            id: crypto.randomUUID(), // Provide a new uuid for the id column
            conversationId: conversationId,
            content: newMessage.trim(),
            sender: "Minechat AI",
            source: "Facebook",
            date: now,
            createdAt: now,
            updatedAt: now
          })
  
        if (insertError) {
          onError(CONSTANTS.ERROR_GENERIC, insertError)
          return
        }
  
        let facebookParams = {
          conversationId: conversationId,
          message: newMessage.trim(),
          recipientPageScopeId: fbPageScopeId,
          facebookAccessToken: fbAccessToken
        }

        console.log("facebookparams", facebookParams)

        // 2. Call the API route to send the message to the Facebook user
        const response = await fetch("/api/facebook/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(facebookParams)
        })
  
        const result = await response.json()
  
        if (!result.success) {
          onError(CONSTANTS.ERROR_GENERIC, result.error)
        }
        else {
          onSuccess()
        }
      } 
      catch (error) {
        onError(CONSTANTS.ERROR_GENERIC, error)
      }
    }

    registerMessagesTableListener(onRecordInserted: any) {
      
        let supabase = this.supabaseInterface.getClient()

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
    
    registerConversationTableListener(onRecordInserted: any) {
      
      let supabase = this.supabaseInterface.getClient()

      const subscription = supabase
      .channel('conversation-header')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Conversation'
        },
        onRecordInserted
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }

    async getChatList(onSuccess: any, onError: any) {
      
      const user = this.supabaseInterface.getUser()
      const userId = user.id
      console.log("Current User ID:", userId)

      let supabase = this.supabaseInterface.getClient()

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
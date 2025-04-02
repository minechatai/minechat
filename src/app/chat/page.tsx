// chat/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import ChatList from "./_components/chat-list"
import ConversationView from "./_components/conversation-view"

interface DBMessage {
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

export default function ChatPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<DBConversationWithLatest[]>([])
  const [selectedConversation, setSelectedConversation] = useState<DBConversationWithLatest | null>(null)
  const [page, setPage] = useState(0)
  const [fbPageName, setFbPageName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 10

  // Fetch fbPageName (runs once)
  useEffect(() => {
    const fetchUserChannel = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) {
        router.push("/auth")
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
        console.error("Error fetching UserChannel:", error)
      }
      setFbPageName(data?.fbPageName || null)
    }
    fetchUserChannel()
  }, [router])

  // Fetch conversations using pagination (appended on page change)
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) {
        router.push("/auth")
        return
      }
      const userId = sessionData.session.user.id
      const { data, error } = await supabase
        .from("Conversation")
        .select("id, userId, createdAt, updatedAt, aiMode, recipientPageScopeId")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)
      
      if (error) {
        console.error("Error fetching conversations:", error)
        setLoading(false)
        return
      }
      if (data) {
        // For each conversation, fetch its latest message.
        // We try to get a message whose sender is not fbPageName.
        const updatedConversations: DBConversationWithLatest[] = await Promise.all(
          data.map(async (conv: DBConversationWithLatest) => {
            let latestMessage: DBMessage | null = null
            if (fbPageName) {
              const { data: msgData, error: msgError } = await supabase
                .from("ConversationMessage")
                .select("*")
                .eq("conversationId", conv.id)
                .neq("sender", fbPageName)
                .order("date", { ascending: false })
                .limit(1)
              if (msgError) {
                console.error("Error fetching latest message for conversation", conv.id, msgError)
              }
              if (msgData && msgData.length > 0) {
                latestMessage = msgData[0]
              } else {
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
            } else {
              // If fbPageName not set, just fetch the latest message.
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
          })
        )
        if (data.length < pageSize) {
          setHasMore(false)
        }
        if (page === 0) {
          setConversations(updatedConversations)
        } else {
          setConversations(prev => [...prev, ...updatedConversations])
        }
      }
      setLoading(false)
    }

    fetchConversations().catch((err) => {
      console.error("Chat fetch error:", err)
      setLoading(false)
    })
  }, [page, fbPageName, router])

  // When a conversation is selected, load its full messages.
  const handleSelectConversation = async (conversation: DBConversationWithLatest) => {
    const { data, error } = await supabase
      .from("ConversationMessage")
      .select("*")
      .eq("conversationId", conversation.id)
      .order("date", { ascending: false })
      .limit(100)
    if (error) {
      console.error("Error fetching conversation messages:", error)
      return
    }
    // Reverse the messages to show them in chronological order (oldest first)
    const messages = data ? data.reverse() : [];
    const conversationWithMessages = { ...conversation, messages }
    setSelectedConversation(conversationWithMessages)
  }

  // Called when the conversation list scrolls to the bottom.
  const loadMoreConversations = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  // Global realtime subscription for all conversation messages
  useEffect(() => {
    console.log('before subscription')
    const subscription = supabase
      .channel('conversation-messages-all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ConversationMessage'
        },
        (payload: { new: DBMessage }) => {
          const newMsg = payload.new
          // Update the conversation list if this conversation is already loaded.
          setConversations((prevConversations) =>
            prevConversations.map((conv) => {
              if (conv.id === newMsg.conversationId) {
                return { ...conv, latestMessage: newMsg }
              }
              return conv
            })
          )
          // If the currently selected conversation matches, update its messages.
          setSelectedConversation((prev) => {
            if (prev && prev.id === newMsg.conversationId) {
              const messages = prev.messages || []
              if (messages.find((msg) => msg.id === newMsg.id)) return prev
              return { ...prev, messages: [...messages, newMsg] }
            }
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  return (
    <div className="h-screen overflow-hidden flex flex-row bg-gray-50 text-black">
      <ChatList
        fbPageName={fbPageName}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onLoadMore={loadMoreConversations}
        activeConversationId={selectedConversation ? selectedConversation.id : null}
      />

      <ConversationView conversation={selectedConversation} />
    </div>
  )
}

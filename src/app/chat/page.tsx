// chat/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import ChatList from "./_components/chat-list"
import ConversationView from "./_components/conversation-view"

import { DBMessage, DBConversationWithLatest, Chat } from "@/lib/chat-lib"
import { CONSTANTS } from "@/lib/constants"

let chatInterface = new Chat();

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
        chatInterface.fetchUserChannel(
            (data: any) => {
                setFbPageName(data?.fbPageName || null)
            },
            (errorCode: number, errorMessage: any) => {
                if (errorCode == CONSTANTS.ERROR_AUTH) {
                    router.push("/auth")
                }
                else {
                    console.error("Error fetching UserChannel:", errorMessage)
                }
            }
        )
    }
    fetchUserChannel()
  }, [router])

  // Fetch conversations using pagination (appended on page change)
  useEffect(() => {

    const fetchConversations = async () => {
      setLoading(true)
      await chatInterface.fetchConversations(
        page * pageSize, 
        (page + 1) * pageSize - 1,
        fbPageName,
        async (data: any) => {

            if (data.length < pageSize) {
                setHasMore(false)
            }

            if (page === 0) {
                setConversations(data)
            } else {
                setConversations((prev: any) => [...prev, ...data])
            }
        },
        (errorCode: number, errorMessage: any) => {
            if (errorCode == CONSTANTS.ERROR_AUTH) {
                router.push("/auth")
            }
            else {
                console.error("Error fetching fetchConversations:", errorMessage)
            }
        }
      )
      setLoading(false)
    }
    
    fetchConversations().catch((err) => {
      console.error("Chat fetch error:", err)
      setLoading(false)
    })
  }, [page, fbPageName, router])

  // When a conversation is selected, load its full messages.
  const handleSelectConversation = async (conversation: DBConversationWithLatest) => {
    chatInterface.getConversationMessages(
        conversation,
        (conversationWithMessages: any) => {
            setSelectedConversation(conversationWithMessages)
        },
        (error: any) => {
            console.error("Error fetching conversation messages:", error)
        }
    )
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

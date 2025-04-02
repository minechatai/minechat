// chat/_components/conversation-view.tsx
"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase-client"
import { v4 as uuid } from "uuid" // Import uuid to generate ids

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

interface DBConversationWithLatest {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  recipientPageScopeId?: string | null // holds the Facebook recipient ID
  aiMode?: boolean                  // new field to indicate AI mode
  latestMessage?: DBMessage | null
  messages?: DBMessage[]
}

interface ConversationViewProps {
  conversation: DBConversationWithLatest | null
}

export default function ConversationView({ conversation }: ConversationViewProps) {
  // Instead of a separate isHumanMode state, initialize from conversation.aiMode.
  // Here, aiMode === true means "AI Mode Is Enabled" and false means "Human Mode Is Enabled".
  const [aiMode, setAiMode] = useState<boolean>(conversation?.aiMode ?? true)
  const [fbPageName, setFbPageName] = useState<string | null>(null)
  const [fbAccessToken, setFbAccessToken] = useState<string | null>(null)
  const [recipientPageScopeId, setRecipientPageScopeId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  // Local state for messages to enable realtime updates
  const [messagesState, setMessagesState] = useState<DBMessage[]>([])

  // Ref to immediately jump to the latest message
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Fetch the logged-in user's channel details (fbPageName and facebookAccessToken)
  useEffect(() => {
    async function fetchUserChannel() {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from("UserChannel")
          .select("fbPageName, facebookAccessToken")
          .eq("userId", user.id)
          .maybeSingle()

        console.log(data, error)

        if (error) {
          console.error("Error fetching UserChannel:", error)
        }
        else if (data) {
          setFbPageName(data.fbPageName)
          setFbAccessToken(data.facebookAccessToken)
        }
        else {
            console.warn("No records received.")
        }
      } else {
        console.error("No user logged in", userError)
      }
    }
    fetchUserChannel()
  }, [])

  // Fetch the recipientPageScopeId for the conversation if not already provided in the prop
  useEffect(() => {
    async function fetchConversationDetails() {
      if (conversation) {
        if (conversation.recipientPageScopeId) {
          setRecipientPageScopeId(conversation.recipientPageScopeId)
        } else {
          const { data, error } = await supabase
            .from("Conversation")
            .select("recipientPageScopeId")
            .eq("id", conversation.id)
            .single()
          if (data) {
            setRecipientPageScopeId(data.recipientPageScopeId)
          } else {
            console.error("Error fetching conversation details:", error)
          }
        }
      }
    }
    fetchConversationDetails()
  }, [conversation])

  // When the conversation prop changes, update the local messages state and aiMode state.
  useEffect(() => {
    if (conversation) {
      setMessagesState(conversation.messages ?? [])
      if (typeof conversation.aiMode === "boolean") {
        setAiMode(conversation.aiMode)
      }
    }
  }, [conversation])

  // Compute the customer's name from the conversation.
  const customerName = useMemo(() => {
    if (!conversation) return "Unknown Customer"
    if (!fbPageName) return conversation.latestMessage ? conversation.latestMessage.sender : "Customer"
    // Prefer the latest message that is not from our own channel
    if (conversation.latestMessage && conversation.latestMessage.sender.toLowerCase() !== fbPageName.toLowerCase()) {
      return conversation.latestMessage.sender
    }
    // Otherwise, search in the messages array (using conversation.messages if available, otherwise messagesState)
    const msgs = conversation.messages ?? messagesState
    const customerMsg = msgs.find(msg => msg.sender.toLowerCase() !== fbPageName.toLowerCase())
    return customerMsg ? customerMsg.sender : "Customer"
  }, [conversation, fbPageName, messagesState])

  // Immediately jump to the latest message whenever messagesState updates.
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" })
    }
  }, [messagesState])

  // Handle sending the message when the user presses Enter or clicks Send
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return
    if (!conversation) return
    if (!recipientPageScopeId || !fbAccessToken) {
      console.error("Missing recipientPageScopeId or facebookAccessToken")
      return
    }
    setSending(true)

    try {
      // Prepare a timestamp for the inserted record
      const now = new Date().toISOString()

      // 1. Insert the message into your ConversationMessage table using Supabase,
      // supplying an id manually using uuid() along with the createdAt, updatedAt, and date fields.
      const { error: insertError } = await supabase
        .from("ConversationMessage")
        .insert({
          id: uuid(), // Provide a new uuid for the id column
          conversationId: conversation.id,
          content: newMessage.trim(),
          sender: "Minechat AI",
          source: "Facebook",
          date: now,
          createdAt: now,
          updatedAt: now
        })

      if (insertError) {
        console.error("Error inserting conversation message:", insertError)
        setSending(false)
        return
      }

      // 2. Call the API route to send the message to the Facebook user
      const response = await fetch("/api/facebook/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          message: newMessage.trim(),
          recipientPageScopeId,
          facebookAccessToken: fbAccessToken
        })
      })

      const result = await response.json()

      if (!result.success) {
        console.error("Error sending message via API:", result.error)
      }
    } catch (error) {
      console.error("Network error sending message:", error)
    } finally {
      setSending(false)
    }
  }, [newMessage, conversation, recipientPageScopeId, fbAccessToken])

  // Handle toggling between AI and Human mode.
  // When toggled, update the conversation record’s aiMode in Supabase.
  const handleToggleMode = async () => {
    if (!conversation) return
    const newAiMode = !aiMode
    const { error } = await supabase
      .from("Conversation")
      .update({ aiMode: newAiMode })
      .eq("id", conversation.id)
    if (error) {
      console.error("Error updating AI mode:", error)
      return
    }
    setAiMode(newAiMode)
  }

  // Trigger send when the user presses Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a conversation from the left
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-300">
        <div>
          <div className="font-bold text-lg">{customerName}</div>
          <div className={`text-sm mt-1 ${aiMode ? "text-blue-600" : "text-pink-600"}`}>
            {aiMode ? "AI Mode Is Enabled" : "Human Mode Is Enabled"}
          </div>
        </div>
        <button
          onClick={handleToggleMode}
          className={`px-3 py-1 rounded text-white text-sm transition-colors ${
            aiMode
              ? "bg-[--accent-blue] hover:bg-blue-700"
              : "bg-[--accent-red] hover:bg-red-700"
          }`}
        >
          Toggle to {aiMode ? "Human" : "AI"}
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white relative">
        {messagesState.map((msg) => {
          const isRight = fbPageName && msg.sender.toLowerCase() === fbPageName.toLowerCase()
          return (
            <div key={msg.id} className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
              <div className={`relative group max-w-xs px-4 py-2 rounded-lg text-sm shadow ${isRight ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                {msg.content}
                <div className={`
                  absolute bottom-full left-1/2 -translate-x-1/2
                  mb-1 px-2 py-1 bg-black text-white text-xs
                  rounded shadow-md whitespace-nowrap z-50
                  opacity-0 scale-95
                  group-hover:opacity-100 group-hover:scale-100
                  transition-all duration-200
                `}>
                  <div><strong>ID:</strong> {msg.id}</div>
                  <div><strong>Date:</strong> {new Date(msg.date).toLocaleString()}</div>
                  {msg.source && (
                    <div><strong>Source:</strong> {msg.source}</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {/* Dummy element for scrolling into view */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-300 bg-white">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-[--accent-blue] outline-none"
            disabled={sending}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSendMessage}
            disabled={sending}
            className="ml-2 px-4 py-2 bg-[--accent-blue] hover:bg-[--accent-red] text-white text-sm rounded"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  )
}

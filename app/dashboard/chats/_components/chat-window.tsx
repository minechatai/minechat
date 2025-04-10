"use client"

import { React, useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

import { CONSTANTS } from "@/lib/constants"
import { ChatHandler } from "@/lib/chat-lib"
import { useSupabase } from "@/lib/supabase-client";

let chatInterface = new ChatHandler()

export function ChatWindow({ chatId }: any) {

  console.log("selected chatId", chatId)

  const supabase = useSupabase();
  const router = useRouter()

  const [senderName, setSenderName] = useState("")
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  const scrollRef = useRef(null);

  const updateMessages = () => {

    console.log("updateMessages")
    if (!supabase.isReady()) return

    console.log("supabase.isReady()", supabase.isReady())

    chatInterface.setSupabaseInterface(supabase)
    chatInterface.getConversationMessages(
      chatId,
      (messages: any) => {

        let senders: string[] = []

        setMessages(messages.map((message: any) => {
          
          if (!senders.includes(message.sender)) {
            senders.push(message.sender)
          }
          
          return {
            id: message.id,
            content: message.content,
            sender: message.sentByAI ? "other" : "user",
            timestamp: message.date
          }
        }))
        
        setSenderName(senders.join(", "))
      },
      (error: number, msg: any) => {
        switch(error) {
          case CONSTANTS.ERROR_AUTH: {
            console.error("Session error:", msg)
            //router.push("/auth")
            break;
          }
          case CONSTANTS.ERROR_SESSION: {
            console.error("No active session. Redirecting to /auth.")
            //router.push("/auth")
            break;
          }
          case CONSTANTS.ERROR_SESSION_NO_ID: {
            console.error("Invalid user ID found. Redirecting to /auth.")
            //router.push("/auth")
            break;
          }
          default: {
            console.error("Generic error occured:", msg)
          }
        }
      }
    )

    return chatInterface.registerMessagesTableListener(updateMessages)
  }

  useEffect(updateMessages, [router, chatId, supabase.isReady()])

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight + 999;
    }
  }, [messages])

  const handleSendMessage = useCallback(async () => {
    
    if (!newMessage.trim()) return
    setSending(true)

    chatInterface.setSupabaseInterface(supabase)
    chatInterface.sendMessage(chatId, newMessage, updateMessages, () => {})

    setNewMessage("")
    setSending(false)
  }, [newMessage])

  // Trigger send when the user presses Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(e)
    if (e.key === "Enter") {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="font-semibold">
          {senderName}
        </h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4" ref={scrollRef}>
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              "flex max-w-[80%] flex-col space-y-1",
              message.sender === "user" ? "ml-auto items-end" : "items-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg p-3",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.content}
            </div>
            <span className="text-muted-foreground text-xs">
              {message.timestamp}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="bg-background flex-1 rounded-lg border px-3 py-2 text-sm"
            disabled={sending}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2" 
            onClick={handleSendMessage}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

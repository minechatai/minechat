"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Chat, ChatHandler } from "@/lib/chat-lib"
import { CONSTANTS } from "@/lib/constants"
import { useSupabase } from "@/lib/supabase-client";

interface ChatListProps {
  onChatSelect: (chatId: string) => void
  selectedChatId: string | null
}

let chatInterface = new ChatHandler()

export function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const supabase = useSupabase();
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [chatMessages, setChatMessages] = useState([])

  const updateConversationList = () => {
    
    setLoading(true)
    
    console.log("updateMessages")
    if (!supabase.isReady()) return

    console.log("supabase.isReady()", supabase.isReady())

    chatInterface.setSupabaseInterface(supabase)
    chatInterface.getChatList(
      (list: any) => {
        console.log("ChatList", list)
        setChatMessages(list)
        setLoading(false)
      },
      (error: number, msg: any) => {
        switch(error) {
          case CONSTANTS.ERROR_AUTH: {
            console.error("Session error:", msg)
            router.push("/auth")
            break;
          }
          case CONSTANTS.ERROR_SESSION: {
            console.error("No active session. Redirecting to /auth.")
            router.push("/auth")
            break;
          }
          case CONSTANTS.ERROR_SESSION_NO_ID: {
            console.error("Invalid user ID found. Redirecting to /auth.")
            router.push("/auth")
            break;
          }
          default: {
            console.error("Generic error occured:", msg)
          }
        }

        setLoading(false)
      }
    )

    return chatInterface.registerConversationTableListener(updateConversationList)
  }

  useEffect(updateConversationList, [router, supabase.isReady()])

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto h-[calc(100vh-10rem)]">
      {chatMessages.map(chat => (
        <button
          key={chat.id}
          onClick={() => onChatSelect(chat.id)}
          className={cn(
            "hover:bg-muted/50 flex flex-col gap-1 p-4 transition",
            "border-b last:border-b-0",
            selectedChatId === chat.id && "bg-muted"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-left">{chat.name}</span>
            <span className="text-muted-foreground text-xs text-right">
              {chat.timestamp}
            </span>
          </div>
          <span className="text-muted-foreground truncate text-left text-sm">
            {chat.lastMessage}
          </span>
        </button>
      ))}
    </div>
  )
}

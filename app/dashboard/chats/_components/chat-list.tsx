"use client"

import { cn } from "@/lib/utils"

interface Chat {
  id: string
  name: string
  lastMessage: string
  timestamp: string
}

const DUMMY_CHATS: Chat[] = [
  {
    id: "1",
    name: "John Doe",
    lastMessage: "Hey, how are you?",
    timestamp: "2m ago"
  },
  {
    id: "2",
    name: "Jane Smith",
    lastMessage: "The project is looking great!",
    timestamp: "1h ago"
  },
  {
    id: "3",
    name: "Mike Johnson",
    lastMessage: "Can we schedule a meeting?",
    timestamp: "2h ago"
  }
]

interface ChatListProps {
  onChatSelect: (chatId: string) => void
  selectedChatId: string | null
}

export function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  return (
    <div className="flex flex-col">
      {DUMMY_CHATS.map(chat => (
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
            <span className="font-medium">{chat.name}</span>
            <span className="text-muted-foreground text-xs">
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

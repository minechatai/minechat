"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { useState } from "react"

// Dummy messages
const initialMessages = [
  {
    id: "1",
    content: "Hey there!",
    sender: "them",
    timestamp: "2:30 PM"
  },
  {
    id: "2",
    content: "Hi! How are you?",
    sender: "me",
    timestamp: "2:31 PM"
  },
  {
    id: "3",
    content: "I'm doing great, thanks for asking. How about you?",
    sender: "them",
    timestamp: "2:32 PM"
  },
  {
    id: "4",
    content: "Pretty good! Just working on some new projects.",
    sender: "me",
    timestamp: "2:33 PM"
  }
]

export default function ChatPage({ params }: { params: any }) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")

  const handleSend = () => {
    if (!newMessage.trim()) return

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        content: newMessage,
        sender: "me",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      }
    ])
    setNewMessage("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-4">
        <Avatar>
          <AvatarImage src="/avatars/1.png" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">John Doe</p>
          <p className="text-muted-foreground text-sm">Active now</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.sender === "me"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p>{message.content}</p>
                <p
                  className={`mt-1 text-xs ${
                    message.sender === "me"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

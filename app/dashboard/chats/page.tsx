"use client"

import { useState } from "react"
import { ChatList } from "./_components/chat-list"
import { ChatWindow } from "./_components/chat-window"

export default function ChatsPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  return (
    <div className="flex p-4 h-[calc(100vh-72px)]">
      <div className="w-80 rounded-lg border">
        <div className="border-b p-4 h-[3rem]">
          <h2 className="font-semibold">Messages</h2>
        </div>
        <ChatList
          onChatSelect={setSelectedChatId}
          selectedChatId={selectedChatId}
        />
      </div>

      <div className="flex-1 rounded-lg border">
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

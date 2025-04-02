// chat/_components/chat-list.tsx
"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"

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
  latestMessage?: DBMessage | null
  messages?: DBMessage[]
}

interface ChatListProps {
  fbPageName: string | null
  conversations: DBConversationWithLatest[]
  onSelectConversation: (conversation: DBConversationWithLatest) => void
  onLoadMore: () => void
  activeConversationId: string | null
}

const platformTabs = [
  "All",
  "Website",
  "Messenger",
  "Instagram",
  "Telegram",
  "WhatsApp",
  "Viber",
  "Discord",
  "Slack"
] as const

export default function ChatList({ fbPageName, conversations, onSelectConversation, onLoadMore, activeConversationId }: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<(typeof platformTabs)[number]>("All")

  // Reference for the scrollable container.
  const containerRef = useRef<HTMLDivElement>(null)

  // When the scroll is near the bottom, trigger onLoadMore.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const handleScroll = () => {
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
        onLoadMore()
      }
    }
    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [onLoadMore])

  // Map conversations to a display format and sort by timestamp descending (most recent first)
  const mappedConversations = useMemo(() => {
    const mapped = conversations.map((conv) => {
      const latestMsg = conv.latestMessage
      const lastMessage = latestMsg ? latestMsg.content : "No messages yet"
      const timestamp = latestMsg ? latestMsg.date : conv.createdAt
      const platform = latestMsg && latestMsg.source ? latestMsg.source : "Unknown"

      let name = `Conversation ${conv.id.slice(0, 8)}`
      if (latestMsg) {
        if (fbPageName && latestMsg.sender.toLowerCase() !== fbPageName.toLowerCase()) {
          name = latestMsg.sender
        } else if (!fbPageName) {
          name = latestMsg.sender
        }
      }

      return { id: conv.id, name, lastMessage, timestamp, platform }
    })
    return mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [conversations, fbPageName])

  const filteredConversations = useMemo(() => {
    return mappedConversations.filter((conv) => {
      const matchSearch =
        conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
      if (activeTab === "All") return matchSearch
      return matchSearch && conv.platform.toLowerCase() === activeTab.toLowerCase()
    })
  }, [mappedConversations, searchTerm, activeTab])

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col">
      {/* Search */}
      <div className="p-3">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-3 py-2 border rounded text-sm outline-none focus:ring-2 focus:ring-[--accent-blue]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="px-3 pb-2 flex items-center flex-wrap gap-2">
        {platformTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-sm rounded ${
              activeTab === tab
                ? "bg-[--accent-blue] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div ref={containerRef} className="overflow-y-auto flex-1">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => {
              const fullConv = conversations.find((c) => c.id === conv.id)
              if (fullConv) onSelectConversation(fullConv)
            }}
            className={`cursor-pointer hover:bg-gray-100 px-3 py-2 border-b ${activeConversationId === conv.id ? "bg-blue-100" : ""}`}
          >
            <div className="font-semibold text-sm">{conv.name}</div>
            <div className="text-xs text-gray-600 truncate">{conv.lastMessage}</div>
            <div className="text-xs text-gray-400">{conv.timestamp}</div>
          </div>
        ))}
        {filteredConversations.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500">
            No conversations found.
          </div>
        )}
      </div>
    </div>
  )
}

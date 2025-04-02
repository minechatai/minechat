"use client"

import { useState, FormEvent } from "react"
import { useParams } from "next/navigation"

// Define a Message type for our chat messages
type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  sentByAI: boolean
  date: string
}

// A simple ChatBubble component for displaying messages
function ChatBubble({ content, sender }: { content: string; sender: "user" | "ai" }) {
  const isUser = sender === "user"
  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"} items-center`}>
      {!isUser && (
        <div className="flex-shrink-0 bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center mr-2">
          AI
        </div>
      )}
      <div
        className={`rounded-lg px-4 py-2 text-sm max-w-xs ${
          isUser ? "bg-purple-600 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"
        }`}
      >
        {content}
      </div>
      {isUser && (
        <div className="flex-shrink-0 bg-purple-600 text-white rounded-full h-8 w-8 flex items-center justify-center ml-2">
          U
        </div>
      )}
    </div>
  )
}

export default function WebChatPage() {
  const { unique_id } = useParams() as { unique_id: string }
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Function to handle sending a new message
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // Create the user message object
    const userMsg: Message = {
      id: crypto.randomUUID(),
      content: newMessage,
      sender: "user",
      sentByAI: false,
      date: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setNewMessage("")
    setLoading(true)

    // Simulate an AI reply after a delay
    const simulatedAIReply = await fakeAIReply(newMessage)
    const aiMsg: Message = {
      id: crypto.randomUUID(),
      content: simulatedAIReply,
      sender: "ai",
      sentByAI: true,
      date: new Date().toISOString(),
    }
    setMessages(prev => [...prev, aiMsg])
    setLoading(false)
  }

  // Dummy AI reply that echoes the user's message after 1.5 seconds
  async function fakeAIReply(userMessage: string): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`Echoing: "${userMessage}"`)
      }, 1500)
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header displaying the unique_id */}
      <header className="bg-blue-600 p-4 text-white text-xl font-semibold shadow">
        Dummy Chatbot (ID: {unique_id})
      </header>

      {/* Main chat window */}
      <main className="flex-1 p-4 overflow-y-auto">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        {loading && <p className="text-sm text-gray-500 mb-2">Loading...</p>}
        {messages.map(msg => (
          <ChatBubble key={msg.id} content={msg.content} sender={msg.sender} />
        ))}
      </main>

      {/* Message input form */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white flex items-center border-t border-gray-200"
      >
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={!newMessage.trim() || loading}
        >
          Send
        </button>
      </form>
    </div>
  )
}

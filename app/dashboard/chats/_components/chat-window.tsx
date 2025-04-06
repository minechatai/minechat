"use client"

interface Message {
  id: string
  content: string
  sender: "user" | "other"
  timestamp: string
}

const DUMMY_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      content: "Hey, how are you?",
      sender: "other",
      timestamp: "10:00 AM"
    },
    {
      id: "2",
      content: "I'm good, thanks! How about you?",
      sender: "user",
      timestamp: "10:01 AM"
    },
    {
      id: "3",
      content: "Pretty good! Just working on some projects.",
      sender: "other",
      timestamp: "10:02 AM"
    }
  ],
  "2": [
    {
      id: "1",
      content: "The project is looking great!",
      sender: "other",
      timestamp: "9:00 AM"
    },
    {
      id: "2",
      content: "Thanks! I've been working hard on it.",
      sender: "user",
      timestamp: "9:01 AM"
    }
  ],
  "3": [
    {
      id: "1",
      content: "Can we schedule a meeting?",
      sender: "other",
      timestamp: "8:00 AM"
    },
    {
      id: "2",
      content: "Sure, what time works for you?",
      sender: "user",
      timestamp: "8:01 AM"
    }
  ]
}

interface ChatWindowProps {
  chatId: string
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const messages = DUMMY_MESSAGES[chatId] || []

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="font-semibold">
          {chatId === "1"
            ? "John Doe"
            : chatId === "2"
              ? "Jane Smith"
              : "Mike Johnson"}
        </h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
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
          />
          <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

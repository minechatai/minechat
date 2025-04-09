"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";

import { CONSTANTS } from "@/lib/constants"
import { AIAssistantHandler } from "@/lib/aiassistant-lib"
import { useSupabase } from "@/lib/supabase-client";

let aiAssistantInterface = new AIAssistantHandler()

export default function AiAssistantPage() {  
  const supabase = useSupabase();
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [messages, setMessages] = useState([
    { id: 100, text: "Hello! How can I assist you today?", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [assistant, setAssistant] = useState({
    assistantName: "",
    introMessage: "",
    shortDescription: "",
    guidelines: "",
    responseLength: "short"
  })

  useEffect(() => {
    const fetchData = async () => {
      aiAssistantInterface.loadSettings(
        (existing: any) => {
          setAssistant({
            assistantName: existing.assistantName,
            introMessage: existing.introMessage,
            shortDescription: existing.shortDescription,
            guidelines: existing.guidelines,
            responseLength: existing.responseLength
          })
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
        }
      )
      setLoading(false)
    }

    if (supabase.isReady()) {
      aiAssistantInterface.setSupabaseInterface(supabase)
      fetchData()
    }

  }, [router, supabase.isReady()])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setAssistant((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  function sendMessage() {
    console.log("from user", messages)
    setMessages((prev: any) => ([
      ... prev,
      { id: prev.length, text: input, isUser: true }
    ]));
    aiAssistantInterface.sendMessage(
      input, 
      (reply: any) => {
        console.log("from ai", messages)
        setMessages((prev: any) => ([
          ... prev,
          { id: prev.length, text: reply, isUser: false }
        ]))
      },
      (errnumber: number, errMsg: string) => {
        console.error(errnumber)
      }
    )
    setInput("")
  }

  function handleSave() {
    setLoading(true)
    aiAssistantInterface.saveSettings(
      assistant,
      () => {
        console.log("AI Assistant Setup updated successfully")
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
      }
    )
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <p>Loading...</p>
      </div>
    )
  }

  // If we found no record, show the error instead of the form
  if (errorMessage) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded shadow max-w-md mx-auto">
        {errorMessage}
      </div>
    )
  }
  
  return (
  <div className="p-6 space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Setup &gt; AI Assistant</h2>
      <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleSave}>Save</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Persona Section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Persona</h3>
          <div>
            <label className="block mb-1 text-sm font-medium">AI Assistant Name</label>
            <Input 
              name="assistantName" 
              placeholder="Enter AI assistant name" 
              value={assistant.assistantName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Intro Message</label>
            <Textarea 
              name="introMessage" 
              placeholder="Enter Intro Message" 
              value={assistant.introMessage}
              onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Short Description</label>
            <Textarea 
              name="shortDescription" 
              placeholder="Enter Description"
              value={assistant.shortDescription}
              onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">AI Guidelines</label>
            <Textarea 
              name="guidelines" 
              placeholder="1." 
              rows={3} 
              value={assistant.guidelines}
              onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Response Length</label>
            <ToggleGroup type="single" defaultValue="short"
              value={assistant.responseLength}
              onChange={handleChange}>
              <ToggleGroupItem value="short">Short</ToggleGroupItem>
              <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
              <ToggleGroupItem value="long">Long</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* AI Testing Section */}
      <Card>
        <CardContent className="p-6 h-full flex flex-col">
          <h3 className="text-lg font-semibold mb-4">AI Testing</h3>
          <div className="flex-1 border rounded-md p-4 bg-white">
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex mt-4 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-2 rounded-lg ${
                  msg.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}            
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Input 
              className="flex-1" 
              placeholder="Send a message" 
              type="text"
              value={input}
              onChange={(e: any) => setInput(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button variant="outline" size="icon">
              📎
            </Button>
            <Button variant="outline" size="icon">
              🎤
            </Button>
            <Button variant="default" size="icon" 
              onClick={(e: any) => {
                sendMessage();
              }}>
              ➤
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
}

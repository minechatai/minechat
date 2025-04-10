"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { CONSTANTS } from "@/lib/constants"
import { AIAssistantHandler } from "@/lib/aiassistant-lib"
import { BusinessInfoHandler } from "@/lib/businessinfo-lib"
import { useSupabase } from "@/lib/supabase-client";

let aiAssistantInterface = new AIAssistantHandler()
let businessInfoInterface = new BusinessInfoHandler()

export default function BusinessInfoPage() {  
  const supabase = useSupabase();
  const router = useRouter()

  const [businessInfo, setBusinessInfo] = useState({
    id: "",
    companyName: "",
    phoneNumber: "",
    address: "",
    email: "",
    otherInfo: ""
  })

  const [messages, setMessages] = useState([
    { id: 100, text: "Hello! How can I assist you today?", isUser: false },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      businessInfoInterface.fetchBusinessInfo(
        (newBusinessInfo: any) => {
          console.log("newBusinessInfo", newBusinessInfo)
          if (newBusinessInfo != null && newBusinessInfo.id != "") {
            setBusinessInfo({
              id: newBusinessInfo.id,
              companyName: newBusinessInfo.companyName,
              phoneNumber: newBusinessInfo.phoneNumber,
              address: newBusinessInfo.address,
              email: newBusinessInfo.email,
              otherInfo: newBusinessInfo.otherInfo
            })
          }
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
    }

    if (supabase.isReady()) {
        
        aiAssistantInterface.setSupabaseInterface(supabase)
        aiAssistantInterface.loadSettings(() => {}, () => {})

        businessInfoInterface.setSupabaseInterface(supabase)
        
        fetchData()
    }
  }, [supabase.isReady()])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    console.log("handleChange", e.target.name, e.target.value)
    setBusinessInfo((prev: any) => ({
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
    businessInfoInterface.createOrUpdateBusinessInfo(
      businessInfo,
      () => {
        console.log("success")
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
  }

  return (
    <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Setup &gt; Business Information</h2>
        <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleSave}>Save</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business info Section */}
        <Card>
            <CardContent className="p-6 space-y-4">
                <div className="max-w-2xl mx-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-1">Company Name</label>
                        <Input 
                            name="companyName" 
                            placeholder="Enter Company Name" 
                            value={businessInfo.companyName}
                            onChange={handleChange}
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <div className="flex gap-2">
                            <div className="flex items-center px-1 border rounded-md bg-muted">
                                <Image
                                    src="https://flagcdn.com/w40/pk.png"
                                    alt="Pakistan Flag"
                                    width={20}
                                    height={15}
                                />
                                <span className="text-sm px-1">+92</span>
                            </div>
                            <Input 
                                name="phoneNumber" 
                                placeholder="00000000000" 
                                className="flex-1" 
                                value={businessInfo.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <Input 
                            name="address" 
                            placeholder="Enter address" 
                            value={businessInfo.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input 
                            name="email" 
                            placeholder="Enter email" 
                            value={businessInfo.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                        Company Story or Other information:
                        </label>
                        <Textarea 
                            name="otherInfo" 
                            placeholder="Enter Company Story or Other information:" 
                            rows={4} 
                            value={businessInfo.otherInfo}
                            onChange={handleChange}
                        />
                    </div>
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

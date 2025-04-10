"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";

//import { CONSTANTS } from "@/lib/constants"
//import { AIAssistantHandler } from "@/lib/aiassistant-lib"

export default function BusinessInfoPage() {  

  const [messages, setMessages] = useState([
    { id: 100, text: "Hello! How can I assist you today?", isUser: false },
  ]);
  const [input, setInput] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
  }

  function sendMessage() {
  }

  function handleSave() {
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
                        <Input placeholder="Enter Company Name" />
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
                            <Input placeholder="00000000000" className="flex-1" />
                        </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <Input placeholder="Enter address" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input placeholder="Enter email" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                        Company Story or Other information:
                        </label>
                        <Textarea placeholder="Enter Company Story or Other information:" rows={4} />
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

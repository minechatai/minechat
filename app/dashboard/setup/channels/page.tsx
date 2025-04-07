"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const channels = [
  { name: "Messenger", icon: "💬" },
  { name: "Website", icon: "🌐" },
  { name: "Instagram", icon: "📸" },
  { name: "Telegram", icon: "✈️" },
  { name: "WhatsApp", icon: "📱" },
  { name: "Slack", icon: "💼" },
  { name: "Viber", icon: "📞" },
  { name: "Discord", icon: "🎮" },
];

const colorOptions = [
  "bg-red-500",
  "bg-pink-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-green-500",
  "bg-purple-500",
];

export default function ChannelSetup() {
  const [selectedColor, setSelectedColor] = React.useState("bg-purple-500");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Setup &gt; Channels</h2>
      <Card className="mt-4">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Channels <span className="text-sm text-pink-500 ml-2">(watch tutorial video)</span></h3>
          </div>

          <Tabs defaultValue="Messenger">
            <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {channels.map((channel) => (
                <TabsTrigger key={channel.name} value={channel.name}>
                  <div className="text-xs">{channel.icon} {channel.name}</div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">PageId</label>
              <Input defaultValue="" />
            </div>
            <div>
              <label className="text-sm font-medium">Facebook Access Token</label>
              <Textarea
                rows={3}
                defaultValue=""/>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="ghost">Cancel</Button>
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">Save Change</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

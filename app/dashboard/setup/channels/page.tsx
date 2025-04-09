"use client"

import { React, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Channels } from "@/lib/channels-lib"
import { CONSTANTS } from "@/lib/constants"
import { useSupabase } from "@/lib/supabase-client";

let channelsInterface = new Channels()

const tabInfo = [
  { name: "Messenger", icon: "💬" },
  { name: "Website", icon: "🌐" },
  { name: "Instagram", icon: "📸" },
  { name: "Telegram", icon: "✈️" },
  { name: "WhatsApp", icon: "📱" },
  { name: "Slack", icon: "💼" },
  { name: "Viber", icon: "📞" },
  { name: "Discord", icon: "🎮" },
];

export default function ChannelSetup() {
  const supabase = useSupabase();
  const router = useRouter()
  const [channels, setChannels] = useState({
    website: false,
    messenger: false,
    instagram: false,
    telegram: false,
    whatsapp: false,
    viber: false,
    discord: false,
    slack: false,
    facebookPageId: "",
    facebookAccessToken: "",
    fbPageName: ""
  })

  // On mount, fetch existing user channel row or create a new one.
  useEffect(() => {

    async function loadUserChannels() {
      console.log("loading user channels")
      channelsInterface.loadUserChannels(
        (channelsInfo: any) => {
          setChannels(channelsInfo.data)
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
      channelsInterface.setSupabaseInterface(supabase)
      loadUserChannels()
    }

  }, [router, supabase.isReady()])

  // Save changes to DB, and if a Facebook Page ID is provided, update fbPageName for the logged in user.
  function handleSave() {
    channelsInterface.save(
      channels,
      (_: any, updatedChannelInfo: any) => {
        alert(`Welcome ${updatedChannelInfo.fbPageName}`)
      },
      (error: number, msg: any) => {
        switch(error) {
          case CONSTANTS.ERROR_AUTH: {
            console.error("Session error:", msg)
            //router.push("/auth")
            break;
          }
          case CONSTANTS.ERROR_SESSION: {
            console.error("No active session. Redirecting to /auth.")
            //router.push("/auth")
            break;
          }
          case CONSTANTS.ERROR_SESSION_NO_ID: {
            console.error("Invalid user ID found. Redirecting to /auth.")
            //router.push("/auth")
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
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Setup &gt; Channels</h2>
      <Card className="mt-4">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Channels <span className="text-sm text-pink-500 ml-2">(watch tutorial video)</span></h3>
          </div>

          <Tabs defaultValue="Messenger">
            <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {tabInfo.map((tab) => (
                <TabsTrigger key={tab.name} value={tab.name}>
                  <div className="text-xs">{tab.icon} {tab.name}</div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">PageId</label>
              <Input 
                value={channels.facebookPageId}
                onChange={(e) =>
                  setChannels((prev) => ({ ...prev, facebookPageId: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Facebook Access Token</label>
              <Textarea
                rows={3}
                value={channels.facebookAccessToken}
                onChange={(e) =>
                  setChannels((prev) => ({ ...prev, facebookAccessToken: e.target.value }))
                }       
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="ghost">Cancel</Button>
              <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={handleSave}>Save Change</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

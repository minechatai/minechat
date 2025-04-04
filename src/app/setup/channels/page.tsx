"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Channels } from "@/lib/channels-lib"
import { CONSTANTS } from "@/lib/constants"

let channelsInterface = new Channels()

export default function SetupChannelsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  // Our state matches the columns in "UserChannel" plus Facebook credentials for Messenger.
  // fbPageName will be updated via the API route using the logged in user’s ID.
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
      channelsInterface.loadUserChannels(
        (channelsInfo: any) => {
          setUserId(channelsInfo.userId)
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
      setLoading(false)      
    }

    loadUserChannels()
  }, [router])

  // Toggle a single channel's value in local state.
  function handleToggle(channelKey: keyof typeof channels) {
    setChannels((prev) => ({
      ...prev,
      [channelKey]: !prev[channelKey],
    }))
  }

  // Save changes to DB, and if a Facebook Page ID is provided, update fbPageName for the logged in user.
  async function handleSave() {
    setLoading(true)
    channelsInterface.save(
      channels,
      (_: any, updatedChannelInfo: any) => {
        alert(`Welcome ${updatedChannelInfo.fbPageName}`)
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

  // Call the Facebook sync API to sync conversations.
  async function handleSyncConversations() {
    setLoading(true)
    channelsInterface.syncConversations(
      channels,
      (data: any) => {
        console.log("Sync response:", data)
        alert("Sync completed: " + JSON.stringify(data))
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

  // Generate a unique link for the logged in user and open it in a new tab.
  function handleGenerateLink() {
    if (!userId) {
      alert("User not authenticated")
      return
    }
    const link = `/setup/channels/web_chat/${userId}`
    window.open(link, "_blank")
  }

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">Channels Setup</h2>
      <p className="text-sm text-gray-700 mb-4">
        Manage which platforms you want to connect:
      </p>

      <div className="space-y-3 mb-6">
        <div>
          <ChannelRow
            label="Website"
            checked={channels.website}
            onToggle={() => handleToggle("website")}
          />
          {channels.website && (
            <button
              onClick={handleGenerateLink}
              className="mt-2 px-3 py-1 rounded text-white bg-purple-600 hover:bg-purple-700 text-sm"
            >
              Generate Link
            </button>
          )}
        </div>
        <ChannelRow
          label="Messenger"
          checked={channels.messenger}
          onToggle={() => handleToggle("messenger")}
        />
        <div className="ml-4 space-y-2">
          <input
            type="text"
            placeholder="Facebook Page ID"
            value={channels.facebookPageId}
            onChange={(e) =>
              setChannels((prev) => ({ ...prev, facebookPageId: e.target.value }))
            }
            className="w-full p-2 border rounded text-sm"
          />
          <input
            type="text"
            placeholder="Facebook Access Token"
            value={channels.facebookAccessToken}
            onChange={(e) =>
              setChannels((prev) => ({ ...prev, facebookAccessToken: e.target.value }))
            }
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        <ChannelRow
          label="Instagram"
          checked={channels.instagram}
          onToggle={() => handleToggle("instagram")}
        />
        <ChannelRow
          label="Telegram"
          checked={channels.telegram}
          onToggle={() => handleToggle("telegram")}
        />
        <ChannelRow
          label="WhatsApp"
          checked={channels.whatsapp}
          onToggle={() => handleToggle("whatsapp")}
        />
        <ChannelRow
          label="Viber"
          checked={channels.viber}
          onToggle={() => handleToggle("viber")}
        />
        <ChannelRow
          label="Discord"
          checked={channels.discord}
          onToggle={() => handleToggle("discord")}
        />
        <ChannelRow
          label="Slack"
          checked={channels.slack}
          onToggle={() => handleToggle("slack")}
        />
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
      >
        Save Changes
      </button>

      <button
        onClick={handleSyncConversations}
        className="mt-4 px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
      >
        Sync Facebook Conversations
      </button>
    </div>
  )
}

function ChannelRow({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-semibold text-gray-800">{label}</span>
      <ToggleSwitch checked={checked} onChange={onToggle} />
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="relative inline-block w-11 h-6 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div
        className="
          absolute inset-0 
          bg-gray-200 
          peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
          rounded-full 
          peer-checked:bg-blue-600
          peer-checked:after:translate-x-full
          peer-checked:after:border-white
          after:content-['']
          after:absolute 
          after:top-0.5 
          after:left-[2px] 
          after:bg-white 
          after:border-gray-300 
          after:border 
          after:rounded-full 
          after:h-5 
          after:w-5 
          after:transition-all
        "
      />
    </label>
  )
}

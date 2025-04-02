"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

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
      try {
        // Check session on the client side.
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error("Session error:", sessionError.message)
          return
        }
        if (!sessionData?.session) {
          console.log("No active session. Redirecting to /auth.")
          router.push("/auth")
          return
        }

        // Get user ID.
        const user = sessionData.session.user
        if (!user?.id) {
          console.log("No user ID found. Redirecting to /auth.")
          router.push("/auth")
          return
        }
        setUserId(user.id)

        // Fetch the UserChannel row.
        const { data: existingRow, error: fetchError } = await supabase
          .from("UserChannel")
          .select("*")
          .eq("userId", user.id)
          .single()

        if (fetchError) {
          console.warn("Could not fetch UserChannel:", fetchError.message)
        }

        // Create a row if none found.
        let userChannel = existingRow
        if (!userChannel) {
          console.log("No UserChannel row found. Creating a new one...")
          
          let newRecord = { 
            userId: user.id, 
            updatedAt: new Date(),
            ...channels
          }

          console.log("Inserting new record: ", newRecord)

          const { data: insertedRow, error: insertError } = await supabase
            .from("UserChannel")
            .insert(newRecord)
            .select()
            .single()

          if (insertError) {
            console.error("Failed to create record in UserChannel:", insertError.message)
            return
          }
          userChannel = insertedRow
        }

        // Set local channel state, including Facebook credentials and fbPageName.
        setChannels({
          website: userChannel.website || false,
          messenger: userChannel.messenger || false,
          instagram: userChannel.instagram || false,
          telegram: userChannel.telegram || false,
          whatsapp: userChannel.whatsapp || false,
          viber: userChannel.viber || false,
          discord: userChannel.discord || false,
          slack: userChannel.slack || false,
          facebookPageId: userChannel.facebookPageId || "",
          facebookAccessToken: userChannel.facebookAccessToken || "",
          fbPageName: userChannel.fbPageName || ""
        })
      } catch (err) {
        console.error("Error loading user channels:", err)
      } finally {
        setLoading(false)
      }
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
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error("Session error:", sessionError.message)
        return
      }
      if (!sessionData?.session?.user?.id) {
        console.log("No user ID found. Redirecting to /auth.")
        router.push("/auth")
        return
      }

      const userId = sessionData.session.user.id
      console.log("Saving channel settings for userId:", userId, channels)

      // Prepare a new channels object for update, and add fbPageName if available.
      let updatedChannels = { ...channels }

      // If a Facebook Page ID is provided, fetch the fbPageName from the API.
      if (channels.facebookPageId) {
        const response = await fetch("/api/facebook/page-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facebookPageId: channels.facebookPageId,
            accessToken: channels.facebookAccessToken
          })
        })
        if (response.ok) {
          const json = await response.json()
          updatedChannels.fbPageName = json.pageName
          alert(`Welcome ${json.pageName}`)
        } else {
          console.error("Failed to fetch fbPageName")
        }
      }

      // Update the UserChannel record for the logged in user.
      const { data, error } = await supabase
        .from("UserChannel")
        .update(updatedChannels)
        .eq("userId", userId)

      if (error) {
        console.error("Failed to update channels:", error.message)
      } else {
        console.log("Successfully updated channels:", data)
      }
    } catch (err) {
      console.error("Error updating channels:", err)
    } finally {
      setLoading(false)
    }
  }

  // Call the Facebook sync API to sync conversations.
  async function handleSyncConversations() {
    try {
      setLoading(true)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error("Session error:", sessionError.message)
        alert("Session error: " + sessionError.message)
        return
      }
      if (!sessionData?.session?.user?.id) {
        alert("Not authenticated")
        router.push("/auth")
        return
      }
      const userId = sessionData.session.user.id

      const response = await fetch("/api/facebook/sync-conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          facebookPageId: channels.facebookPageId,
          accessToken: channels.facebookAccessToken
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Failed to sync conversations. Status:", response.status, "Response:", errorText)
        alert("Error syncing conversations: " + response.status + " " + errorText)
        return
      }

      const data = await response.json()
      console.log("Sync response:", data)
      alert("Sync completed: " + JSON.stringify(data))
    } catch (error) {
      console.error("Error syncing conversations:", error)
      if (error instanceof Error) {
        alert("Error syncing conversations: " + error.message)
      } else {
        alert("Error syncing conversations: " + error)
      }
    } finally {
      setLoading(false)
    }
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

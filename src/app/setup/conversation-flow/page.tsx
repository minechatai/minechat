"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

interface ConversationFlow {
  id: string
  userId: string
  title: string | null
  flow: any
  createdAt: string
  updatedAt: string
}

export default function SetupConversationFlowPage() {
  const router = useRouter()

  // Loading states and errors
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  
  // List of flows
  const [flows, setFlows] = useState<ConversationFlow[]>([])

  // For creating new flow
  const [newTitle, setNewTitle] = useState("")

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) {
        router.push("/auth")
        return
      }

      // We have a session, fetch all flows for this user
      const userId = sessionData.session.user.id
      await fetchFlows(userId)
    }

    checkSessionAndFetch().catch((err) => {
      console.error("Error checking session:", err)
      setErrorMessage("Error checking session.")
      setLoading(false)
    })
  }, [router])

  const fetchFlows = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("ConversationFlow")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })

      if (error) {
        console.error("Error fetching flows:", error)
        setErrorMessage("Error fetching flows.")
        setLoading(false)
        return
      }

      if (data) {
        setFlows(data as ConversationFlow[])
      }
    } catch (err) {
      console.error("fetchFlows error:", err)
      setErrorMessage("Unknown error fetching flows.")
    } finally {
      setLoading(false)
    }
  }

  // Handle creating a new flow
  const handleCreateFlow = async () => {
    setErrorMessage("")
    if (!newTitle.trim()) {
      setErrorMessage("Please provide a title for the new flow.")
      return
    }

    try {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session?.user) {
        router.push("/auth")
        return
      }

      const userId = sessionData.session.user.id
      // Insert a new flow with an empty object for flow JSON
      const { data, error } = await supabase
        .from("ConversationFlow")
        .insert({
          userId,
          title: newTitle.trim(),
          flow: {} // empty object, user can edit later
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating flow:", error)
        setErrorMessage("Error creating flow.")
      } else if (data) {
        setFlows((prev) => [data, ...prev])
        setNewTitle("")
      }
    } catch (err) {
      console.error("handleCreateFlow error:", err)
      setErrorMessage("An error occurred while creating flow.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Conversation Flows</h2>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {/* Create new flow section */}
      <div className="mb-6">
        <label htmlFor="flowTitle" className="block font-semibold mb-1">
          New Flow Title
        </label>
        <input
          id="flowTitle"
          type="text"
          className="border rounded p-2 w-full mb-2"
          placeholder="Enter flow title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button
          onClick={handleCreateFlow}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create
        </button>
      </div>

      {/* List existing flows */}
      {flows.length === 0 ? (
        <p className="text-sm text-gray-700">No flows found. Create one above.</p>
      ) : (
        <ul className="space-y-4">
          {flows.map((flow) => (
            <li key={flow.id} className="border border-gray-200 p-3 rounded">
              <div className="text-sm font-medium">
                {flow.title || "(Untitled Flow)"}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Created: {new Date(flow.createdAt).toLocaleString()}
              </div>
              <button
                onClick={() => router.push(`/setup/conversation-flow/${flow.id}`)}
                className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
              >
                Edit Flow
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
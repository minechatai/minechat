"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

interface ConversationFlow {
  id: string
  userId: string
  title: string | null
  flow: any
  createdAt: string
  updatedAt: string
}

export default function FlowEditorPage() {
  const router = useRouter()
  const params = useParams()

  // We'll read flowId from params
  const flowId = params?.flowId as string

  // States
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [flowData, setFlowData] = useState<ConversationFlow | null>(null)
  const [title, setTitle] = useState("")
  const [jsonString, setJsonString] = useState("")

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) {
        router.push("/auth")
        return
      }

      // If no flowId, redirect
      if (!flowId) {
        setErrorMessage("No Flow ID provided.")
        setLoading(false)
        return
      }

      // Attempt to fetch
      await fetchFlow(sessionData.session.user.id, flowId)
    }

    checkSessionAndFetch().catch((err) => {
      console.error("Error checking session:", err)
      setErrorMessage("Error checking session.")
      setLoading(false)
    })
  }, [router, flowId])

  const fetchFlow = async (userId: string, id: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("ConversationFlow")
        .select("*")
        .eq("userId", userId)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching conversation flow:", error)
        setErrorMessage("Error fetching conversation flow.")
        setLoading(false)
        return
      }

      if (data) {
        setFlowData(data as ConversationFlow)
        setTitle(data.title || "")
        // Convert JSON to a string for editing
        try {
          const asString = JSON.stringify(data.flow, null, 2)
          setJsonString(asString)
        } catch (jsonErr) {
          console.error("Error parsing flow JSON:", jsonErr)
          setJsonString("{}")
        }
      }
    } catch (err) {
      console.error("fetchFlow error:", err)
      setErrorMessage("Unknown error fetching flow.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setErrorMessage("")
    if (!flowData) return

    // Attempt to parse JSON
    let parsed: any
    try {
      parsed = JSON.parse(jsonString)
    } catch (err) {
      setErrorMessage("Invalid JSON. Please fix any syntax errors.")
      return
    }

    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session?.user) {
        router.push("/auth")
        return
      }

      const { error } = await supabase
        .from("ConversationFlow")
        .update({
          title: title.trim(),
          flow: parsed
        })
        .eq("id", flowData.id)

      if (error) {
        console.error("Error updating flow:", error)
        setErrorMessage("Error updating flow.")
      } else {
        // Optionally redirect or show success
        router.push("/setup/conversation-flow")
      }
    } catch (err) {
      console.error("handleSave error:", err)
      setErrorMessage("An error occurred while saving the flow.")
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

  if (errorMessage) {
    return (
      <div className="p-4">
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {errorMessage}
        </div>
      </div>
    )
  }

  if (!flowData) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500">No flow data found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Edit Flow</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-1">
          Title
        </label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Flow JSON</label>
        <textarea
          rows={14}
          className="border rounded p-2 w-full font-mono text-sm"
          value={jsonString}
          onChange={(e) => setJsonString(e.target.value)}
        />
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save
      </button>
    </div>
  )
}
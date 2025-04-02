"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function SetupAssistantPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [assistant, setAssistant] = useState({
    assistantName: "",
    persona: "",
    instructions: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      // Check for a session
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) {
        console.log("No session found, redirecting to /auth")
        router.push("/auth")
        return
      }

      const userId = sessionData.session.user.id
      console.log("Current User ID:", userId)

      // Fetch existing row for this user
      const { data: existing, error } = await supabase
        .from("AIAssistantSetup")
        .select("*")
        .eq("userId", userId)
        .maybeSingle()

      console.log(existing, error)

      if (error || !existing) {
        // If no row is found, log it, set error message in state
        console.log("No existing row found for user:", userId, "Error:", error)
        setErrorMessage("We can't find an existing row. Please create one first.")
        setLoading(false)
        return
      }

      // If we do find the row, log it and populate the form
      console.log("Found existing row for user:", userId, existing)
      setAssistant({
        assistantName: existing.assistantName,
        persona: existing.persona,
        instructions: existing.instructions
      })
      setLoading(false)
    }

    fetchData()
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setAssistant((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  async function handleSave() {
    setLoading(true)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session?.user?.id) {
        console.log("No user session on save, redirecting to /auth")
        router.push("/auth")
        return
      }

      const userId = sessionData.session.user.id
      console.log("Saving data for user:", userId)

      // Check if a record exists (should exist in this scenario, but we check again anyway)
      const { data: existing } = await supabase
        .from("AIAssistantSetup")
        .select("id")
        .eq("userId", userId)
        .single()

      if (!existing) {
        console.log("No existing row found in handleSave, cannot update. Consider your logic here.")
        // If you want to allow creation here, you could do so:
        // await supabase.from("AIAssistantSetup").insert({...})
      } else {
        // Update existing record
        const { error } = await supabase
          .from("AIAssistantSetup")
          .update({
            assistantName: assistant.assistantName,
            persona: assistant.persona,
            instructions: assistant.instructions
          })
          .eq("id", existing.id)

        if (error) {
          console.error("Error updating AI Assistant Setup:", error)
        } else {
          console.log("AI Assistant Setup updated successfully")
        }
      }
    } catch (error) {
      console.error("Error saving AI Assistant Setup:", error)
    } finally {
      setLoading(false)
    }
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

  // Otherwise, display the form
  return (
    <div className="bg-white p-4 rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-2">AI Assistant Setup</h2>

      <div className="flex flex-col space-y-4">
        <div>
          <label htmlFor="assistantName" className="font-semibold block mb-1">
            Assistant Name
          </label>
          <input
            id="assistantName"
            name="assistantName"
            className="w-full border px-3 py-2 rounded"
            value={assistant.assistantName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="persona" className="font-semibold block mb-1">
            Persona
          </label>
          <input
            id="persona"
            name="persona"
            className="w-full border px-3 py-2 rounded"
            value={assistant.persona}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="instructions" className="font-semibold block mb-1">
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            rows={5}
            className="w-full border px-3 py-2 rounded"
            value={assistant.instructions}
            onChange={handleChange}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save
      </button>
    </div>
  )
}

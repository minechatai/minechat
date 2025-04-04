"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { CONSTANTS } from "@/lib/constants"
import { AIAssistantHandler } from "@/lib/aiassistant-lib"

let aiAssistantInterface = new AIAssistantHandler()

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
      aiAssistantInterface.load(
        (existing: any) => {
          setAssistant({
            assistantName: existing.assistantName,
            persona: existing.persona,
            instructions: existing.instructions
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
    aiAssistantInterface.save(
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

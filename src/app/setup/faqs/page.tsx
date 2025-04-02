"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

interface FAQ {
  id: string
  userId: string
  question: string
  answer: string
  createdAt: string
  updatedAt: string
}

export default function SetupFaqsPage() {
  const router = useRouter()

  // State for loading and errors
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  // State for storing and displaying FAQs
  const [faqs, setFaqs] = useState<FAQ[]>([])

  // For creating a new FAQ
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")

  // For editing an existing FAQ
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState("")
  const [editingAnswer, setEditingAnswer] = useState("")

  // Check auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.push("/auth")
      }
    })
  }, [router])

  // Fetch existing FAQs on mount
  useEffect(() => {
    fetchFaqs()
  }, [])

  async function fetchFaqs() {
    try {
      setLoading(true)
      setErrorMessage("")

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session?.user?.id) {
        setErrorMessage("No user session. Please log in.")
        setLoading(false)
        return
      }
      const userId = sessionData.session.user.id

      const { data, error } = await supabase
        .from("FAQ")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })

      if (error) {
        setErrorMessage("Error fetching FAQs: " + error.message)
      } else if (data) {
        setFaqs(data as FAQ[])
      }
    } catch (err) {
      console.error("fetchFaqs error:", err)
      setErrorMessage("Unknown error fetching FAQs.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setErrorMessage("Please enter both question and answer.")
      return
    }

    try {
      setLoading(true)
      setErrorMessage("")

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session?.user?.id) {
        setErrorMessage("No user session. Please log in.")
        setLoading(false)
        return
      }
      const userId = sessionData.session.user.id

      const { data, error } = await supabase
        .from("FAQ")
        .insert({
          userId,
          question: newQuestion.trim(),
          answer: newAnswer.trim()
        })
        .select()
        .single()

      if (error) {
        setErrorMessage("Error creating FAQ: " + error.message)
      } else if (data) {
        setFaqs((prev) => [data as FAQ, ...prev])
        setNewQuestion("")
        setNewAnswer("")
      }
    } catch (err) {
      console.error("handleCreate error:", err)
      setErrorMessage("Unknown error creating FAQ.")
    } finally {
      setLoading(false)
    }
  }

  function startEditing(faq: FAQ) {
    setEditingId(faq.id)
    setEditingQuestion(faq.question)
    setEditingAnswer(faq.answer)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingQuestion("")
    setEditingAnswer("")
  }

  async function handleUpdate() {
    if (!editingId) return

    if (!editingQuestion.trim() || !editingAnswer.trim()) {
      setErrorMessage("Please enter both question and answer.")
      return
    }

    try {
      setLoading(true)
      setErrorMessage("")

      const { error, data } = await supabase
        .from("FAQ")
        .update({
          question: editingQuestion.trim(),
          answer: editingAnswer.trim()
        })
        .eq("id", editingId)
        .select()
        .single()

      if (error) {
        setErrorMessage("Error updating FAQ: " + error.message)
      } else if (data) {
        setFaqs((prev) => prev.map((f) => (f.id === editingId ? data : f)))
        cancelEditing()
      }
    } catch (err) {
      console.error("handleUpdate error:", err)
      setErrorMessage("Unknown error updating FAQ.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this FAQ?")
    if (!confirmed) return

    try {
      setLoading(true)
      setErrorMessage("")

      const { error } = await supabase.from("FAQ").delete().eq("id", id)

      if (error) {
        setErrorMessage("Error deleting FAQ: " + error.message)
      } else {
        setFaqs((prev) => prev.filter((f) => f.id !== id))
      }
    } catch (err) {
      console.error("handleDelete error:", err)
      setErrorMessage("Unknown error deleting FAQ.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow max-w-xl mx-auto">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {/* Create or Edit Form */}
      {editingId ? (
        <div className="mb-6">
          <label className="font-semibold block mb-1" htmlFor="editingQuestion">
            Edit Question
          </label>
          <textarea
            id="editingQuestion"
            rows={3}
            className="w-full border px-3 py-2 rounded text-sm mb-2"
            value={editingQuestion}
            onChange={(e) => setEditingQuestion(e.target.value)}
          />

          <label className="font-semibold block mb-1" htmlFor="editingAnswer">
            Edit Answer
          </label>
          <textarea
            id="editingAnswer"
            rows={3}
            className="w-full border px-3 py-2 rounded text-sm mb-2"
            value={editingAnswer}
            onChange={(e) => setEditingAnswer(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Update
            </button>
            <button
              onClick={cancelEditing}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <label className="font-semibold block mb-1" htmlFor="newQuestion">
            New FAQ Question
          </label>
          <textarea
            id="newQuestion"
            rows={3}
            className="w-full border px-3 py-2 rounded text-sm mb-2"
            placeholder="Enter new question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />

          <label className="font-semibold block mb-1" htmlFor="newAnswer">
            New FAQ Answer
          </label>
          <textarea
            id="newAnswer"
            rows={3}
            className="w-full border px-3 py-2 rounded text-sm mb-2"
            placeholder="Enter the answer..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
          />

          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Create
          </button>
        </div>
      )}

      <hr className="my-4" />

      {/* Display Existing FAQs */}
      {faqs.length === 0 ? (
        <p className="text-sm text-gray-700">No FAQs found.</p>
      ) : (
        <ul className="space-y-4">
          {faqs.map((faq) => (
            <li
              key={faq.id}
              className="border border-gray-200 p-3 rounded shadow-sm"
            >
              <p className="text-sm font-semibold mb-1">
                Q: {faq.question}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                A: {faq.answer}
              </p>

              <div className="text-xs text-gray-400 mb-2">
                Created: {new Date(faq.createdAt).toLocaleString()}
                <br />
                Updated: {new Date(faq.updatedAt).toLocaleString()}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => startEditing(faq)}
                  className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
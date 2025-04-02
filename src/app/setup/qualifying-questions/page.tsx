"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

interface QualifyingQuestion {
  id: string
  userId: string
  question: string
  createdAt: string
  updatedAt: string
}

export default function SetupQualifyingQuestionsPage() {
  const router = useRouter()

  // For loading states and possible errors
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  // For showing the list of Qualifying Questions
  const [questions, setQuestions] = useState<QualifyingQuestion[]>([])

  // For creating a new question
  const [newQuestion, setNewQuestion] = useState("")

  // For editing an existing question
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState("")

  useEffect(() => {
    // Check auth session
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.push("/auth")
      }
    })
  }, [router])

  useEffect(() => {
    fetchQualifyingQuestions()
  }, [])

  async function fetchQualifyingQuestions() {
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
        .from("QualifyingQuestion")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })

      if (error) {
        setErrorMessage("Error fetching qualifying questions: " + error.message)
      } else if (data) {
        setQuestions(data as QualifyingQuestion[])
      }
    } catch (err) {
      console.error("fetchQualifyingQuestions error:", err)
      setErrorMessage("Unknown error fetching questions.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!newQuestion.trim()) {
      setErrorMessage("Please enter a question.")
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
        .from("QualifyingQuestion")
        .insert({ userId, question: newQuestion.trim() })
        .select()
        .single()

      if (error) {
        setErrorMessage("Error creating question: " + error.message)
      } else if (data) {
        setQuestions((prev) => [data as QualifyingQuestion, ...prev])
        setNewQuestion("")
      }
    } catch (err) {
      console.error("handleCreate error:", err)
      setErrorMessage("Unknown error creating question.")
    } finally {
      setLoading(false)
    }
  }

  function startEditing(question: QualifyingQuestion) {
    setEditingId(question.id)
    setEditingValue(question.question)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingValue("")
  }

  async function handleUpdate() {
    if (!editingId) return

    if (!editingValue.trim()) {
      setErrorMessage("Please enter a question.")
      return
    }

    try {
      setLoading(true)
      setErrorMessage("")

      const { error, data } = await supabase
        .from("QualifyingQuestion")
        .update({ question: editingValue.trim() })
        .eq("id", editingId)
        .select()
        .single()

      if (error) {
        setErrorMessage("Error updating question: " + error.message)
      } else if (data) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingId ? data as QualifyingQuestion : q))
        )
        cancelEditing()
      }
    } catch (err) {
      console.error("handleUpdate error:", err)
      setErrorMessage("Unknown error updating question.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this question?")
    if (!confirmed) return

    try {
      setLoading(true)
      setErrorMessage("")

      const { error } = await supabase
        .from("QualifyingQuestion")
        .delete()
        .eq("id", id)

      if (error) {
        setErrorMessage("Error deleting question: " + error.message)
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== id))
      }
    } catch (err) {
      console.error("handleDelete error:", err)
      setErrorMessage("Unknown error deleting question.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Qualifying Questions</h2>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Qualifying Questions</h2>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {editingId ? (
        <div className="mb-6">
          <label htmlFor="editingQuestion" className="font-semibold block mb-1">
            Edit Question
          </label>
          <textarea
            id="editingQuestion"
            rows={3}
            className="w-full border px-3 py-2 rounded text-sm mb-2"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
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
          <label htmlFor="newQuestion" className="font-semibold block mb-1">
            Add New Question
          </label>
          <textarea
            id="newQuestion"
            rows={3}
            className="w-full border px-3 py-2 rounded text-sm mb-2"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
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

      {questions.length === 0 ? (
        <p className="text-sm text-gray-700">No Qualifying Questions found.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q) => (
            <li key={q.id} className="border border-gray-200 p-3 rounded shadow-sm">
              <p className="text-sm mb-2 whitespace-pre-line">{q.question}</p>
              <div className="text-xs text-gray-400 mb-2">
                Created: {new Date(q.createdAt).toLocaleString()}
                <br />
                Updated: {new Date(q.updatedAt).toLocaleString()}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => startEditing(q)}
                  className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
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
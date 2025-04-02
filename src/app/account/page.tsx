"use client"

import { useEffect, useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function AccountPage() {
  const router = useRouter()

  // For checking auth
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  // Basic user info from "profiles" table
  const [userId, setUserId] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [fullName, setFullName] = useState<string>("")
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [address, setAddress] = useState<string>("")

  // Editing mode
  const [isEditing, setIsEditing] = useState(false)

  // For changing password
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordStatus, setPasswordStatus] = useState("")

  // For displaying or updating user creation date or other metadata
  const [createdAt, setCreatedAt] = useState<string>("")

  // For "delete account" feedback
  const [deleteStatus, setDeleteStatus] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        console.error("Session error:", error)
        setErrorMessage("Error retrieving session.")
        setLoading(false)
        return
      }

      if (!data?.session) {
        router.push("/auth")
      } else {
        const sessionUser = data.session.user
        if (sessionUser) {
          setUserId(sessionUser.id)
          setUserEmail(sessionUser.email ?? "")
          // Fetch additional profile data from "profiles" table
          await fetchProfile(sessionUser.id)
        }
      }
    })
  }, [router])

  async function fetchProfile(uid: string) {
    try {
      setLoading(true)
      setErrorMessage("")

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single()

      if (error) {
        // It's possible the user doesn't have a profile row yet
        console.log("No profile row found. You can create one.")
        setLoading(false)
        return
      }

      if (data) {
        // If found, populate fields
        setFullName(data.full_name ?? "")
        setPhoneNumber(data.phone_number ?? "")
        setAddress(data.address ?? "")
        if (data.created_at) {
          setCreatedAt(new Date(data.created_at).toLocaleString())
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setErrorMessage("Unknown error fetching profile.")
    } finally {
      setLoading(false)
    }
  }

  // Toggle editing
  function handleEditToggle() {
    setIsEditing(!isEditing)
    setErrorMessage("")
  }

  async function handleSaveProfile() {
    setLoading(true)
    setErrorMessage("")

    try {
      // Upsert user profile in "profiles" table
      // We'll assume the user already has a row or not, "upsert" will handle either case
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email: userEmail.trim(),
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          address: address.trim()
        })

      if (error) {
        setErrorMessage("Error saving profile: " + error.message)
      } else {
        setIsEditing(false)
      }
    } catch (err) {
      console.error("Error saving profile:", err)
      setErrorMessage("An unknown error occurred while saving.")
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setPasswordStatus("")
    setErrorMessage("")

    // This is a placeholder approach since Supabase typically doesn't require the current password if the session is valid.
    // We'll do a signInWithPassword if we want to confirm the current password.

    try {
      // Step 1: Verify current password (optional step if needed)
      if (currentPassword) {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: userEmail,
            password: currentPassword
          })

        if (signInError) {
          setErrorMessage("Current password is incorrect.")
          setLoading(false)
          return
        }

        if (!signInData.session) {
          setErrorMessage("Unable to verify current password. Please try again.")
          setLoading(false)
          return
        }
      }

      // Step 2: Update to new password
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        setErrorMessage("Error updating password: " + updateError.message)
      } else {
        setPasswordStatus("Password updated successfully!")
        setCurrentPassword("")
        setNewPassword("")
      }
    } catch (err) {
      console.error("Error updating password:", err)
      setErrorMessage("Unknown error updating password.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteStatus("")
    setErrorMessage("")

    // Example: You might require user to confirm a prompt or do a re-auth check
    const confirmed = window.confirm("Are you sure you want to delete your account?")
    if (!confirmed) return

    // This operation typically requires a service role key or some admin privileges
    // We'll just show a placeholder message for now.
    setDeleteStatus("Account deletion is not fully implemented.")
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 text-black">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        <div className="bg-white p-4 rounded shadow">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black">
      <h1 className="text-2xl font-bold mb-6">Account</h1>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Profile</h2>
          {!isEditing ? (
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Save
              </button>
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-medium block mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded text-sm"
              value={userEmail}
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed here.
            </p>
          </div>

          <div>
            <label className="font-medium block mb-1">Full Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="font-medium block mb-1">Phone Number</label>
            <input
              type="text"
              className="w-full p-2 border rounded text-sm"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="font-medium block mb-1">Address</label>
            <textarea
              className="w-full p-2 border rounded text-sm"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          {createdAt && (
            <div>
              <label className="font-medium block mb-1">Member Since</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-sm bg-gray-100 text-gray-500"
                value={createdAt}
                readOnly
              />
            </div>
          )}
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        {passwordStatus && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">
            {passwordStatus}
          </div>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
          <div>
            <label htmlFor="currentPassword" className="font-medium block mb-1">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              className="w-full p-2 border rounded text-sm"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank if you do not need to confirm current password.
            </p>
          </div>

          <div>
            <label htmlFor="newPassword" className="font-medium block mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              className="w-full p-2 border rounded text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Danger Zone / Delete Account Section */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Danger Zone</h2>
        {deleteStatus && (
          <div className="bg-yellow-100 text-yellow-700 p-2 rounded mb-4 text-sm">
            {deleteStatus}
          </div>
        )}
        <p className="text-sm text-gray-700 mb-4">
          Deleting your account is permanent. All data will be lost and cannot
          be recovered. 
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Delete Account
        </button>
      </div>
    </div>
  )
}
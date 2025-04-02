"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function SettingsPage() {
  const router = useRouter()

  // Track loading and error states
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  // Basic user info from Supabase
  const [userEmail, setUserEmail] = useState("")
  const [fullName, setFullName] = useState("")

  // Subscription details (example fields)
  const [subscriptionPlan, setSubscriptionPlan] = useState("free")
  const [subscriptionExpires, setSubscriptionExpires] = useState("N/A")

  // Notification preferences (example toggles)
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true)
  const [enableSMSNotifications, setEnableSMSNotifications] = useState(false)

  // For success or status messages
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    // Check if the user is logged in
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.push("/auth")
      } else {
        // If session exists, fetch user data
        fetchUserSettings(data.session.user.id).catch((err) => {
          console.error("Error fetching user settings:", err)
          setErrorMessage("Failed to fetch user settings.")
          setLoading(false)
        })
      }
    })
  }, [router])

  async function fetchUserSettings(userId: string) {
    try {
      setLoading(true)
      // Example: fetch user profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        setErrorMessage("No user profile found. Please create one first.")
        setLoading(false)
        return
      }

      if (data) {
        // Populate with user data
        setUserEmail(data.email ?? "")
        setFullName(data.full_name ?? "")
        setSubscriptionPlan(data.subscription_plan ?? "free")
        setSubscriptionExpires(data.subscription_expires ?? "N/A")
        setEnableEmailNotifications(data.notify_email ?? true)
        setEnableSMSNotifications(data.notify_sms ?? false)
      }
    } catch (err) {
      console.error("Error in fetchUserSettings:", err)
      setErrorMessage("Unknown error while fetching settings.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveChanges() {
    setLoading(true)
    setStatusMessage("")
    setErrorMessage("")

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session?.user?.id) {
        setErrorMessage("No user session. Please log in again.")
        setLoading(false)
        return
      }

      const userId = sessionData.session.user.id

      // Update or insert user profile in "profiles" table (example)
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email: userEmail.trim(),
          full_name: fullName.trim(),
          subscription_plan: subscriptionPlan,
          subscription_expires: subscriptionExpires,
          notify_email: enableEmailNotifications,
          notify_sms: enableSMSNotifications
        })

      if (error) {
        setErrorMessage("Error saving settings: " + error.message)
      } else {
        setStatusMessage("Settings saved successfully!")
      }
    } catch (err) {
      console.error("Error saving settings:", err)
      setErrorMessage("An unknown error occurred while saving.")
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    // For demo, simply reset fields or navigate away
    setStatusMessage("")
    setErrorMessage("")
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 text-black">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <div className="bg-white p-4 rounded shadow">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {statusMessage && (
        <div className="bg-green-100 text-green-700 p-2 rounded mb-4">
          {statusMessage}
        </div>
      )}

      <div className="bg-white p-4 rounded shadow space-y-6">
        {/* Profile Information */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Profile</h2>
          <div className="mb-4">
            <label htmlFor="fullName" className="block font-medium mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="border p-2 w-full rounded"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="border p-2 w-full rounded"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
        </section>

        {/* Subscription Details */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Subscription</h2>
          <div className="mb-4">
            <label htmlFor="subscriptionPlan" className="block font-medium mb-1">
              Plan
            </label>
            <select
              id="subscriptionPlan"
              className="border p-2 w-full rounded"
              value={subscriptionPlan}
              onChange={(e) => setSubscriptionPlan(e.target.value)}
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="subscriptionExpires"
              className="block font-medium mb-1"
            >
              Expires On
            </label>
            <input
              id="subscriptionExpires"
              type="text"
              disabled
              className="border p-2 w-full rounded bg-gray-100 text-gray-600"
              value={subscriptionExpires}
            />
          </div>
        </section>

        {/* Notification Preferences */}
        <section>
          <h2 className="text-lg font-semibold mb-2">Notifications</h2>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="emailNotifications"
              className="mr-2"
              checked={enableEmailNotifications}
              onChange={(e) => setEnableEmailNotifications(e.target.checked)}
            />
            <label htmlFor="emailNotifications">Enable Email Notifications</label>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="smsNotifications"
              className="mr-2"
              checked={enableSMSNotifications}
              onChange={(e) => setEnableSMSNotifications(e.target.checked)}
            />
            <label htmlFor="smsNotifications">Enable SMS Notifications</label>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
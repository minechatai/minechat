"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function SetupIndexPage() {
  const router = useRouter()

  useEffect(() => {
    // If you'd prefer to redirect to /setup/channels or any specific subpage, uncomment below:
    // router.replace("/setup/channels")

    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.push("/auth")
      }
    })
  }, [router])

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Setup Index</h2>
      <p className="text-sm text-gray-700">
        Welcome to the setup section. Use the sidebar or sub-routes to configure your account.
      </p>
    </div>
  )
}
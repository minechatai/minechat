"use client"

import { Geist, Geist_Mono } from "next/font/google"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { supabase } from "@/lib/supabase-client"
import { sidebarLinks } from "@/components/sidebar/sidebar-links"
import CollapsibleSidebar from "@/components/sidebar/collapsible-sidebar"

import "./globals.css"

// Load fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
})

export default function RootLayoutClient({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [session, setSession] = useState<any>(null)

  // Track user session
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
    })

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}>
      {/* Only render the sidebar if there is an active session */}
      {session && (
        <CollapsibleSidebar
          title="Minechat.ai"
          links={sidebarLinks}
          onLogout={handleLogout}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      )}

      {/* If no session, render a basic top nav */}
      {!session && (
        <nav
          className="fixed w-full z-40 bg-gradient-to-r from-[#0d0d0d] to-[#2a2a2a] text-[--foreground] shadow-lg p-4 flex justify-between items-center"
          style={{ marginLeft: 0 }}
        >
          <div className="font-extrabold text-xl tracking-wide">
            <Link href="/" className="hover:opacity-80 transition-all">
              Minechat.ai
            </Link>
          </div>

          <div className="flex gap-8 items-center">
            <Link
              href="/auth"
              className="bg-[--accent-blue] hover:bg-[--accent-red] transition-colors text-white font-semibold py-2 px-5 rounded-md text-sm shadow-md"
            >
              Get Started
            </Link>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main
        className={`min-h-screen bg-gray-50 text-black transition-all 
          ${session ? (collapsed ? "ml-16" : "ml-64") : "ml-0"} 
          ${session ? "" : "pt-16"}`}
      >
        {children}
      </main>
    </div>
  )
}
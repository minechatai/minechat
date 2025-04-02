"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase-client"

export default function Home() {
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[--accent-blue] to-[--accent-red] text-white p-4">
      {/* Hero Section */}
      <motion.div
        className="flex flex-col items-center gap-8 py-10 px-4 w-full max-w-5xl"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center">
          Welcome to Minechat.ai
        </h1>

        <p className="text-center text-lg sm:text-xl max-w-2xl text-white/90 leading-relaxed">
          Minechat.ai helps you connect with leads, respond faster with AI-powered
          assistance, and keep track of your entire sales conversation flow
          in one seamless dashboard.
        </p>

        <button
          onClick={() => router.push("/auth")}
          className="bg-[--accent-blue] hover:bg-[--accent-red] transition-colors text-white font-semibold py-2 px-6 rounded-md text-lg shadow-lg"
        >
          Get Started
        </button>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="grid gap-8 py-8 px-4 w-full max-w-6xl sm:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.8,
              ease: "easeOut",
              staggerChildren: 0.2
            }
          }
        }}
      >
        {[
          {
            title: "Multi-Platform Inbox",
            text: "Combine Messenger, Instagram, Telegram, and more into a single interface for easy management."
          },
          {
            title: "AI Assistance",
            text: "Save time by letting the AI respond to common inquiries and frequently asked questions."
          },
          {
            title: "CRM Integration",
            text: "Track your leads, opportunities, and follow-ups seamlessly in one place."
          }
        ].map(({ title, text }, i) => (
          <motion.div
            key={i}
            className="bg-background text-foreground rounded-md p-6 flex flex-col items-center shadow-lg"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <p className="text-sm text-center">{text}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Footer Section */}
      <motion.div
        className="py-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <button
          onClick={() => router.push("/auth")}
          className="bg-[--accent-blue] hover:bg-[--accent-red] transition-colors text-white font-semibold py-2 px-6 rounded-md text-lg shadow-xl"
        >
          Start Now
        </button>
      </motion.div>
    </div>
  )
}
"use client"

import { useState, FormEvent, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  // For router navigation
  const router = useRouter()

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  // Toggle for log in vs. sign up
  const [showSignUp, setShowSignUp] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  // Handle sign up with email/password
  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage("")
    setIsSuccess(false)

    if (!email || !password) {
      setErrorMessage("Please fill in all fields.")
      return
    }

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setErrorMessage(error.message)
      return
    }

    setIsSuccess(true)
    setEmail("")
    setPassword("")
  }

  // Handle login with email/password
  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage("")
    setIsSuccess(false)

    if (!email || !password) {
      setErrorMessage("Please fill in all fields.")
      return
    }

    // Attempt to log in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setErrorMessage(error.message)
      return
    }

    // Retrieve session after successful login
    const { data: loginSession } = await supabase.auth.getSession()
    if (loginSession.session) {
      // Redirect to dashboard upon success
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0055ff] to-[#ff0000] flex items-center justify-center p-4">
      <motion.div
        className="bg-background text-foreground w-full max-w-sm rounded-md shadow-md p-8 flex flex-col"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          {showSignUp ? "Sign Up for Minechat.ai" : "Log In to Minechat.ai"}
        </h1>

        {showSignUp ? (
          // Sign Up Form
          <form onSubmit={handleSignUp} className="flex flex-col">
            <label htmlFor="signup-email" className="mb-1 font-semibold">
              Email
            </label>
            <input
              id="signup-email"
              className="border border-gray-400 rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[--accent-blue]"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="signup-password" className="mb-1 font-semibold">
              Password
            </label>
            <input
              id="signup-password"
              className="border border-gray-400 rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[--accent-blue]"
              placeholder="Create a password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {errorMessage && (
              <motion.p
                className="text-red-500 text-sm mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errorMessage}
              </motion.p>
            )}

            {isSuccess && (
              <motion.p
                className="text-green-500 text-sm mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Sign-up successful! You can now log in.
              </motion.p>
            )}

            <button
              type="submit"
              className="bg-[--accent-blue] hover:bg-[--accent-red] text-white rounded-md py-2 font-semibold transition-colors"
            >
              Sign Up
            </button>

            <p className="mt-4 text-sm text-center">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setShowSignUp(false)
                  setErrorMessage("")
                  setIsSuccess(false)
                }}
                className="text-[--accent-blue] hover:text-[--accent-red]"
              >
                Log In
              </button>
            </p>
          </form>
        ) : (
          // Login Form
          <form onSubmit={handleLogin} className="flex flex-col">
            <label htmlFor="login-email" className="mb-1 font-semibold">
              Email
            </label>
            <input
              id="login-email"
              className="border border-gray-400 rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[--accent-blue]"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="login-password" className="mb-1 font-semibold">
              Password
            </label>
            <input
              id="login-password"
              className="border border-gray-400 rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-[--accent-blue]"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {errorMessage && (
              <motion.p
                className="text-red-500 text-sm mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errorMessage}
              </motion.p>
            )}

            <button
              type="submit"
              className="bg-[--accent-blue] hover:bg-[--accent-red] text-white rounded-md py-2 font-semibold transition-colors"
            >
              Log In
            </button>

            <p className="mt-4 text-sm text-center">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setShowSignUp(true)
                  setErrorMessage("")
                  setIsSuccess(false)
                }}
                className="text-[--accent-blue] hover:text-[--accent-red]"
              >
                Sign Up
              </button>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  )
}
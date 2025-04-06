"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  ChevronDown,
  LogOut,
  Moon,
  Settings,
  Sun,
  User
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const router = useRouter()

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Here you would typically also update your theme context/local storage
  }

  const handleLogout = () => {
    // Add logout logic here
    router.push("/sign-in")
  }

  return (
    <header className="fixed left-[268px] right-0 top-0 flex h-[72px] flex-col items-center justify-center border-b border-[#E9EEF1] bg-white px-8">
      <div className="flex w-full items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg bg-[#F4F6FC] transition-colors hover:bg-[#E4E6EC]"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-[18px] text-[#474C59]" />
          </Button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Theme toggle */}
          <div className="flex items-center gap-[55px]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {isDarkMode ? "Dark mode" : "Light mode"}
              </span>
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="relative h-6 w-12 cursor-pointer rounded-full border border-[#F5F6FA] bg-white p-0.5 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-5 w-full items-center gap-1">
                  <div
                    className={`flex size-5 items-center justify-center rounded-full transition-colors ${
                      isDarkMode
                        ? "bg-white"
                        : "bg-gradient-to-br from-[#87174F] via-[#AB2856] to-[#B73A4E]"
                    }`}
                  >
                    <Moon
                      className={`size-3 ${isDarkMode ? "text-[#A8AEBF]" : "text-white"}`}
                    />
                  </div>
                  <div
                    className={`flex size-5 items-center justify-center rounded-full transition-colors ${
                      isDarkMode
                        ? "bg-gradient-to-br from-[#87174F] via-[#AB2856] to-[#B73A4E]"
                        : "bg-white"
                    }`}
                  >
                    <Sun
                      className={`size-3 ${isDarkMode ? "text-white" : "text-[#A8AEBF]"}`}
                    />
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* User profile */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-11 items-center gap-2 rounded-lg border border-[#F0F1F5] bg-white px-2 py-1.5 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative size-8 overflow-hidden rounded">
                      <Image
                        src="/placeholder.jpg"
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-semibold text-[#0A0A0A]">
                      Mahfuzul Nabil
                    </span>
                  </div>
                  <ChevronDown className="size-4 text-[#0A0A0A]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-11 w-0.5 bg-[#EBEDF0]" />

            <Button
              onClick={() => router.push("/app")}
              className="size-11 rounded-lg border border-[#F0F1F5] bg-white p-[7px] hover:bg-gray-50"
              variant="ghost"
            >
              <div className="h-6 w-[29px] bg-gradient-to-br from-[#1446A0] to-[#C04CFD]" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

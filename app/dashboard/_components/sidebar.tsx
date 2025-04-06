"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageCircle,
  Settings,
  BarChart2,
  User,
  LogOut
} from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard"
  },
  {
    label: "Chat",
    icon: MessageCircle,
    href: "/dashboard/chat"
  },
  {
    label: "Setup",
    icon: Settings,
    href: "/dashboard/setup"
  },
  {
    label: "CRM",
    icon: BarChart2,
    href: "/dashboard/crm"
  },
  {
    label: "Accounts",
    icon: User,
    href: "/dashboard/accounts"
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-[72px] items-center border-b border-[#E9EEF1] px-4">
        <Image
          src="/new-minechat-logo-transparent.png"
          alt="Minechat.ai"
          width={165}
          height={29}
        />
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-[572px] p-4">
        <div className="flex flex-col gap-2">
          {routes.map(route => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex h-11 items-center justify-between rounded-lg px-4 transition-colors",
                pathname === route.href ? "bg-[#FCF2F4]" : "hover:bg-[#F5F6FA]"
              )}
            >
              <div className="flex items-center gap-3">
                <route.icon
                  className={cn(
                    "size-5",
                    pathname === route.href
                      ? "text-[#87174F]"
                      : "text-[#A8AEBF]"
                  )}
                />
                <span
                  className={cn(
                    "text-base font-medium leading-6",
                    pathname === route.href
                      ? "bg-gradient-to-r from-[#87174F] via-[#AB2856] to-[#B73A4E] bg-clip-text text-transparent"
                      : "text-[#A8AEBF]"
                  )}
                >
                  {route.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <Link
          href="/logout"
          className="flex h-12 items-center justify-between rounded-lg border border-[#EBEDF0] px-4"
        >
          <div className="flex items-center gap-3">
            <LogOut className="size-5 text-[#0A0A0A]" />
            <span className="text-base font-medium leading-6 text-[#0A0A0A]">
              Logout
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}

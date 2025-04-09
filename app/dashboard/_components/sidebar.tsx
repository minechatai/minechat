"use client"

import { useState } from "react";
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
  LogOut,
  ChevronDown 
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
    href: "/dashboard/chats"
  },
  {
    label: "Setup",
    icon: Settings,
    href: "/dashboard/setup",
    children: [
      {
        label: "AI Assistant",
        href: "/dashboard/setup/aiassistant"
      },
      {
        label: "Channels",
        href: "/dashboard/setup/channels"
      },
    ]
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

function NormalLink(pathname: string, linkInfo: any) {

  let iconToUse = <div
    className={cn(
      "w-[1px] h-11 mr-4",
      pathname.indexOf(linkInfo.href) > -1
        ? "bg-gradient-to-r from-[#87174F] via-[#AB2856] to-[#B73A4E]"
        : "bg-[#A8AEBF]"
    )}
  ></div>

  if (linkInfo.icon != null) {
    iconToUse = <linkInfo.icon
      className={cn(
        "size-5",
        pathname === linkInfo.href
          ? "text-[#87174F]"
          : "text-[#A8AEBF]"
      )}
    />
  }

  return (
    <Link
      key={linkInfo.href}
      href={linkInfo.href}
      className={cn(
        "flex h-11 items-center justify-between rounded-lg px-4 transition-colors",
        pathname === linkInfo.href ? "bg-[#FCF2F4]" : "hover:bg-[#F5F6FA]"
      )}
    >
      <div className="flex items-center gap-3">
        {iconToUse}
        <span
          className={cn(
            "text-base font-medium leading-6",
            pathname === linkInfo.href
              ? "bg-gradient-to-r from-[#87174F] via-[#AB2856] to-[#B73A4E] bg-clip-text text-transparent"
              : "text-[#A8AEBF]"
          )}
        >
          {linkInfo.label}
        </span>
      </div>
    </Link>
  )
}

function MyAccordion(pathname: string, linkInfo: any) {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("AI Assistant");

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-lg px-4 transition-colors"
      )}>
      {/* Setup Header */}
      <div
        className={cn(
          "w-full"
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <linkInfo.icon
            className={cn(
              "size-5",
              pathname.indexOf(linkInfo.href) > -1
                ? "text-[#87174F]"
                : "text-[#A8AEBF]"
            )}
          />
          <span
            className={cn(
              "text-base font-medium leading-6",
              pathname.indexOf(linkInfo.href) > -1
                ? "bg-gradient-to-r from-[#87174F] via-[#AB2856] to-[#B73A4E] bg-clip-text text-transparent"
                : "text-[#A8AEBF]"
            )}
          >
            {linkInfo.label}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")}
          />
        </div>
      </div>

      {/* Menu Items */}
      {open && (
        <div className="ml-8 mt-2">
          {linkInfo.children == null ? 
            <div></div> : 
            linkInfo.children.map((subLinkInfo: any) => NormalLink(pathname, subLinkInfo))
          }
        </div>
      )}
    </div>
  )
}

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
          {NormalLink(pathname, routes[0])}
          {NormalLink(pathname, routes[1])}
          {MyAccordion(pathname, routes[2])}
          {NormalLink(pathname, routes[3])}
          {NormalLink(pathname, routes[4])}
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

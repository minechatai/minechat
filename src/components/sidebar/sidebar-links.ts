"use client"

import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  BarChart
} from "lucide-react"

export interface SidebarLinkChild {
  label: string
  path: string
}

export interface SidebarLink {
  label: string
  path?: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  children?: SidebarLinkChild[]
}

export const sidebarLinks: SidebarLink[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard
  },
  {
    label: "Chat",
    path: "/chat",
    icon: MessageSquare
  },
  {
    label: "Setup",
    icon: Settings,
    // We omit 'path' here, so the top-level item acts as a toggler rather than an immediate link
    children: [
      {
        label: "Channels",
        path: "/setup/channels"
      },
      {
        label: "AI Assistant Setup",
        path: "/setup/assistant"
      },
      {
        label: "Business Info",
        path: "/setup/business-info"
      },
      {
        label: "Analyze Messages",
        path: "/setup/analyze-messages"
      },
      {
        label: "Conversation Flow",
        path: "/setup/conversation-flow"
      },
      {
        label: "Qualifying Questions",
        path: "/setup/qualifying-questions"
      },
      {
        label: "FAQs",
        path: "/setup/faqs"
      }
    ]
  },
  {
    label: "CRM",
    path: "/crm",
    icon: Users
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings
  },
  {
    label: "Account",
    path: "/account",
    icon: Users
  }
]
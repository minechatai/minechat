"use client"

import { useSidebar } from "@/components/providers/sidebar-provider"
import { cn } from "@/lib/utils"
import React from "react"

interface ClientLayoutProps {
  children: React.ReactNode[] // Changed to ReactNode[] to indicate it's an array
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="relative h-full">
      <div className="bg-background z-[80] hidden h-full md:fixed md:inset-y-0 md:flex md:flex-col">
        {children[0] && children[0]} {/* Sidebar with null check */}
      </div>
      <div className="fixed right-4 top-4 z-[90]">
        {children[1] && children[1]} {/* Theme Toggle with null check */}
      </div>
      <main
        className={cn(
          "h-full transition-[padding] duration-300",
          isCollapsed ? "md:pl-16" : "md:pl-72"
        )}
      >
        {children[2] && children[2]} {/* Main Content with null check */}
      </main>
    </div>
  )
}

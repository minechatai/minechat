"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Home,
  Settings,
  PanelLeftClose,
  PanelLeft,
  MessageSquare,
  FileText,
  Cog
} from "lucide-react"
import { useSidebar } from "@/components/providers/sidebar-provider"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { isCollapsed, toggleCollapsed } = useSidebar()

  const routes = [
    {
      label: "Home",
      icon: Home,
      href: "/dashboard"
    },
    {
      label: "Chats",
      icon: MessageSquare,
      href: "/dashboard/chats"
    },
    {
      label: "Reports",
      icon: FileText,
      href: "/dashboard/reports"
    },
    {
      label: "Setup",
      icon: Cog,
      href: "/dashboard/setup"
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings"
    }
  ]

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "h-full border-r pb-12",
          isCollapsed ? "w-16" : "w-72",
          "transition-all duration-300"
        )}
      >
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <h2
                className={cn(
                  "mb-2 px-4 text-xl font-semibold tracking-tight",
                  isCollapsed && "hidden"
                )}
              >
                Dashboard
              </h2>
              <div className="flex flex-col gap-1">
                {routes.map(route => (
                  <Tooltip key={route.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          pathname === route.href ? "secondary" : "ghost"
                        }
                        className={cn(
                          "w-full justify-start",
                          isCollapsed && "justify-center px-2"
                        )}
                        asChild
                      >
                        <Link href={route.href}>
                          <route.icon
                            className={cn("size-4", !isCollapsed && "mr-2")}
                          />
                          {!isCollapsed && route.label}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        {route.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleCollapsed}
        className="absolute -right-4 top-2 size-8 rounded-full"
      >
        {isCollapsed ? (
          <PanelLeft className="size-4" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
      </Button>
    </div>
  )
}

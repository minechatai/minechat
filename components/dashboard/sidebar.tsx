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
import { Accordion } from "../ui/accordion"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {

  return <div></div>
/*
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
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>AI Assistant</AccordionTrigger>
                        <AccordionContent>
                          Yes. It adheres to the WAI-ARIA design pattern.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Business Information</AccordionTrigger>
                        <AccordionContent>
                          Yes. It comes with default styles that matches the other
                          omponents&apos; aesthetic.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger>Channels</AccordionTrigger>
                        <AccordionContent>
                          Yes. It's animated by default, but you can disable it if you prefer.
                        </AccordionContent>
                      </AccordionItem>                      
                    </Accordion>
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
    */
}

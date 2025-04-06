"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  MessageCircle,
  DollarSign,
  Users,
  Crown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

const stats = [
  {
    title: "Unread messages",
    value: "24",
    change: "+14%",
    icon: MessageCircle,
    iconColor: "text-rose-500",
    changeType: "increase"
  },
  {
    title: "Money Saved",
    value: "$360",
    change: "-18%",
    icon: DollarSign,
    iconColor: "text-green-500",
    changeType: "decrease"
  },
  {
    title: "Leads",
    value: "689",
    change: "+14%",
    icon: Users,
    iconColor: "text-blue-500",
    changeType: "increase"
  },
  {
    title: "Opportunities",
    value: "454",
    change: "-11%",
    icon: Crown,
    iconColor: "text-orange-500",
    changeType: "decrease"
  },
  {
    title: "Follow-ups",
    value: "12",
    change: "+0.9%",
    icon: Users,
    iconColor: "text-purple-500",
    changeType: "increase"
  }
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-5 gap-6">
      {stats.map(stat => (
        <Card key={stat.title} className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <stat.icon className={cn("size-5", stat.iconColor)} />
              <span className="text-muted-foreground text-sm">
                {stat.title}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-semibold">{stat.value}</h3>
              <div
                className={cn(
                  "flex items-center text-sm",
                  stat.changeType === "increase"
                    ? "text-green-600"
                    : "text-rose-600"
                )}
              >
                {stat.changeType === "increase" ? (
                  <ArrowUpRight className="size-4" />
                ) : (
                  <ArrowDownRight className="size-4" />
                )}
                {stat.change}
              </div>
            </div>
            <span className="text-muted-foreground text-xs">to last month</span>
          </div>
        </Card>
      ))}
    </div>
  )
}

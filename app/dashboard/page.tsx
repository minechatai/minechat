"use server"

import { Card } from "@/components/ui/card"
import { MessagesChart } from "./_components/messages-chart"
import { MostAskedQuestions } from "./_components/most-asked-questions"
import { MessagesSent } from "./_components/messages-sent"
import { StatsCards } from "./_components/stats-cards"
import { CalendarIcon } from "lucide-react"

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F4F6FC]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>1 Jan 2025 - 31 Dec 2025</span>
            <CalendarIcon className="size-4" />
          </div>
        </div>

        {/* Stats Grid */}
        <StatsCards />

        {/* Charts Grid */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Messages Sent</h2>
              <button className="text-muted-foreground hover:text-foreground">
                →
              </button>
            </div>
            <MessagesSent />
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Most Asked Questions</h2>
              <button className="text-muted-foreground hover:text-foreground">
                →
              </button>
            </div>
            <MostAskedQuestions />
          </Card>
        </div>

        {/* Messages Chart */}
        <Card className="mt-6 p-6">
          <h2 className="mb-6 text-lg font-semibold">
            Messages Received Per Hour
          </h2>
          <MessagesChart />
        </Card>
      </div>
    </div>
  )
}

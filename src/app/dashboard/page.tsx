"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts"

interface UniqueNewQuestionItem {
  id: string
  userId: string
  question: string
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const router = useRouter()

  const [leads, setLeads] = useState<number>(0)
  const [opportunities, setOpportunities] = useState<number>(0)
  // "timeSaved" is now calculated as (total AI messages) * 10 seconds.
  const [timeSaved, setTimeSaved] = useState<number>(0)
  const [askedForHuman, setAskedForHuman] = useState<number>(0)
  const [mostInquiredProduct, setMostInquiredProduct] = useState<string>("N/A")
  const [uniqueQuestionsList, setUniqueQuestionsList] = useState<UniqueNewQuestionItem[]>([])
  const [dailyMessageCount, setDailyMessageCount] = useState<number[]>(Array(24).fill(0))
  const [humanAiData, setHumanAiData] = useState<{ name: string; value: number }[]>([
    { name: "Human", value: 0 },
    { name: "AI", value: 0 }
  ])

  function formatSecondsToDHMS(seconds: number): string {
    if (seconds <= 0) return "0s"
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const dayStr = d > 0 ? `${d}d ` : ""
    const hourStr = h > 0 ? `${h}h ` : ""
    const minuteStr = m > 0 ? `${m}m ` : ""
    const secondStr = s > 0 ? `${s}s` : ""
    return `${dayStr}${hourStr}${minuteStr}${secondStr}`.trim() || "0s"
  }

  useEffect(() => {
    const fetchData = async () => {
      // Get current session; if no user, redirect to /auth.
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session?.user) {
        router.push("/auth")
        return
      }
      const userId = sessionData.session.user.id

      // Fetch Leads for the logged-in user.
      const { count: leadCount, error: leadErr } = await supabase
        .from("Lead")
        .select("*", { count: "exact", head: true })
        .eq("userId", userId)
      if (!leadErr && leadCount !== null) {
        setLeads(leadCount)
      }

      // Fetch Opportunities for the logged-in user.
      const { count: oppCount, error: oppErr } = await supabase
        .from("Opportunity")
        .select("*", { count: "exact", head: true })
        .eq("userId", userId)
      if (!oppErr && oppCount !== null) {
        setOpportunities(oppCount)
      }

      // Fetch conversation IDs (for later queries)
      const { data: convData, error: convErr } = await supabase
        .from("Conversation")
        .select("id")
        .eq("userId", userId)
      let conversationIds: string[] = []
      if (!convErr && convData) {
        conversationIds = convData.map((conv: any) => conv.id)
      }

      if (conversationIds.length === 0) {
        setDailyMessageCount(Array(24).fill(0))
        setHumanAiData([
          { name: "Human", value: 0 },
          { name: "AI", value: 0 }
        ])
        setTimeSaved(0)
      } else {
        // Fetch all ConversationMessages from these conversations in the past 24 hours.
        const now = new Date()
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const { data: msgData, error: msgErr } = await supabase
          .from("ConversationMessage")
          .select("*")
          .in("conversationId", conversationIds)
          .gte("date", twentyFourHoursAgo.toISOString())
          .order("date", { ascending: true })

        if (!msgErr && msgData) {
          const countsArray = Array(24).fill(0)
          msgData.forEach((record: any) => {
            const msgDate = new Date(record.date.replace(" ", "T"))
            const diffInMs = msgDate.getTime() - twentyFourHoursAgo.getTime()
            const hourIndex = Math.floor(diffInMs / (3600 * 1000))
            if (hourIndex >= 0 && hourIndex < 24) {
              countsArray[hourIndex] += 1
            }
          })
          setDailyMessageCount(countsArray)
        }

        // Fetch total AI messages for time saved calculation.
        const { count: totalAICount, error: totalAIError } = await supabase
          .from("ConversationMessage")
          .select("*", { count: "exact", head: true })
          .in("conversationId", conversationIds)
          .eq("sentByAI", true)
        if (!totalAIError && totalAICount !== null) {
          setTimeSaved(totalAICount * 10)
        }

        // For the Human vs. AI pie chart, we need to fetch the UserChannel to get the fbPageName.
        let fbPageName: string | null = null
        const { data: channelData, error: channelError } = await supabase
          .from("UserChannel")
          .select("fbPageName")
          .eq("userId", userId)
          .single()
        if (!channelError && channelData) {
          fbPageName = channelData.fbPageName
        }

        // Now fetch messages for Human vs. AI breakdown.
        if (!msgErr && msgData) {
          let humanCount = 0
          let aiCount = 0
          msgData.forEach((record: any) => {
            if (fbPageName && record.sender === fbPageName) {
              if (record.sentByAI) {
                aiCount++
              } else {
                humanCount++
              }
            }
          })
          setHumanAiData([
            { name: "Human", value: humanCount },
            { name: "AI", value: aiCount }
          ])
        }
      }

      // Fetch Unique New Questions for the logged-in user.
      const { data: newQData, error: newQErr } = await supabase
        .from("UniqueNewQuestion")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })
      if (!newQErr && newQData) {
        setUniqueQuestionsList(newQData)
      }

      // ------------------------------
      // New Section: Calculate Most Inquired Product
      // ------------------------------
      // Query all conversations for the current user and tally the mostInquiredProduct values.
      const { data: convMostData, error: convMostError } = await supabase
        .from("Conversation")
        .select("mostInquiredProduct")
        .eq("userId", userId)
      if (!convMostError && convMostData) {
        const productCounts: { [key: string]: number } = {}
        convMostData.forEach((conv: any) => {
          const product = conv.mostInquiredProduct
          if (product && product !== "None") {
            productCounts[product] = (productCounts[product] || 0) + 1
          }
        })
        let bestProduct = "None"
        let bestCount = 0
        for (const product in productCounts) {
          if (productCounts[product] > bestCount) {
            bestProduct = product
            bestCount = productCounts[product]
          }
        }
        setMostInquiredProduct(bestProduct)
      }
    }

    fetchData().catch((err) => {
      console.error("Error fetching dashboard data:", err)
    })
  }, [router])

  // Transform dailyMessageCount into data for the bar chart
  const chartData = dailyMessageCount.map((count, i) => ({
    hour: `${i}:00`,
    count
  }))

  function MetricLabel({ label, tooltip }: { label: string; tooltip: string }) {
    return (
      <div className="flex items-center gap-1 relative group w-fit">
        <span className="text-md font-semibold select-none">{label}</span>
        <span className="text-gray-400 cursor-pointer select-none">?</span>
        <div
          className="
            absolute
            bottom-full
            left-1/2
            -translate-x-1/2
            mb-1
            px-2
            py-1
            bg-black
            text-white
            text-xs
            rounded
            shadow-md
            whitespace-nowrap
            opacity-0
            scale-95
            group-hover:opacity-100
            group-hover:scale-100
            transition-all
            duration-200
            z-50
          "
        >
          {tooltip}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <MetricLabel label="Leads" tooltip="Potential customers who have shown interest." />
          <p className="text-xl font-bold mt-2">{leads}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <MetricLabel label="Opportunities" tooltip="Potential deals currently in progress." />
          <p className="text-xl font-bold mt-2">{opportunities}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <MetricLabel label="Time Saved" tooltip="Calculated as total AI messages × 10 seconds." />
          <p className="text-xl font-bold mt-2">{formatSecondsToDHMS(timeSaved)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <MetricLabel label="Asked For Human" tooltip="How many times a customer requested a human agent." />
          <p className="text-xl font-bold mt-2">{askedForHuman}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow col-span-1">
          <MetricLabel
            label="Human vs. AI"
            tooltip="Ratio of messages sent by a human vs. the AI in the last 24 hours"
          />
          <div className="flex items-center justify-center mt-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={humanAiData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  label
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#3b82f6" }} />
              <span>
                Human Messages (
                {humanAiData.find((d) => d.name === "Human")?.value || 0})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
              <span>
                AI Messages ({humanAiData.find((d) => d.name === "AI")?.value || 0})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <MetricLabel label="Most Inquired Product" tooltip="The product customers ask about most frequently." />
          <p className="text-xl font-bold mt-2">{mostInquiredProduct}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <MetricLabel label="Unique New Questions" tooltip="Fresh queries not covered in FAQs." />
          <div className="mt-2 max-h-32 overflow-y-auto flex flex-col gap-2">
            {uniqueQuestionsList.map((questionItem) => (
              <div
                key={questionItem.id}
                className="p-2 border border-gray-200 rounded bg-gray-50 shadow-sm text-sm text-gray-700"
              >
                <p className="font-medium">{questionItem.question}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-md font-semibold">24 Hour Message Counter</h2>
        <p className="text-sm text-gray-700 mt-2">
          Below is a bar graph representing hourly message counts for the past 24 hours:
        </p>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

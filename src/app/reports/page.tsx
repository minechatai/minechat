"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DailyMessageRecord {
  id: string
  userId: string
  date: string
  messageCount: number
  createdAt: string
  updatedAt: string
}

export default function ReportsPage() {
  const router = useRouter()

  // Loading and error handling
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  // Basic stats
  const [leadsCount, setLeadsCount] = useState(0)
  const [oppsCount, setOppsCount] = useState(0)

  // Daily Messages Info
  const [dailyMessages, setDailyMessages] = useState<DailyMessageRecord[]>([])
  const [averageDailyMessages, setAverageDailyMessages] = useState(0)
  const [topDayLabel, setTopDayLabel] = useState("")
  const [topDayCount, setTopDayCount] = useState(0)

  // Future projection data (naive linear regression of daily message counts)
  const [predictedCounts, setPredictedCounts] = useState<number[]>([])
  const [predictedLeads, setPredictedLeads] = useState<number[]>([]) // example "predicted leads" metric

  useEffect(() => {
    // Redirect if not logged in
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.push("/auth")
      }
    })
  }, [router])

  useEffect(() => {
    fetchData().catch((err) => {
      console.error("fetchData error:", err)
      setErrorMsg("Failed to fetch data.")
      setLoading(false)
    })
  }, [])

  async function fetchData() {
    setLoading(true)
    setErrorMsg("")

    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData?.session?.user?.id) {
      setErrorMsg("No user session. Please log in.")
      setLoading(false)
      return
    }
    const userId = sessionData.session.user.id

    // Fetch total leads
    const { count: leadCount, error: leadErr } = await supabase
      .from("Lead")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId)
    if (!leadErr && leadCount !== null) {
      setLeadsCount(leadCount)
    }

    // Fetch total opportunities
    const { count: opportunityCount, error: oppErr } = await supabase
      .from("Opportunity")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId)
    if (!oppErr && opportunityCount !== null) {
      setOppsCount(opportunityCount)
    }

    // Fetch daily message counts (last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const { data: dmcData, error: dmcErr } = await supabase
      .from("DailyMessageCount")
      .select("*")
      .eq("userId", userId)
      .gte("date", thirtyDaysAgo.toISOString())
      .order("date", { ascending: true })

    if (dmcErr) {
      setErrorMsg("Error fetching daily message counts: " + dmcErr.message)
      setLoading(false)
      return
    }

    const dailyData: DailyMessageRecord[] = dmcData || []
    setDailyMessages(dailyData)

    // Compute average, top day label + count
    if (dailyData.length > 0) {
      let totalMessages = 0
      let maxCount = 0
      let maxLabel = ""

      dailyData.forEach((rec) => {
        totalMessages += rec.messageCount
        if (rec.messageCount > maxCount) {
          maxCount = rec.messageCount
          const dateStr = new Date(rec.date).toLocaleDateString()
          maxLabel = dateStr
        }
      })

      setAverageDailyMessages(Math.round(totalMessages / dailyData.length))
      setTopDayCount(maxCount)
      setTopDayLabel(maxLabel)
    }

    // Naive linear regression for next 7 days prediction
    const counts = dailyData.map((d, i) => ({ x: i, y: d.messageCount }))
    if (counts.length > 1) {
      const { a, b } = linearRegression(counts)
      const futurePredictions: number[] = []
      const startIndex = counts.length
      for (let i = 0; i < 7; i++) {
        const x = startIndex + i
        const y = a * x + b
        futurePredictions.push(Math.round(y))
      }
      setPredictedCounts(futurePredictions)

      // Predicted leads: approx 1 lead per 50 messages
      const futureLeads = futurePredictions.map((msgCount) =>
        Math.round(msgCount / 50)
      )
      setPredictedLeads(futureLeads)
    }

    setLoading(false)
  }

  // Simple linear regression function (returns best-fit line y = a*x + b)
  function linearRegression(points: { x: number; y: number }[]): {
    a: number
    b: number
  } {
    const n = points.length
    const sumX = points.reduce((acc, p) => acc + p.x, 0)
    const sumY = points.reduce((acc, p) => acc + p.y, 0)
    const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0)
    const sumX2 = points.reduce((acc, p) => acc + p.x * p.x, 0)
    const numerator = n * sumXY - sumX * sumY
    const denominator = n * sumX2 - sumX * sumX
    const a = denominator === 0 ? 0 : numerator / denominator
    const b = (sumY - a * sumX) / n
    return { a, b }
  }

  // Prepare data for Recharts
  const barChartData = dailyMessages.map((rec) => ({
    date: new Date(rec.date).toLocaleDateString(),
    messageCount: rec.messageCount,
  }))

  const forecastData = predictedCounts.map((val, idx) => ({
    day: `+${idx + 1}`,
    messages: val,
    leads: predictedLeads[idx] || 0,
  }))

  // Recharts Bar Chart for Daily Messages (Past 30 Days)
  function renderBarChart() {
    if (barChartData.length === 0) {
      return <p className="text-sm text-gray-500">No daily messages data.</p>
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={barChartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="messageCount" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Recharts Line Chart for Message Forecast (Next 7 Days)
  function renderMessagesForecastChart() {
    if (forecastData.length === 0) {
      return <p className="text-sm text-gray-500">No forecast data.</p>
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={forecastData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="messages" stroke="#2563eb" name="Messages" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  // Recharts Line Chart for Leads Forecast (Next 7 Days)
  function renderLeadsForecastChart() {
    if (forecastData.length === 0) {
      return <p className="text-sm text-gray-500">No leads forecast data.</p>
    }
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={forecastData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="leads" stroke="#dc2626" name="Leads" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  function LoadingSpinner() {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-t-4 border-b-4 border-blue-600 rounded-full" />
        <p className="mt-2 text-gray-700">Loading data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {/* Basic Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow text-center">
              <h2 className="text-lg font-semibold">Total Leads</h2>
              <p className="text-2xl mt-2 font-bold">{leadsCount}</p>
            </div>

            <div className="bg-white p-4 rounded shadow text-center">
              <h2 className="text-lg font-semibold">Total Opportunities</h2>
              <p className="text-2xl mt-2 font-bold">{oppsCount}</p>
            </div>

            <div className="bg-white p-4 rounded shadow text-center">
              <h2 className="text-lg font-semibold">Avg Daily Msgs (30d)</h2>
              <p className="text-2xl mt-2 font-bold">{averageDailyMessages}</p>
            </div>

            <div className="bg-white p-4 rounded shadow text-center">
              <h2 className="text-lg font-semibold">Top Day (30d)</h2>
              {topDayLabel ? (
                <p className="text-sm mt-2">
                  {topDayLabel} - {topDayCount} msgs
                </p>
              ) : (
                <p className="text-sm mt-2">No data</p>
              )}
            </div>
          </div>

          {/* Past 30-day Bar Chart */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">
              Last 30 Days Message Counts
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              Bar chart representing daily messages for the last 30 days.
            </p>
            {renderBarChart()}
          </div>

          {/* Future 7-day Message Forecast */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">
              Next 7-Day Messages Forecast
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              A naive linear regression over your past data to predict daily
              messages for the next 7 days.
            </p>
            {renderMessagesForecastChart()}
            <h3 className="text-md font-semibold mt-6">Forecasted Data</h3>
            <ul className="list-disc list-inside text-sm mt-2 text-gray-700">
              {forecastData.map((item, idx) => (
                <li key={idx}>
                  Day {item.day}: {item.messages} msgs
                </li>
              ))}
            </ul>
          </div>

          {/* Future Leads Forecast */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">
              Predicted Leads (Next 7 Days)
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              Estimated leads derived from your future message count (approx 1
              lead per 50 messages).
            </p>
            {renderLeadsForecastChart()}
            <h3 className="text-md font-semibold mt-6">Forecasted Leads</h3>
            <ul className="list-disc list-inside text-sm mt-2 text-gray-700">
              {forecastData.map((item, idx) => (
                <li key={idx}>
                  Day {item.day}: {item.leads} leads
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

const data = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(
    Date.now() - (29 - i) * 24 * 60 * 60 * 1000
  ).toLocaleDateString(),
  conversations: Math.floor(Math.random() * 100) + 50
}))

export function ConversationChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <XAxis
          dataKey="date"
          tickFormatter={value =>
            new Date(value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric"
            })
          }
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={value => `${value}`}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="conversations"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

const data = Array.from({ length: 7 }, (_, i) => ({
  day: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(
    "en-US",
    { weekday: "short" }
  ),
  responseTime: (Math.random() * 2 + 0.5).toFixed(2)
}))

export function ResponseTimeChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={value => `${value}s`}
        />
        <Tooltip />
        <Bar dataKey="responseTime" fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

const data = [
  { time: "12am", messages: 5 },
  { time: "1am", messages: 6 },
  { time: "2am", messages: 8 },
  { time: "3am", messages: 10 },
  { time: "4am", messages: 12 },
  { time: "5am", messages: 15 },
  { time: "6am", messages: 13 },
  { time: "7am", messages: 12 },
  { time: "8am", messages: 11 },
  { time: "9am", messages: 13 },
  { time: "10am", messages: 15 },
  { time: "11am", messages: 14 },
  { time: "12pm", messages: 16 },
  { time: "1pm", messages: 15 },
  { time: "2pm", messages: 14 },
  { time: "3pm", messages: 13 },
  { time: "4pm", messages: 12 },
  { time: "5pm", messages: 11 },
  { time: "6pm", messages: 10 },
  { time: "7pm", messages: 9 },
  { time: "8pm", messages: 8 },
  { time: "9pm", messages: 7 },
  { time: "10pm", messages: 6 },
  { time: "11pm", messages: 5 }
]

export function MessagesChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <XAxis
          dataKey="time"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={value => `${value}`}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="messages"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

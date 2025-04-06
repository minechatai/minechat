"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

const data = [
  { time: "12am", total: 8, ai: 5, human: 4 },
  { time: "1am", total: 10, ai: 6, human: 5 },
  { time: "2am", total: 12, ai: 7, human: 6 },
  { time: "3am", total: 14, ai: 8, human: 7 },
  { time: "4am", total: 16, ai: 9, human: 8 },
  { time: "5am", total: 18, ai: 10, human: 9 },
  { time: "6am", total: 17, ai: 9, human: 8 },
  { time: "7am", total: 16, ai: 8, human: 7 },
  { time: "8am", total: 15, ai: 7, human: 6 },
  { time: "9am", total: 14, ai: 6, human: 5 },
  { time: "10am", total: 15, ai: 7, human: 6 },
  { time: "11am", total: 16, ai: 8, human: 7 },
  { time: "12pm", total: 18, ai: 10, human: 9 },
  { time: "1pm", total: 16, ai: 8, human: 7 },
  { time: "2pm", total: 14, ai: 6, human: 5 },
  { time: "3pm", total: 12, ai: 5, human: 4 },
  { time: "4pm", total: 10, ai: 4, human: 3 },
  { time: "5pm", total: 8, ai: 3, human: 2 },
  { time: "6pm", total: 9, ai: 4, human: 3 },
  { time: "7pm", total: 10, ai: 5, human: 4 },
  { time: "8pm", total: 11, ai: 6, human: 5 },
  { time: "9pm", total: 9, ai: 4, human: 3 },
  { time: "10pm", total: 8, ai: 3, human: 2 },
  { time: "11pm", total: 7, ai: 2, human: 1 }
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-black px-3 py-2 text-white">
        <p className="text-sm">{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export function MessagesChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTotalLine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={1} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF698C" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#EF698C" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorHuman" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CC2747" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#CC2747" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#F0F1F5"
          />
          <XAxis
            dataKey="time"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={{ fill: "#000000", fontSize: 12 }}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={value => `${value}`}
            tick={{ fill: "#000000", fontSize: 12 }}
            domain={[0, 20]}
            ticks={[0, 5, 10, 15, 20]}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="url(#colorTotalLine)"
            strokeWidth={2}
            fill="url(#colorTotal)"
            dot={false}
            activeDot={{
              r: 8,
              fill: "#FFFFFF",
              stroke: "#8B5CF6",
              strokeWidth: 2
            }}
          />
          <Area
            type="monotone"
            dataKey="ai"
            stroke="#EF698C"
            strokeWidth={2}
            fill="url(#colorAI)"
            dot={false}
            activeDot={{
              r: 8,
              fill: "#FFFFFF",
              stroke: "#EF698C",
              strokeWidth: 2
            }}
          />
          <Area
            type="monotone"
            dataKey="human"
            stroke="#CC2747"
            strokeWidth={2}
            fill="url(#colorHuman)"
            dot={false}
            activeDot={{
              r: 8,
              fill: "#FFFFFF",
              stroke: "#CC2747",
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

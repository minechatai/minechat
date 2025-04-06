"use client"

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts"

const data = [
  { name: "Human", value: 70 },
  { name: "AI", value: 30 }
]

const COLORS = ["url(#humanGradient)", "url(#aiGradient)"]

export function MessagesSent() {
  
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return <div></div>
  }

  return (
    <div className="flex items-center justify-between">
      <div className="w-[200px] space-y-6">
        {/* Human */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded bg-gradient-to-br from-[#87174F] via-[#AB2856] to-[#B73A4E]" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-base">Human</span>
              <span className="text-lg font-semibold">70%</span>
            </div>
          </div>
          <div className="relative h-1 w-full rounded-full bg-[#F5F6FA]">
            <div className="absolute left-0 h-1 w-[70%] rounded-full bg-gradient-to-r from-[#87174F] via-[#AB2856] to-[#B73A4E]" />
          </div>
        </div>

        {/* AI */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded bg-gradient-to-b from-[#8F5DFD] to-[#472398]" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-base">AI</span>
              <span className="text-lg font-semibold">30%</span>
            </div>
          </div>
          <div className="relative h-1 w-full rounded-full bg-[#F5F6FA]">
            <div className="absolute left-0 h-1 w-[30%] rounded-full bg-gradient-to-b from-[#8F5DFD] to-[#472398]" />
          </div>
        </div>
      </div>

      <div className="relative">
        <svg width="0" height="0">
          <defs>
            <linearGradient id="humanGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="1.57%" stopColor="#87174F" />
              <stop offset="50%" stopColor="#AB2856" />
              <stop offset="96.34%" stopColor="#B73A4E" />
            </linearGradient>
            <linearGradient id="aiGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="25%" stopColor="#8F5DFD" />
              <stop offset="100%" stopColor="#472398" />
            </linearGradient>
          </defs>
        </svg>
        <PieChart width={210} height={210}>
          <Pie
            data={data}
            cx={105}
            cy={105}
            innerRadius={70}
            outerRadius={100}
            startAngle={90}
            endAngle={450}
            fill="#8884d8"
            paddingAngle={4}
            cornerRadius={12}
            strokeWidth={0}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-semibold">100%</div>
            <div className="text-muted-foreground text-sm">Data</div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Card } from "@/components/ui/card"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

interface DraggableCardProps {
  id: string
  children: React.ReactNode
}

export function DraggableCard({ id, children }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="relative">
        <div
          {...attributes}
          {...listeners}
          className="hover:bg-muted absolute right-2 top-2 cursor-grab rounded-md p-1.5 active:cursor-grabbing"
        >
          <GripVertical className="text-muted-foreground size-4" />
        </div>
        {children}
      </Card>
    </div>
  )
}

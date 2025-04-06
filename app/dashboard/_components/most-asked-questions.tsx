"use client"

const questions = [
  { question: "Do you provide demos?", count: 26 },
  { question: "Will this work on mobile or just in desktop?", count: 22 },
  { question: "Will this work on mobile or just in desktop?", count: 22 },
  { question: "Do you provide demos?", count: 26 },
  { question: "Do you provide demos?", count: 26 }
]

export function MostAskedQuestions() {
  return (
    <div className="space-y-4">
      {questions.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">→</span>
            <span className="text-sm">{item.question}</span>
          </div>
          <span className="text-muted-foreground text-sm">({item.count})</span>
        </div>
      ))}
    </div>
  )
}


import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Setup | Minechat.ai",
  description: "Configure your Minechat.ai account settings for channels, AI, business info, etc."
}

export default async function SetupLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Setup</h1>
      {children}
    </div>
  )
}
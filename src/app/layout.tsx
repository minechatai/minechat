// app/layout.tsx (Server Component)
// Remove or do not include "use client" here.
// You can safely export the metadata object from this file.

import "./globals.css"
import type { Metadata } from "next"
import RootLayoutClient from "./root-layout-client"

export const metadata: Metadata = {
  title: "Minechat.ai",
  description: "Sales co-pilot that helps you reduce response times with AI"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* 
          We render a Client Component (RootLayoutClient) here 
          so we can still use hooks (useState, useRouter, etc.) 
          for the sidebar and other interactive parts.
        */}
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  )
}

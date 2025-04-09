/*
The root server layout for the app.
*/

import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/utilities/providers"
import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import { cn } from "@/lib/utils"
import { SupabaseProvider } from "@/lib/supabase-client";
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"]
})

export const metadata: Metadata = {
  title: "Minechat.ai",
  description: "A full-stack web app template."
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <SupabaseProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={cn(
              "bg-background mx-auto min-h-screen w-full scroll-smooth antialiased",
              inter.className,
              poppins.className
            )}
          >
            <Providers
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}

              <TailwindIndicator />

              <Toaster />
            </Providers>
          </body>
        </html>
      </SupabaseProvider>
    </ClerkProvider>
  )
}

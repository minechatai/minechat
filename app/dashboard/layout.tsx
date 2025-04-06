"use server"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <div className="relative h-full">
        <div className="z-[80] hidden h-full border-r border-[#E9EEF1] bg-white md:fixed md:inset-y-0 md:block md:w-[268px]">
          <Sidebar />
        </div>
        <main className="pl-[268px] pt-[72px]">{children}</main>
      </div>
    </div>
  )
}

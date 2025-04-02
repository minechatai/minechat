"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { SidebarLink } from "./sidebar-links"

interface CollapsibleSidebarProps {
  title: string
  links: SidebarLink[]
  onLogout: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function CollapsibleSidebar({
  title,
  links,
  onLogout,
  collapsed,
  onToggleCollapse
}: CollapsibleSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Keep track of which menus are open
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  function handleToggleMenu(label: string) {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  return (
    <div
      className={`bg-gray-800 text-white flex flex-col fixed top-0 left-0 h-screen ${
        collapsed ? "w-16" : "w-64"
      } transition-all duration-300 z-50`}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between">
        {!collapsed && <div className="font-bold text-xl">{title}</div>}
        <button
          onClick={onToggleCollapse}
          className="text-sm bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
        >
          {collapsed ? ">>" : "<<"}
        </button>
      </div>

      {/* Sidebar Links */}
      <nav className="flex-1 px-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          // If the link has a path, we check if it's active
          // If the link has children, we'll treat it differently
          const isActive = link.path ? pathname === link.path : false
          const hasChildren = link.children && link.children.length > 0
          const isOpen = openMenus[link.label] || false

          return (
            <div key={link.label} className="mb-1">
              <button
                onClick={() => {
                  // If this link has children, toggle menu
                  if (hasChildren) {
                    handleToggleMenu(link.label)
                  } else if (link.path) {
                    // Otherwise, navigate
                    router.push(link.path)
                  }
                }}
                className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition-colors ${
                  isActive ? "bg-gray-900" : ""
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className={`${collapsed ? "hidden" : "inline"}`}>
                  {link.label}
                </span>
              </button>

              {/* Render children if exist with a simple transition */}
              {hasChildren && (
                <div
                  className={`
                    ml-6
                    overflow-hidden
                    transition-all
                    duration-300
                    ${collapsed ? "hidden" : ""}
                    ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
                  `}
                >
                  {link.children?.map((child) => {
                    const childIsActive = pathname === child.path
                    return (
                      <Link
                        key={child.label}
                        href={child.path}
                        className={`block px-2 py-1 rounded hover:bg-gray-700 transition-colors ${
                          childIsActive ? "bg-gray-900" : ""
                        }`}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Sidebar Footer / Logout */}
      <div className="p-2">
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white w-full py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
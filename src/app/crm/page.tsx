"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

interface DBLead {
  id: string
  userId: string
  name: string
  email: string | null
  phoneNumber: string | null
  leadSource: string | null
  createdAt: string
  updatedAt: string
}

interface DBOpportunity {
  id: string
  userId: string
  leadId: string | null
  product: string | null
  status: string | null
  details: string | null
  startDate: string | null
  lastTouch: string | null
  createdAt: string
  updatedAt: string
}

interface Column {
  accessor: string
  label: string
  initialWidth?: number
}

interface ResizableTableProps {
  columns: Column[]
  data: any[]
}

// A generic resizable, sortable, and filterable table component.
function ResizableTable({ columns, data }: ResizableTableProps) {
  // Set initial column widths
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {}
    columns.forEach(col => {
      widths[col.accessor] = col.initialWidth || 150
    })
    return widths
  })

  // Sorting state: { key, direction } or null
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)

  // Filtering state: keyed by column accessor
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Sort data
  const sortedData = useMemo(() => {
    let sortableData = [...data]
    if (sortConfig) {
      sortableData.sort((a, b) => {
        const aVal = a[sortConfig.key] || ""
        const bVal = b[sortConfig.key] || ""
        if (aVal < bVal) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aVal > bVal) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }
    return sortableData
  }, [data, sortConfig])

  // Filter data
  const filteredData = useMemo(() => {
    return sortedData.filter(row => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key].toLowerCase()
        if (!filterValue) return true
        const cellValue = (row[key] || "").toString().toLowerCase()
        return cellValue.includes(filterValue)
      })
    })
  }, [sortedData, filters])

  // Handler for sorting when header is clicked
  const handleSort = (accessor: string) => {
    if (sortConfig && sortConfig.key === accessor) {
      setSortConfig({
        key: accessor,
        direction: sortConfig.direction === "asc" ? "desc" : "asc"
      })
    } else {
      setSortConfig({ key: accessor, direction: "asc" })
    }
  }

  // Handler for filter input change
  const handleFilterChange = (accessor: string, value: string) => {
    setFilters(prev => ({ ...prev, [accessor]: value }))
  }

  // Handler for resizing a column
  const handleMouseDown = (e: React.MouseEvent, accessor: string) => {
    const startX = e.clientX
    const startWidth = columnWidths[accessor]
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX)
      setColumnWidths(prev => ({ ...prev, [accessor]: newWidth > 50 ? newWidth : 50 }))
    }
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {columns.map(col => (
              <th
                key={col.accessor}
                style={{ width: columnWidths[col.accessor] }}
                className="border px-2 py-2 text-left relative select-none cursor-pointer"
                onClick={() => handleSort(col.accessor)}
              >
                <div className="flex items-center">
                  <span>{col.label}</span>
                  {sortConfig && sortConfig.key === col.accessor && (
                    <span className="ml-1 text-xs">
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </div>
                <div
                  onMouseDown={(e) => handleMouseDown(e, col.accessor)}
                  className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                ></div>
              </th>
            ))}
          </tr>
          <tr className="bg-gray-50">
            {columns.map(col => (
              <th
                key={col.accessor}
                style={{ width: columnWidths[col.accessor] }}
                className="border px-2 py-1"
              >
                <input
                  type="text"
                  placeholder="Filter..."
                  value={filters[col.accessor] || ""}
                  onChange={(e) => handleFilterChange(col.accessor, e.target.value)}
                  className="w-full text-xs border rounded px-1 py-0"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-100"}
            >
              {columns.map(col => (
                <td
                  key={col.accessor}
                  style={{ width: columnWidths[col.accessor] }}
                  className="border px-2 py-1 text-xs"
                >
                  {row[col.accessor] || "-"}
                </td>
              ))}
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-500"
              >
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function CrmPage() {
  const router = useRouter()

  const [leads, setLeads] = useState<DBLead[]>([])
  const [opportunities, setOpportunities] = useState<DBOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.push("/auth")
      }
    })
  }, [router])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      setErrorMsg("")

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session?.user?.id) {
        setErrorMsg("No user session. Please log in.")
        setLoading(false)
        return
      }

      const userId = sessionData.session.user.id

      // Fetch Leads
      const { data: leadsData, error: leadsErr } = await supabase
        .from("Lead")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })

      if (leadsErr) {
        setErrorMsg("Error fetching leads: " + leadsErr.message)
      } else if (leadsData) {
        setLeads(leadsData)
      }

      // Fetch Opportunities
      const { data: oppData, error: oppErr } = await supabase
        .from("Opportunity")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })

      if (oppErr) {
        setErrorMsg("Error fetching opportunities: " + oppErr.message)
      } else if (oppData) {
        setOpportunities(oppData)
      }
    } catch (err) {
      console.error("fetchData error:", err)
      setErrorMsg("Unknown error.")
    } finally {
      setLoading(false)
    }
  }

  // Build a map of leads to show lead name via leadId
  const leadMap = useMemo(() => {
    const map: Record<string, DBLead> = {}
    leads.forEach(ld => {
      map[ld.id] = ld
    })
    return map
  }, [leads])

  // Prepare opportunities data with leadName added
  const opportunitiesData = useMemo(() => {
    return opportunities.map(opp => ({
      ...opp,
      leadName: opp.leadId && leadMap[opp.leadId] ? leadMap[opp.leadId].name : "-"
    }))
  }, [opportunities, leadMap])

  // Define columns for the leads table
  const leadsColumns: Column[] = [
    { accessor: "name", label: "Name", initialWidth: 150 },
    { accessor: "email", label: "Email", initialWidth: 200 },
    { accessor: "phoneNumber", label: "Phone", initialWidth: 150 },
    { accessor: "leadSource", label: "Source", initialWidth: 150 },
    { accessor: "createdAt", label: "Created", initialWidth: 200 },
    { accessor: "updatedAt", label: "Updated", initialWidth: 200 }
  ]

  // Define columns for the opportunities table
  const oppColumns: Column[] = [
    { accessor: "leadName", label: "Lead", initialWidth: 150 },
    { accessor: "product", label: "Product", initialWidth: 150 },
    { accessor: "status", label: "Status", initialWidth: 100 },
    { accessor: "details", label: "Details", initialWidth: 200 },
    { accessor: "startDate", label: "Start Date", initialWidth: 200 },
    { accessor: "lastTouch", label: "Last Touch", initialWidth: 200 },
    { accessor: "createdAt", label: "Created", initialWidth: 200 },
    { accessor: "updatedAt", label: "Updated", initialWidth: 200 }
  ]

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black space-y-8">
      <h1 className="text-2xl font-bold">CRM Dashboard</h1>

      {errorMsg && (
        <div className="bg-red-100 text-red-700 p-2 rounded">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Leads</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-t-4 border-b-4 border-blue-600 rounded-full"></div>
            </div>
          ) : (
            <ResizableTable columns={leadsColumns} data={leads} />
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Opportunities</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-t-4 border-b-4 border-blue-600 rounded-full"></div>
            </div>
          ) : (
            <ResizableTable columns={oppColumns} data={opportunitiesData} />
          )}
        </div>
      </div>
    </div>
  )
}

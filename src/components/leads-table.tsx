"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Lead } from "@/types/lead"
import { DOCUMENT_CODES, LEAD_QUALITY_RANK } from "@/types/lead"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  getSavedFilters,
  setSavedFilters,
  DEFAULT_FILTERS,
  type DashboardFilters,
} from "@/lib/filters-storage"

function nullText(value: string | null | undefined, emptyLabel?: string): string {
  if (value == null || value.trim() === "") return emptyLabel ?? "—"
  return value
}

function DocumentCodeBadge({ code }: { code: string | null }) {
  if (!code?.trim()) return <span className="text-muted-foreground text-xs">—</span>
  const upper = code.toUpperCase().trim()
  const isKnown = DOCUMENT_CODES.includes(upper as (typeof DOCUMENT_CODES)[number])
  return (
    <Badge variant={isKnown ? "default" : "outline"} className="font-mono text-xs">
      {upper}
    </Badge>
  )
}

function LeadQualityBadge({ quality }: { quality: string | null }) {
  if (!quality?.trim()) return <span className="text-muted-foreground text-xs">—</span>
  const lower = quality.toLowerCase().trim()
  const variant =
    lower === "good"
      ? "success"
      : lower === "maybe"
        ? "warning"
        : lower === "skip"
          ? "destructive"
          : "outline"
  return (
    <Badge variant={variant} className="text-xs capitalize">
      {lower}
    </Badge>
  )
}

function getOwnerDisplay(lead: Lead): string {
  return lead.assessor_owner_name?.trim() || lead.owner_names?.trim() || "—"
}

interface LeadsTableProps {
  initialLeads: Lead[]
}

export function LeadsTable({ initialLeads }: LeadsTableProps) {
  const router = useRouter()
  const [leads] = useState<Lead[]>(initialLeads)
  const [search, setSearch] = useState("")
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize with defaults, will be hydrated from localStorage
  const [documentCodeFilter, setDocumentCodeFilter] = useState<string>(DEFAULT_FILTERS.documentCodeFilter)
  const [apnFilter, setApnFilter] = useState<string>(DEFAULT_FILTERS.apnFilter)
  const [leadQualitySort, setLeadQualitySort] = useState<string>(DEFAULT_FILTERS.leadQualitySort)
  const [recordingDateSort, setRecordingDateSort] = useState<"latest" | "earliest">(DEFAULT_FILTERS.recordingDateSort)

  // Hydrate state from localStorage on mount
  useEffect(() => {
    const saved = getSavedFilters()
    setDocumentCodeFilter(saved.documentCodeFilter)
    setApnFilter(saved.apnFilter)
    setLeadQualitySort(saved.leadQualitySort)
    setRecordingDateSort(saved.recordingDateSort)
    setIsHydrated(true)
  }, [])

  // Persist filters to localStorage whenever they change (after hydration)
  useEffect(() => {
    if (!isHydrated) return

    const filters: DashboardFilters = {
      documentCodeFilter,
      apnFilter,
      leadQualitySort,
      recordingDateSort,
    }
    setSavedFilters(filters)
  }, [documentCodeFilter, apnFilter, leadQualitySort, recordingDateSort, isHydrated])

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchLower = search.toLowerCase()
      const ownerDisplay = getOwnerDisplay(lead).toLowerCase()
      const matchesSearch =
        !search ||
        lead.address?.toLowerCase().includes(searchLower) ||
        lead.apn?.toLowerCase().includes(searchLower) ||
        lead.recording_number?.toLowerCase().includes(searchLower) ||
        ownerDisplay.includes(searchLower)

      const matchesDocumentCode =
        documentCodeFilter === "all" ||
        (lead.document_code?.toUpperCase().trim() ?? "") === documentCodeFilter

      const matchesApn =
        apnFilter === "all" ||
        (apnFilter === "has" && lead.apn?.trim()) ||
        (apnFilter === "no" && !lead.apn?.trim())

      return matchesSearch && matchesDocumentCode && matchesApn
    })
  }, [leads, search, documentCodeFilter, apnFilter])

  const sortedLeads = useMemo(() => {
    let sorted = [...filteredLeads]

    if (leadQualitySort === "high-to-low" || leadQualitySort === "low-to-high") {
      sorted.sort((a, b) => {
        const rankA = LEAD_QUALITY_RANK[a.lead_quality?.toLowerCase() ?? ""] ?? 99
        const rankB = LEAD_QUALITY_RANK[b.lead_quality?.toLowerCase() ?? ""] ?? 99
        if (leadQualitySort === "high-to-low") return rankA - rankB
        return rankB - rankA
      })
    } else {
      sorted.sort((a, b) => {
        const dateA = a.recording_date ? new Date(a.recording_date).getTime() : 0
        const dateB = b.recording_date ? new Date(b.recording_date).getTime() : 0
        if (recordingDateSort === "latest") return dateB - dateA
        return dateA - dateB
      })
    }

    return sorted
  }, [filteredLeads, leadQualitySort, recordingDateSort])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search address, APN, recording #, owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={documentCodeFilter} onValueChange={setDocumentCodeFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Doc code" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All doc codes</SelectItem>
            {DOCUMENT_CODES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={apnFilter} onValueChange={setApnFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="APN" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="has">Has APN</SelectItem>
            <SelectItem value="no">No APN</SelectItem>
          </SelectContent>
        </Select>
        <Select value={recordingDateSort} onValueChange={(v) => setRecordingDateSort(v as "latest" | "earliest")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Recording date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest first</SelectItem>
            <SelectItem value="earliest">Earliest first</SelectItem>
          </SelectContent>
        </Select>
        <Select value={leadQualitySort} onValueChange={setLeadQualitySort}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Lead quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No quality sort</SelectItem>
            <SelectItem value="high-to-low">Quality: High → Low</SelectItem>
            <SelectItem value="low-to-high">Quality: Low → High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Address</th>
                <th className="text-left p-3 font-medium">Doc</th>
                <th className="text-left p-3 font-medium">Recording Date</th>
                <th className="text-left p-3 font-medium">APN</th>
                <th className="text-left p-3 font-medium">Owner</th>
                <th className="text-left p-3 font-medium">Lead Quality</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className={cn(
                    "border-b hover:bg-muted/30 transition-colors cursor-pointer"
                  )}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {nullText(lead.address)}
                    </Link>
                  </td>
                  <td className="p-3">
                    <DocumentCodeBadge code={lead.document_code} />
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {nullText(lead.recording_date)}
                  </td>
                  <td className="p-3 text-muted-foreground font-mono text-xs">
                    {nullText(lead.apn)}
                  </td>
                  <td className="p-3 text-muted-foreground max-w-[180px] truncate">
                    {getOwnerDisplay(lead)}
                  </td>
                  <td className="p-3">
                    <LeadQualityBadge quality={lead.lead_quality} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedLeads.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {leads.length === 0
            ? "No leads yet. The scraper will populate this table."
            : "No leads match your filters."}
        </div>
      )}
    </div>
  )
}

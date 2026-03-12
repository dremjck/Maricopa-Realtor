"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Lead, LeadStatus } from "@/types/lead"
import { LEAD_STATUSES } from "@/types/lead"
import {
  getZillowSearchUrl,
  getRedfinSearchUrl,
  getGoogleMapsUrl,
} from "@/lib/links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExternalLink, FileText, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const NOTES_PREVIEW_LENGTH = 40

function truncate(str: string | null, maxLen: number): string {
  if (!str) return "—"
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + "…"
}

function LinkGroup({ lead }: { lead: Lead }) {
  const zillow = getZillowSearchUrl(lead.address)
  const redfin = getRedfinSearchUrl(lead.address)
  const maps = getGoogleMapsUrl(lead.address)

  return (
    <div className="flex items-center gap-1">
      {lead.source_pdf_url && (
        <a
          href={lead.source_pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground p-1 rounded"
          title="Source PDF"
        >
          <FileText className="h-4 w-4" />
        </a>
      )}
      {zillow && (
        <a
          href={zillow}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground p-1 rounded"
          title="Zillow"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      {redfin && (
        <a
          href={redfin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground p-1 rounded"
          title="Redfin"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      {maps && (
        <a
          href={maps}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground p-1 rounded"
          title="Google Maps"
        >
          <MapPin className="h-4 w-4" />
        </a>
      )}
      {!lead.source_pdf_url && !zillow && !redfin && !maps && (
        <span className="text-muted-foreground text-xs">—</span>
      )}
    </div>
  )
}

interface LeadsTableProps {
  initialLeads: Lead[]
}

export function LeadsTable({ initialLeads }: LeadsTableProps) {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [contactedFilter, setContactedFilter] = useState<string>("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filteredLeads = leads.filter((lead) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      !search ||
      (lead.address?.toLowerCase().includes(searchLower)) ||
      (lead.apn?.toLowerCase().includes(searchLower)) ||
      (lead.recording_number?.toLowerCase().includes(searchLower)) ||
      (lead.phone_number?.toLowerCase().includes(searchLower))

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter
    const matchesContacted =
      contactedFilter === "all" ||
      (contactedFilter === "yes" && lead.contacted) ||
      (contactedFilter === "no" && !lead.contacted)

    return matchesSearch && matchesStatus && matchesContacted
  })

  const updateLead = useCallback(
    async (id: string, updates: Partial<Lead>) => {
      setUpdatingId(id)
      const supabase = createClient()
      const { error } = await supabase
        .from("leads")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("Failed to update lead:", error)
        setUpdatingId(null)
        return
      }

      setLeads((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
        )
      )
      setUpdatingId(null)
    },
    []
  )

  const handleContactedChange = useCallback(
    (lead: Lead, checked: boolean) => {
      updateLead(lead.id, { contacted: checked })
    },
    [updateLead]
  )

  const handleStatusChange = useCallback(
    (lead: Lead, status: LeadStatus) => {
      updateLead(lead.id, { status })
    },
    [updateLead]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search address, APN, recording #, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={contactedFilter} onValueChange={setContactedFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Contacted" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Contacted</SelectItem>
            <SelectItem value="no">Not contacted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Address</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-left p-3 font-medium">Recording Date</th>
                <th className="text-left p-3 font-medium">Recording #</th>
                <th className="text-left p-3 font-medium">APN</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Contacted</th>
                <th className="text-left p-3 font-medium">Links</th>
                <th className="text-left p-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className={cn(
                    "border-b hover:bg-muted/30 transition-colors cursor-pointer",
                    updatingId === lead.id && "opacity-70"
                  )}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {lead.address || "—"}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {lead.phone_number || "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {lead.recording_date || "—"}
                  </td>
                  <td className="p-3 text-muted-foreground font-mono text-xs">
                    {lead.recording_number || "—"}
                  </td>
                  <td className="p-3 text-muted-foreground font-mono text-xs">
                    {lead.apn || "—"}
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={lead.status}
                      onValueChange={(v) =>
                        handleStatusChange(lead, v as LeadStatus)
                      }
                      disabled={updatingId === lead.id}
                    >
                      <SelectTrigger
                        className="h-8 w-[120px] border-0 bg-transparent shadow-none hover:bg-muted/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent onClick={(e) => e.stopPropagation()}>
                        {LEAD_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={lead.contacted}
                      onCheckedChange={(checked) =>
                        handleContactedChange(lead, !!checked)
                      }
                      disabled={updatingId === lead.id}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <LinkGroup lead={lead} />
                  </td>
                  <td className="p-3 text-muted-foreground max-w-[180px] truncate">
                    {truncate(lead.notes, NOTES_PREVIEW_LENGTH)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {leads.length === 0
            ? "No leads yet. The scraper will populate this table."
            : "No leads match your filters."}
        </div>
      )}
    </div>
  )
}

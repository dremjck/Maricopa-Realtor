"use client"

import React, { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Lead, LeadStatus } from "@/types/lead"
import { LEAD_STATUSES, DOCUMENT_CODES, PARSE_STATUSES } from "@/types/lead"
import {
  getZillowSearchUrl,
  getRedfinSearchUrl,
  getGoogleMapsUrl,
} from "@/lib/links"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExternalLink, FileText, MapPin, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function nullText(value: string | null, emptyLabel?: string): string {
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

function ParseStatusBadge({ status }: { status: string | null }) {
  if (!status?.trim()) return <span className="text-muted-foreground text-xs">—</span>
  const lower = status.toLowerCase().trim()
  const variant =
    lower === "success"
      ? "success"
      : lower === "partial"
        ? "warning"
        : lower === "failed"
          ? "destructive"
          : "outline"
  return (
    <Badge variant={variant} className="text-xs capitalize">
      {lower}
    </Badge>
  )
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
  const [documentCodeFilter, setDocumentCodeFilter] = useState<string>("all")
  const [parseStatusFilter, setParseStatusFilter] = useState<string>("all")
  const [apnFilter, setApnFilter] = useState<string>("all")
  const [recordingDateSort, setRecordingDateSort] = useState<"latest" | "earliest">("latest")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filteredLeads = leads.filter((lead) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      !search ||
      (lead.address?.toLowerCase().includes(searchLower)) ||
      (lead.apn?.toLowerCase().includes(searchLower)) ||
      (lead.recording_number?.toLowerCase().includes(searchLower)) ||
      (lead.phone_number?.toLowerCase().includes(searchLower)) ||
      (lead.owner_names?.toLowerCase().includes(searchLower))

    const matchesStatus =
      statusFilter === "all" || (lead.status ?? "") === statusFilter
    const matchesContacted =
      contactedFilter === "all" ||
      (contactedFilter === "yes" && lead.contacted) ||
      (contactedFilter === "no" && !lead.contacted)
    const matchesDocumentCode =
      documentCodeFilter === "all" ||
      (lead.document_code?.toUpperCase().trim() ?? "") === documentCodeFilter
    const matchesParseStatus =
      parseStatusFilter === "all" ||
      (lead.parse_status?.toLowerCase().trim() ?? "") === parseStatusFilter
    const matchesApn =
      apnFilter === "all" ||
      (lead.apn?.trim() ?? "") === apnFilter

    return (
      matchesSearch &&
      matchesStatus &&
      matchesContacted &&
      matchesDocumentCode &&
      matchesParseStatus &&
      matchesApn
    )
  })

  const activeApns = Array.from(new Set(leads.map((l) => l.apn?.trim()).filter((a): a is string => Boolean(a)))).sort()

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const dateA = a.recording_date ? new Date(a.recording_date).getTime() : 0
    const dateB = b.recording_date ? new Date(b.recording_date).getTime() : 0
    if (recordingDateSort === "latest") return dateB - dateA
    return dateA - dateB
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
    (lead: Lead, status: string) => {
      updateLead(lead.id, { status })
    },
    [updateLead]
  )

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search address, APN, recording #, phone, owner..."
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
        <Select value={parseStatusFilter} onValueChange={setParseStatusFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Parse status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All parse status</SelectItem>
            {PARSE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={apnFilter} onValueChange={setApnFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="APN" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All APNs</SelectItem>
            {activeApns.map((apn) => (
              <SelectItem key={apn} value={apn}>
                {apn}
              </SelectItem>
            ))}
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
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
                <th className="text-left p-3 font-medium w-8" />
                <th className="text-left p-3 font-medium">Address</th>
                <th className="text-left p-3 font-medium">Doc</th>
                <th className="text-left p-3 font-medium">Recording Date</th>
                <th className="text-left p-3 font-medium">APN</th>
                <th className="text-left p-3 font-medium">Owner</th>
                <th className="text-left p-3 font-medium">Parse</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-left p-3 font-medium">Contacted</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeads.map((lead) => {
                const isExpanded = expandedId === lead.id
                return (
                  <React.Fragment key={lead.id}>
                    <tr
                      key={lead.id}
                      onClick={() => router.push(`/leads/${lead.id}`)}
                      className={cn(
                        "border-b hover:bg-muted/30 transition-colors cursor-pointer",
                        updatingId === lead.id && "opacity-70"
                      )}
                    >
                      <td
                        className="p-3"
                        onClick={(e) => toggleExpand(e, lead.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
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
                      <td className="p-3 text-muted-foreground max-w-[140px] truncate">
                        {nullText(lead.owner_names)}
                      </td>
                      <td className="p-3">
                        <ParseStatusBadge status={lead.parse_status} />
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {nullText(lead.phone_number, "no phone")}
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
                        <Select
                          value={lead.status ?? "new"}
                          onValueChange={(v) => handleStatusChange(lead, v)}
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
                            {lead.status &&
                              !LEAD_STATUSES.includes(lead.status as LeadStatus) && (
                                <SelectItem key={lead.status} value={lead.status}>
                                  {lead.status}
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={10} className="p-0 bg-muted/20">
                          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs">document_type</p>
                              <p>{nullText(lead.document_type)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">beneficiary_name</p>
                              <p>{nullText(lead.beneficiary_name)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">trustee_name</p>
                              <p>{nullText(lead.trustee_name)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">auction_date</p>
                              <p>{nullText(lead.auction_date, "no auction date")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">auction_time</p>
                              <p>{nullText(lead.auction_time)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">original_principal_balance</p>
                              <p>{nullText(lead.original_principal_balance)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">recording_number</p>
                              <p className="font-mono">{nullText(lead.recording_number)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">id</p>
                              <p className="font-mono text-xs truncate">{nullText(lead.id)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">created_at</p>
                              <p>{nullText(lead.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">updated_at</p>
                              <p>{nullText(lead.updated_at)}</p>
                            </div>
                            <div className="col-span-2 md:col-span-3">
                              <p className="text-muted-foreground text-xs">source_pdf_url</p>
                              {lead.source_pdf_url ? (
                                <a
                                  href={lead.source_pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline break-all"
                                >
                                  {lead.source_pdf_url}
                                </a>
                              ) : (
                                <p>—</p>
                              )}
                            </div>
                            <div className="col-span-2 md:col-span-3">
                              <p className="text-muted-foreground text-xs">notes</p>
                              <p className="whitespace-pre-wrap">{nullText(lead.notes)}</p>
                            </div>
                            <div className="col-span-2 md:col-span-3">
                              <p className="text-muted-foreground text-xs mb-2">Links</p>
                              <LinkGroup lead={lead} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
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

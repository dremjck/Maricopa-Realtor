"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Lead, LeadStatus } from "@/types/lead"
import { LEAD_STATUSES } from "@/types/lead"
import {
  getZillowSearchUrl,
  getRedfinSearchUrl,
  getGoogleMapsUrl,
  getMaricopaAssessorUrl,
  getTruePeopleSearchUrl,
} from "@/lib/links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText, MapPin, Check, Loader2, Building, Search } from "lucide-react"

function nullText(value: string | null | undefined, emptyLabel?: string): string {
  if (value == null || String(value).trim() === "") return emptyLabel ?? "—"
  return String(value)
}

function boolText(value: boolean | null | undefined): string {
  if (value == null) return "—"
  return value ? "Yes" : "No"
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

function LeadQualityBadge({ quality }: { quality: string | null }) {
  if (!quality?.trim()) return <span className="text-muted-foreground">—</span>
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

interface LeadDetailClientProps {
  lead: Lead
}

export function LeadDetailClient({ lead: initialLead }: LeadDetailClientProps) {
  const [lead, setLead] = useState(initialLead)
  const [phoneNumber, setPhoneNumber] = useState(initialLead.phone_number ?? "")
  const [contacted, setContacted] = useState(initialLead.contacted)
  const [status, setStatus] = useState(initialLead.status ?? "new")
  const [notes, setNotes] = useState(initialLead.notes ?? "")
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  const zillow = getZillowSearchUrl(lead.address)
  const redfin = getRedfinSearchUrl(lead.address)
  const maps = getGoogleMapsUrl(lead.address)
  const assessorUrl = getMaricopaAssessorUrl(lead.apn)
  
  // TruePeopleSearch: assessor_summary is PRIMARY source, structured fields are FALLBACK
  const truePeopleSearchResult = getTruePeopleSearchUrl(
    lead.assessor_summary,
    lead.address,
    lead.city,
    lead.state,
    lead.zip,
    lead.id,
    true // enable debug logging
  )
  const truePeopleSearchUrl = truePeopleSearchResult.url

  async function handleSave() {
    setSaving(true)
    setSaveStatus("idle")

    const supabase = createClient()
    const { error } = await supabase
      .from("leads")
      .update({
        phone_number: phoneNumber || null,
        contacted,
        status: status || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id)

    if (error) {
      setSaveStatus("error")
      setSaving(false)
      return
    }

    setLead((prev) => ({
      ...prev,
      phone_number: phoneNumber || null,
      contacted,
      status: status || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }))
    setSaveStatus("success")
    setSaving(false)
  }

  const statusOptions = [
    ...LEAD_STATUSES,
    ...(status && !LEAD_STATUSES.includes(status as LeadStatus) ? [status] : []),
  ]

  return (
    <div className="space-y-6">
      {/* Assessor Summary - Top priority */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assessor Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {lead.assessor_summary?.trim() ? (
            <p className="text-sm whitespace-pre-wrap">{lead.assessor_summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No assessor summary available</p>
          )}
        </CardContent>
      </Card>

      {/* External Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">External Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {lead.source_pdf_url && (
              <a
                href={lead.source_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                Source PDF
              </a>
            )}
            {assessorUrl && (
              <a
                href={assessorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Building className="h-4 w-4" />
                Maricopa Assessor
              </a>
            )}
            {truePeopleSearchUrl && (
              <a
                href={truePeopleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Search className="h-4 w-4" />
                TruePeopleSearch
              </a>
            )}
            {zillow && (
              <a
                href={zillow}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Zillow
              </a>
            )}
            {redfin && (
              <a
                href={redfin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Redfin
              </a>
            )}
            {maps && (
              <a
                href={maps}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <MapPin className="h-4 w-4" />
                Google Maps
              </a>
            )}
            {!lead.source_pdf_url && !assessorUrl && !truePeopleSearchUrl && !zillow && !redfin && !maps && (
              <p className="text-sm text-muted-foreground">No links available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Core Property Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Core Property Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{nullText(lead.address)}</p>
            </div>
            <FieldRow label="APN" value={nullText(lead.apn)} />
            <FieldRow label="Recording Number" value={nullText(lead.recording_number)} />
            <FieldRow label="Recording Date" value={nullText(lead.recording_date)} />
            <FieldRow label="Document Code" value={nullText(lead.document_code)} />
            <FieldRow label="Document Type" value={nullText(lead.document_type)} />
            <FieldRow label="Parse Status" value={nullText(lead.parse_status)} />
          </div>
        </CardContent>
      </Card>

      {/* Document / Distress Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Document / Distress Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Owner Names (Document)" value={nullText(lead.owner_names)} />
            <FieldRow label="Beneficiary Name" value={nullText(lead.beneficiary_name)} />
            <FieldRow label="Trustee Name" value={nullText(lead.trustee_name)} />
            <FieldRow label="Auction Date" value={nullText(lead.auction_date, "no auction date")} />
            <FieldRow label="Auction Time" value={nullText(lead.auction_time)} />
            <FieldRow label="Original Principal Balance" value={nullText(lead.original_principal_balance)} />
          </div>
        </CardContent>
      </Card>

      {/* Assessor Enrichment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assessor Enrichment Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Assessor Lookup Status" value={nullText(lead.assessor_lookup_status)} />
            <FieldRow label="Assessor Owner Name" value={nullText(lead.assessor_owner_name)} />
            <FieldRow label="Assessor Mailing Address" value={nullText(lead.assessor_mailing_address)} />
            <FieldRow label="Assessor Property Address" value={nullText(lead.assessor_property_address)} />
            <FieldRow label="Parcel Type" value={nullText(lead.parcel_type)} />
            <FieldRow label="Property Use Code" value={nullText(lead.property_use_code)} />
            <FieldRow label="Property Use Description" value={nullText(lead.property_use_description)} />
            <FieldRow label="Valuation Description" value={nullText(lead.valuation_description)} />
            <FieldRow label="Subdivision Name" value={nullText(lead.subdivision_name)} />
            <FieldRow label="MCR Number" value={nullText(lead.mcr_number)} />
            <FieldRow label="Full Cash Value" value={nullText(lead.full_cash_value)} />
            <FieldRow label="Lot Size (sqft)" value={nullText(lead.lot_size_sqft)} />
            <FieldRow label="Year Built" value={nullText(lead.year_built)} />
            <FieldRow label="Sale Date (Assessor)" value={nullText(lead.sale_date_assessor)} />
            <FieldRow label="Sale Price (Assessor)" value={nullText(lead.sale_price_assessor)} />
            <FieldRow label="Owner Name Match" value={boolText(lead.owner_name_match)} />
            <FieldRow label="Address Match" value={boolText(lead.address_match)} />
            <FieldRow label="Is Single Family" value={boolText(lead.is_single_family)} />
            <FieldRow label="Is Owner Occupied" value={boolText(lead.is_owner_occupied)} />
            <div>
              <p className="text-sm text-muted-foreground">Lead Quality</p>
              <LeadQualityBadge quality={lead.lead_quality} />
            </div>
            <FieldRow label="Lead Skip Reason" value={nullText(lead.lead_skip_reason)} />
            <FieldRow label="Assessor Last Checked" value={nullText(lead.assessor_last_checked_at)} />
          </div>
        </CardContent>
      </Card>

      {/* CRM Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CRM Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="contacted"
              checked={contacted}
              onCheckedChange={(checked) => setContacted(!!checked)}
            />
            <label htmlFor="contacted" className="text-sm font-medium">
              Contacted
            </label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              rows={5}
              className="resize-y min-h-[120px]"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save changes
                </>
              )}
            </Button>
            {saveStatus === "success" && (
              <span className="text-sm text-green-500">Saved successfully</span>
            )}
            {saveStatus === "error" && (
              <span className="text-sm text-destructive">Failed to save</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>ID: <span className="font-mono">{lead.id}</span></p>
          <p>Created: {nullText(lead.created_at)}</p>
          <p>Updated: {nullText(lead.updated_at)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

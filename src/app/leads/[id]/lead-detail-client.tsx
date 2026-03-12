"use client"

import { useState } from "react"
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
import { ExternalLink, FileText, MapPin, Check, Loader2 } from "lucide-react"

interface LeadDetailClientProps {
  lead: Lead
}

export function LeadDetailClient({ lead: initialLead }: LeadDetailClientProps) {
  const [lead, setLead] = useState(initialLead)
  const [phoneNumber, setPhoneNumber] = useState(initialLead.phone_number ?? "")
  const [contacted, setContacted] = useState(initialLead.contacted)
  const [status, setStatus] = useState<LeadStatus>(initialLead.status)
  const [notes, setNotes] = useState(initialLead.notes ?? "")
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  const zillow = getZillowSearchUrl(lead.address)
  const redfin = getRedfinSearchUrl(lead.address)
  const maps = getGoogleMapsUrl(lead.address)

  async function handleSave() {
    setSaving(true)
    setSaveStatus("idle")

    const supabase = createClient()
    const { error } = await supabase
      .from("leads")
      .update({
        phone_number: phoneNumber || null,
        contacted,
        status,
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
      status,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }))
    setSaveStatus("success")
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Property Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium">{lead.address || "—"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">APN</p>
              <p className="font-mono text-sm">{lead.apn || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recording Number</p>
              <p className="font-mono text-sm">{lead.recording_number || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recording Date</p>
              <p className="text-sm">{lead.recording_date || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Document Code</p>
              <p className="text-sm">{lead.document_code || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Info</CardTitle>
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
            <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Source Links</CardTitle>
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
            {!lead.source_pdf_url && !zillow && !redfin && !maps && (
              <p className="text-sm text-muted-foreground">No links (address missing)</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CRM Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
    </div>
  )
}

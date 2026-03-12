export type LeadStatus =
  | "new"
  | "skip traced"
  | "contacted"
  | "follow up"
  | "dead"
  | "closed"

export type Lead = {
  id: string
  recording_number: string
  recording_date: string
  document_code: string | null
  address: string | null
  apn: string | null
  source_pdf_url: string | null
  phone_number: string | null
  contacted: boolean
  status: LeadStatus
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "skip traced",
  "contacted",
  "follow up",
  "dead",
  "closed",
]

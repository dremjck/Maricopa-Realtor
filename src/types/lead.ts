export type LeadStatus =
  | "new"
  | "skip traced"
  | "contacted"
  | "follow up"
  | "dead"
  | "closed"

export type Lead = {
  id: string
  recording_number: string | null
  recording_date: string | null
  document_code: string | null
  address: string | null
  apn: string | null
  source_pdf_url: string | null
  phone_number: string | null
  contacted: boolean
  status: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
  document_type: string | null
  owner_names: string | null
  beneficiary_name: string | null
  trustee_name: string | null
  auction_date: string | null
  auction_time: string | null
  original_principal_balance: string | null
  parse_status: string | null
}

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "skip traced",
  "contacted",
  "follow up",
  "dead",
  "closed",
]

export const DOCUMENT_CODES = ["LP", "NS"] as const
export const PARSE_STATUSES = ["success", "partial", "failed"] as const

export type LeadStatus =
  | "new"
  | "skip traced"
  | "contacted"
  | "follow up"
  | "dead"
  | "closed"

export type LeadQuality = "good" | "maybe" | "skip"

export type Lead = {
  id: string
  recording_number: string | null
  recording_date: string | null
  document_code: string | null
  document_type: string | null
  address: string | null
  apn: string | null
  source_pdf_url: string | null
  owner_names: string | null
  beneficiary_name: string | null
  trustee_name: string | null
  auction_date: string | null
  auction_time: string | null
  original_principal_balance: string | null
  parse_status: string | null
  phone_number: string | null
  contacted: boolean
  status: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
  // Assessor enrichment fields
  assessor_lookup_status: string | null
  assessor_owner_name: string | null
  assessor_mailing_address: string | null
  assessor_property_address: string | null
  parcel_type: string | null
  property_use_code: string | null
  property_use_description: string | null
  valuation_description: string | null
  assessor_summary: string | null
  subdivision_name: string | null
  mcr_number: string | null
  full_cash_value: string | null
  lot_size_sqft: string | null
  year_built: string | null
  sale_date_assessor: string | null
  sale_price_assessor: string | null
  owner_name_match: boolean | null
  address_match: boolean | null
  is_single_family: boolean | null
  is_owner_occupied: boolean | null
  lead_quality: string | null
  lead_skip_reason: string | null
  assessor_last_checked_at: string | null
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

export const LEAD_QUALITIES: LeadQuality[] = ["good", "maybe", "skip"]

export const LEAD_QUALITY_RANK: Record<string, number> = {
  good: 1,
  maybe: 2,
  skip: 3,
}

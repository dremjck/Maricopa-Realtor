import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { LeadsTable } from "@/components/leads-table"
import type { Lead } from "@/types/lead"

function mapRowToLead(l: Record<string, unknown>): Lead {
  return {
    id: String(l.id ?? ""),
    recording_number: l.recording_number != null ? String(l.recording_number) : null,
    recording_date: l.recording_date != null ? String(l.recording_date) : null,
    document_code: l.document_code != null ? String(l.document_code) : null,
    document_type: l.document_type != null ? String(l.document_type) : null,
    address: l.address != null ? String(l.address) : null,
    apn: l.apn != null ? String(l.apn) : null,
    source_pdf_url: l.source_pdf_url != null ? String(l.source_pdf_url) : null,
    owner_names: l.owner_names != null ? String(l.owner_names) : null,
    beneficiary_name: l.beneficiary_name != null ? String(l.beneficiary_name) : null,
    trustee_name: l.trustee_name != null ? String(l.trustee_name) : null,
    auction_date: l.auction_date != null ? String(l.auction_date) : null,
    auction_time: l.auction_time != null ? String(l.auction_time) : null,
    original_principal_balance: l.original_principal_balance != null ? String(l.original_principal_balance) : null,
    parse_status: l.parse_status != null ? String(l.parse_status) : null,
    phone_number: l.phone_number != null ? String(l.phone_number) : null,
    contacted: Boolean(l.contacted),
    status: l.status != null ? String(l.status) : null,
    notes: l.notes != null ? String(l.notes) : null,
    created_at: l.created_at != null ? String(l.created_at) : null,
    updated_at: l.updated_at != null ? String(l.updated_at) : null,
    // Assessor enrichment fields
    assessor_lookup_status: l.assessor_lookup_status != null ? String(l.assessor_lookup_status) : null,
    assessor_owner_name: l.assessor_owner_name != null ? String(l.assessor_owner_name) : null,
    assessor_mailing_address: l.assessor_mailing_address != null ? String(l.assessor_mailing_address) : null,
    assessor_property_address: l.assessor_property_address != null ? String(l.assessor_property_address) : null,
    parcel_type: l.parcel_type != null ? String(l.parcel_type) : null,
    property_use_code: l.property_use_code != null ? String(l.property_use_code) : null,
    property_use_description: l.property_use_description != null ? String(l.property_use_description) : null,
    valuation_description: l.valuation_description != null ? String(l.valuation_description) : null,
    assessor_summary: l.assessor_summary != null ? String(l.assessor_summary) : null,
    subdivision_name: l.subdivision_name != null ? String(l.subdivision_name) : null,
    mcr_number: l.mcr_number != null ? String(l.mcr_number) : null,
    full_cash_value: l.full_cash_value != null ? String(l.full_cash_value) : null,
    lot_size_sqft: l.lot_size_sqft != null ? String(l.lot_size_sqft) : null,
    year_built: l.year_built != null ? String(l.year_built) : null,
    sale_date_assessor: l.sale_date_assessor != null ? String(l.sale_date_assessor) : null,
    sale_price_assessor: l.sale_price_assessor != null ? String(l.sale_price_assessor) : null,
    owner_name_match: l.owner_name_match != null ? Boolean(l.owner_name_match) : null,
    address_match: l.address_match != null ? Boolean(l.address_match) : null,
    is_single_family: l.is_single_family != null ? Boolean(l.is_single_family) : null,
    is_owner_occupied: l.is_owner_occupied != null ? Boolean(l.is_owner_occupied) : null,
    lead_quality: l.lead_quality != null ? String(l.lead_quality) : null,
    lead_skip_reason: l.lead_skip_reason != null ? String(l.lead_skip_reason) : null,
    assessor_last_checked_at: l.assessor_last_checked_at != null ? String(l.assessor_last_checked_at) : null,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: rows, error } = await supabase
    .from("leads")
    .select("*")
    .order("recording_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false })

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive">
            Failed to load leads: {error.message}
          </div>
        </main>
      </div>
    )
  }

  const typedLeads: Lead[] = (rows ?? []).map(mapRowToLead)

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Leads</h2>
          <LeadsTable initialLeads={typedLeads} />
        </div>
      </main>
    </div>
  )
}

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
    address: l.address != null ? String(l.address) : null,
    apn: l.apn != null ? String(l.apn) : null,
    source_pdf_url: l.source_pdf_url != null ? String(l.source_pdf_url) : null,
    phone_number: l.phone_number != null ? String(l.phone_number) : null,
    contacted: Boolean(l.contacted),
    status: l.status != null ? String(l.status) : null,
    notes: l.notes != null ? String(l.notes) : null,
    created_at: l.created_at != null ? String(l.created_at) : null,
    updated_at: l.updated_at != null ? String(l.updated_at) : null,
    document_type: l.document_type != null ? String(l.document_type) : null,
    owner_names: l.owner_names != null ? String(l.owner_names) : null,
    beneficiary_name: l.beneficiary_name != null ? String(l.beneficiary_name) : null,
    trustee_name: l.trustee_name != null ? String(l.trustee_name) : null,
    auction_date: l.auction_date != null ? String(l.auction_date) : null,
    auction_time: l.auction_time != null ? String(l.auction_time) : null,
    original_principal_balance: l.original_principal_balance != null ? String(l.original_principal_balance) : null,
    parse_status: l.parse_status != null ? String(l.parse_status) : null,
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

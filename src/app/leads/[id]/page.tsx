import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { LeadDetailClient } from "./lead-detail-client"
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

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !row) {
    notFound()
  }

  const typedLead = mapRowToLead(row as Record<string, unknown>)

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            ← Back to dashboard
          </Link>
          <LeadDetailClient lead={typedLead} />
        </div>
      </main>
    </div>
  )
}

import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { LeadDetailClient } from "./lead-detail-client"

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !lead) {
    notFound()
  }

  const typedLead = {
    id: lead.id,
    recording_number: lead.recording_number ?? "",
    recording_date: lead.recording_date ?? "",
    document_code: lead.document_code ?? null,
    address: lead.address ?? null,
    apn: lead.apn ?? null,
    source_pdf_url: lead.source_pdf_url ?? null,
    phone_number: lead.phone_number ?? null,
    contacted: lead.contacted ?? false,
    status: (lead.status ?? "new") as "new" | "skip traced" | "contacted" | "follow up" | "dead" | "closed",
    notes: lead.notes ?? null,
    created_at: lead.created_at ?? null,
    updated_at: lead.updated_at ?? null,
  }

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

import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { LeadsTable } from "@/components/leads-table"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("recording_date", { ascending: false })

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

  const typedLeads = (leads ?? []).map((l) => ({
    id: l.id,
    recording_number: l.recording_number ?? "",
    recording_date: l.recording_date ?? "",
    document_code: l.document_code ?? null,
    address: l.address ?? null,
    apn: l.apn ?? null,
    source_pdf_url: l.source_pdf_url ?? null,
    phone_number: l.phone_number ?? null,
    contacted: l.contacted ?? false,
    status: (l.status ?? "new") as "new" | "skip traced" | "contacted" | "follow up" | "dead" | "closed",
    notes: l.notes ?? null,
    created_at: l.created_at ?? null,
    updated_at: l.updated_at ?? null,
  }))

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

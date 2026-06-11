import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ApplicationWithVendor, Market } from "@/types/database";

export default async function MarketApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: market } = await supabase
    .from("markets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!market) notFound();

  const typedMarket = market as Market;

  if (typedMarket.organizer_id !== user.id) redirect("/dashboard");

  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      *,
      vendor:profiles!applications_vendor_id_fkey (*)
    `
    )
    .eq("market_id", id)
    .order("created_at", { ascending: false });

  const typedApplications = (applications ?? []).map((app) => ({
    ...app,
    vendor: Array.isArray(app.vendor) ? app.vendor[0] : app.vendor,
  })) as ApplicationWithVendor[];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <Button variant="ghost" asChild className="-ml-3">
          <Link href="/dashboard">← Back to dashboard</Link>
        </Button>
      </div>

      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-800">
              {typedMarket.title}
            </h1>
            <Badge variant="secondary">{typedMarket.status}</Badge>
          </div>
          <p className="mt-2 text-stone-500">
            {formatDate(typedMarket.date)} · {typedMarket.location_name}
          </p>
        </div>
        <p className="text-sm text-stone-400">
          {typedApplications.length} application
          {typedApplications.length === 1 ? "" : "s"}
        </p>
      </div>

      <KanbanBoard applications={typedApplications} />
    </div>
  );
}

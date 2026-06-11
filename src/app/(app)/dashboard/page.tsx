import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Market } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "organizer") redirect("/markets");

  const { data: markets } = await supabase
    .from("markets")
    .select("*")
    .eq("organizer_id", user.id)
    .order("date", { ascending: true });

  const typedMarkets = (markets as Market[]) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-800">
            Your Markets
          </h1>
          <p className="mt-2 text-stone-500">
            Manage listings and review vendor applications.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/markets/new">
            <Plus className="h-4 w-4" />
            Post a market
          </Link>
        </Button>
      </div>

      {typedMarkets.length > 0 ? (
        <div className="grid gap-4">
          {typedMarkets.map((market) => (
            <Link key={market.id} href={`/dashboard/markets/${market.id}`}>
              <Card className="border-stone-200/80 transition hover:border-stone-300 hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{market.title}</CardTitle>
                    <p className="mt-1 text-sm text-stone-500">
                      {formatDate(market.date)} · {market.location_name} ·{" "}
                      {formatCurrency(market.booth_fee)}
                    </p>
                  </div>
                  <Badge variant={market.status === "open" ? "accent" : "secondary"}>
                    {market.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-500">
                    Click to manage applications →
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-200 bg-white/60 px-6 py-16 text-center">
          <p className="text-stone-500">You haven&apos;t posted any markets yet.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/markets/new">Post your first market</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

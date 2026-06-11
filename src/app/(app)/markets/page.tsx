import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MarketFilters } from "@/components/markets/market-filters";
import type { Market } from "@/types/database";

export default async function MarketsPage() {
  let markets: Market[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("markets")
      .select("*")
      .eq("status", "open")
      .order("date", { ascending: true });
    markets = (data as Market[]) ?? [];
  }

  return (
    <MarketFilters
      markets={markets}
      supabaseConfigured={isSupabaseConfigured()}
    />
  );
}

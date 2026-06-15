import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { normalizeMarkets } from "@/lib/markets/normalize";
import { MarketFilters } from "@/components/markets/market-filters";
import type { Market } from "@/types/database";

export default async function MarketsPage() {
  let markets: Market[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("markets")
        .select("*")
        .eq("status", "open")
        .order("date", { ascending: true });
      markets = normalizeMarkets(data as Market[] | null);
    } catch {
      markets = [];
    }
  }

  return (
    <MarketFilters
      markets={markets}
      supabaseConfigured={isSupabaseConfigured()}
    />
  );
}

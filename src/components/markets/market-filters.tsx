"use client";

import { useMemo, useState } from "react";
import { CRAFT_CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationAutocomplete } from "@/components/markets/location-autocomplete";
import { MarketCard } from "@/components/markets/market-card";
import { matchesLocation } from "@/lib/mapbox/places";
import type { Market } from "@/types/database";

function buildLocationSuggestions(markets: Market[]): string[] {
  const locations = new Set<string>();

  for (const market of markets) {
    if (market.location_name?.trim()) {
      locations.add(market.location_name.trim());
    }

    if (market.address?.trim()) {
      const parts = market.address.split(",").map((part) => part.trim());
      const city = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
      if (city) locations.add(city);
    }
  }

  return Array.from(locations).sort((a, b) => a.localeCompare(b));
}

interface MarketFiltersProps {
  markets: Market[];
  supabaseConfigured?: boolean;
}

export function MarketFilters({
  markets,
  supabaseConfigured = true,
}: MarketFiltersProps) {
  const [location, setLocation] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [feeMin, setFeeMin] = useState("");
  const [feeMax, setFeeMax] = useState("");
  const [category, setCategory] = useState("all");

  const locationSuggestions = useMemo(
    () => buildLocationSuggestions(markets),
    [markets]
  );

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      if (
        location &&
        !matchesLocation(market.location_name, market.address, location)
      ) {
        return false;
      }

      if (dateFrom && market.date < dateFrom) {
        return false;
      }

      if (feeMin && (market.booth_fee ?? 0) < Number(feeMin)) {
        return false;
      }

      if (feeMax && (market.booth_fee ?? Infinity) > Number(feeMax)) {
        return false;
      }

      if (
        category !== "all" &&
        !market.categories_needed.includes(category)
      ) {
        return false;
      }

      return true;
    });
  }, [markets, location, dateFrom, feeMin, feeMax, category]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-64">
        <div className="sticky top-24 space-y-6 rounded-xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400">
              Filters
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Narrow down markets that fit your craft.
            </p>
          </div>

          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            marketSuggestions={locationSuggestions}
          />

          <div className="space-y-2">
            <Label htmlFor="dateFrom">From date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="feeMin">Min fee</Label>
              <Input
                id="feeMin"
                type="number"
                min={0}
                placeholder="0"
                value={feeMin}
                onChange={(e) => setFeeMin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeMax">Max fee</Label>
              <Input
                id="feeMax"
                type="number"
                min={0}
                placeholder="500"
                value={feeMax}
                onChange={(e) => setFeeMax(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category needed</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CRAFT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-800">
            Upcoming Markets
          </h1>
          <p className="mt-2 text-stone-500">
            Browse open craft fairs and apply with your maker resume in one click.
          </p>
          {!supabaseConfigured && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Supabase is not configured yet. For local dev, copy{" "}
              <code className="text-xs">.env.example</code> to{" "}
              <code className="text-xs">.env.local</code>. On Cloudflare, add{" "}
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
              <strong>Settings → Variables and Secrets</strong> and{" "}
              <strong>Settings → Build → Build variables and secrets</strong>,
              then redeploy.
            </p>
          )}
          <p className="mt-4 text-sm text-stone-400">
            {filteredMarkets.length} market{filteredMarkets.length === 1 ? "" : "s"} found
          </p>
        </div>

        {filteredMarkets.length > 0 ? (
          <div className="grid gap-5">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-200 bg-white/60 px-6 py-16 text-center">
            <p className="text-stone-500">No markets match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

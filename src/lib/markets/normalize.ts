import type { Market } from "@/types/database";

export function normalizeMarketPhotos(photos: string[] | null | undefined): string[] {
  return photos ?? [];
}

export function normalizeMarket<T extends { photos?: string[] | null }>(
  market: T
): T & { photos: string[] } {
  return {
    ...market,
    photos: normalizeMarketPhotos(market.photos),
  };
}

export function normalizeMarkets(markets: Market[] | null | undefined): Market[] {
  return (markets ?? []).map((market) => normalizeMarket(market));
}

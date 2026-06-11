import type { PlacePrediction } from "@/types/places";

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
}

interface MapboxGeocodeResponse {
  features: MapboxFeature[];
}

export async function searchPlaces(query: string): Promise<PlacePrediction[]> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token || query.trim().length < 2) return [];

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("limit", "6");

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Mapbox geocoding failed:", response.status, await response.text());
    return [];
  }

  const data = (await response.json()) as MapboxGeocodeResponse;

  return data.features.map((feature) => ({
    id: feature.id,
    label: feature.place_name,
    value: feature.place_name,
    source: "mapbox" as const,
  }));
}

export function marketToPrediction(location: string): PlacePrediction {
  return {
    id: `market-${location}`,
    label: location,
    value: location,
    source: "market",
  };
}

export function matchesLocation(
  locationName: string,
  address: string | null,
  query: string
): boolean {
  if (!query.trim()) return true;

  const haystack = `${locationName} ${address ?? ""}`.toLowerCase();
  const terms = query
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 2);

  if (terms.length === 0) {
    return haystack.includes(query.trim().toLowerCase());
  }

  return terms.some((term) => haystack.includes(term.toLowerCase()));
}

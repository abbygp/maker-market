import type { PlacePrediction } from "@/types/places";

interface MapboxFeature {
  id: string;
  place_name: string;
}

interface MapboxGeocodeResponse {
  features: MapboxFeature[];
}

export function getMapboxToken(): string | undefined {
  return process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
}

export async function searchPlacesClient(
  query: string,
  signal?: AbortSignal
): Promise<PlacePrediction[]> {
  const token = getMapboxToken();
  if (!token || query.trim().length < 2) return [];

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("limit", "6");

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    console.warn("Mapbox geocoding error:", response.status, await response.text());
    return [];
  }

  const data = (await response.json()) as MapboxGeocodeResponse;

  if (!data.features?.length) return [];

  return data.features.map((feature) => ({
    id: feature.id,
    label: feature.place_name,
    value: feature.place_name,
    source: "mapbox" as const,
  }));
}

import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/mapbox/places";
import { isMapboxConfigured } from "@/lib/mapbox/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  if (!isMapboxConfigured()) {
    return NextResponse.json(
      { error: "Mapbox is not configured" },
      { status: 503 }
    );
  }

  try {
    const places = await searchPlaces(query);
    return NextResponse.json(places);
  } catch (error) {
    console.error("Places API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 502 }
    );
  }
}

export function isMapboxConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
      process.env.MAPBOX_ACCESS_TOKEN
  );
}

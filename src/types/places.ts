export interface PlacePrediction {
  id: string;
  label: string;
  value: string;
  source: "mapbox" | "market";
}

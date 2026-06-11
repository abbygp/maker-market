"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMapboxToken, searchPlacesClient } from "@/lib/mapbox/client";
import { cn } from "@/lib/utils";
import type { PlacePrediction } from "@/types/places";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  marketSuggestions: string[];
  placeholder?: string;
}

function filterMarketSuggestions(
  suggestions: string[],
  query: string
): PlacePrediction[] {
  const normalized = query.trim().toLowerCase();
  const filtered = !normalized
    ? suggestions
    : suggestions.filter((location) =>
        location.toLowerCase().includes(normalized)
      );

  return filtered.slice(0, 4).map((location) => ({
    id: `market-${location}`,
    label: location,
    value: location,
    source: "market" as const,
  }));
}

export function LocationAutocomplete({
  value,
  onChange,
  marketSuggestions,
  placeholder = "City or venue",
}: LocationAutocompleteProps) {
  const mapboxEnabled = Boolean(getMapboxToken());
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [mapboxPredictions, setMapboxPredictions] = useState<PlacePrediction[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const localPredictions = useMemo(
    () => filterMarketSuggestions(marketSuggestions, value),
    [marketSuggestions, value]
  );

  const predictions = useMemo(() => {
    const seen = new Set<string>();
    const merged: PlacePrediction[] = [];

    for (const prediction of [...localPredictions, ...mapboxPredictions]) {
      const key = prediction.value.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(prediction);
    }

    return merged.slice(0, 8);
  }, [localPredictions, mapboxPredictions]);

  useEffect(() => {
    if (!mapboxEnabled || value.trim().length < 2) {
      setMapboxPredictions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const data = await searchPlacesClient(value.trim());
        if (!cancelled) setMapboxPredictions(data);
      } catch (error) {
        if (!cancelled) {
          console.warn("Location search failed:", error);
          setMapboxPredictions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [value, mapboxEnabled]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectPrediction(prediction: PlacePrediction) {
    onChange(prediction.value);
    setOpen(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (!open || predictions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev < predictions.length - 1 ? prev + 1 : 0
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : predictions.length - 1
      );
    } else if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault();
      selectPrediction(predictions[highlightedIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  }

  const showDropdown =
    open && (predictions.length > 0 || loading || (mapboxEnabled && value.length >= 2));

  return (
    <div ref={containerRef} className="relative space-y-2">
      <Label htmlFor="location">Location</Label>
      <div className="relative">
        <Input
          id="location"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={loading ? "pr-9" : undefined}
        />
        {loading && (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-stone-400" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          {predictions.length > 0 ? (
            <ul id={listId} role="listbox">
              {predictions.map((prediction, index) => (
                <li
                  key={prediction.id}
                  role="option"
                  aria-selected={highlightedIndex === index}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-stone-50",
                      highlightedIndex === index && "bg-stone-100"
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectPrediction(prediction)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                    <span className="min-w-0">
                      <span className="block text-stone-800">{prediction.label}</span>
                      {prediction.source === "market" && (
                        <span className="text-xs text-stone-400">
                          Listed on MakerMarket
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : loading ? (
            <p className="px-3 py-2.5 text-sm text-stone-500">Searching places…</p>
          ) : (
            <p className="px-3 py-2.5 text-sm text-stone-500">No places found.</p>
          )}

          {mapboxEnabled && predictions.some((p) => p.source === "mapbox") && (
            <p className="border-t border-stone-100 px-3 py-1.5 text-[10px] text-stone-400">
              Powered by Mapbox
            </p>
          )}
        </div>
      )}
    </div>
  );
}

import type { Market } from "@/types/database";

interface MarketPhotosGalleryProps {
  photos: string[];
  title?: string;
  className?: string;
}

export function MarketPhotosGallery({
  photos,
  title,
  className = "",
}: MarketPhotosGalleryProps) {
  if (photos.length === 0) return null;

  return (
    <section className={className}>
      <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
        {title ?? "Photos"}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-stone-200/80 bg-stone-100 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${title ?? "Market"} photo ${index + 1}`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function getMarketCoverPhoto(market: Pick<Market, "photos">): string | null {
  return market.photos[0] ?? null;
}

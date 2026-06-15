import Link from "next/link";
import { AtSign, Globe, ExternalLink, Pencil, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Market, Profile } from "@/types/database";

interface OrganizerProfileViewProps {
  profile: Profile;
  markets: Market[];
  isOwner?: boolean;
}

export function OrganizerProfileView({
  profile,
  markets,
  isOwner = false,
}: OrganizerProfileViewProps) {
  const instagramUrl = profile.instagram_handle
    ? `https://instagram.com/${profile.instagram_handle.replace(/^@/, "")}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Store className="h-8 w-8 text-amber-700" />
            <h1 className="text-4xl font-semibold tracking-tight text-stone-800">
              {profile.business_name || "Untitled Organizer"}
            </h1>
            <Badge variant="secondary">Organizer</Badge>
          </div>
          {profile.bio && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
              {profile.bio}
            </p>
          )}
        </div>

        {isOwner && (
          <Button variant="outline" asChild>
            <Link href="/profile/edit">
              <Pencil className="h-4 w-4" />
              Edit profile
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_280px]">
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400">
            Markets
          </h2>
          <p className="mt-1 text-stone-600">
            {isOwner
              ? "Craft fairs you've posted on MakerMarket."
              : "Upcoming and past markets from this organizer."}
          </p>

          {markets.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {markets.map((market) => (
                <Link
                  key={market.id}
                  href={
                    isOwner
                      ? `/dashboard/markets/${market.id}`
                      : `/markets/${market.id}`
                  }
                >
                  <Card className="border-stone-200/80 transition hover:border-stone-300 hover:shadow-md">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{market.title}</CardTitle>
                        <p className="mt-1 text-sm text-stone-500">
                          {formatDate(market.date)} · {market.location_name}
                          {market.booth_fee != null &&
                            ` · ${formatCurrency(market.booth_fee)}`}
                        </p>
                      </div>
                      <Badge
                        variant={market.status === "open" ? "accent" : "secondary"}
                      >
                        {market.status}
                      </Badge>
                    </CardHeader>
                    {market.description && (
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-stone-600">
                          {market.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-stone-200 bg-white/60 px-6 py-16 text-center">
              <p className="text-stone-500">
                {isOwner
                  ? "You haven't posted any markets yet."
                  : "No markets listed yet."}
              </p>
              {isOwner && (
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/markets/new">Post your first market</Link>
                </Button>
              )}
            </div>
          )}
        </section>

        <aside className="h-fit space-y-3 rounded-xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
            Connect
          </p>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-stone-700 hover:text-amber-800"
            >
              <AtSign className="h-4 w-4" />
              @{profile.instagram_handle?.replace(/^@/, "")}
              <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
            </a>
          )}
          {profile.website_url && (
            <a
              href={profile.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-stone-700 hover:text-amber-800"
            >
              <Globe className="h-4 w-4" />
              Website
              <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
            </a>
          )}
          {!instagramUrl && !profile.website_url && (
            <p className="text-sm text-stone-400">No links added yet.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

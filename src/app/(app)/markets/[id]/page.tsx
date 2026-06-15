import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Calendar, DollarSign, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplyButton } from "@/components/markets/apply-button";
import { MarketPhotosGallery } from "@/components/markets/market-photos-gallery";
import { formatCategory } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Market } from "@/types/database";

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: market } = await supabase
    .from("markets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!market) notFound();

  const typedMarket = market as Market;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let existingApplication = null;

  if (user) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role, id")
      .eq("id", user.id)
      .maybeSingle();
    profile = userProfile;

    if (profile?.role === "vendor") {
      const { data: application } = await supabase
        .from("applications")
        .select("id")
        .eq("market_id", id)
        .eq("vendor_id", user.id)
        .maybeSingle();
      existingApplication = application;
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6">
        <Button variant="ghost" asChild className="-ml-3">
          <Link href="/markets">← Back to markets</Link>
        </Button>
      </div>

      <article className="rounded-xl border border-stone-200/80 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-800">
              {typedMarket.title}
            </h1>
            {typedMarket.description && (
              <p className="mt-4 text-lg leading-relaxed text-stone-600">
                {typedMarket.description}
              </p>
            )}
          </div>
          <Badge variant="accent">{typedMarket.status}</Badge>
        </div>

        <MarketPhotosGallery photos={typedMarket.photos} className="mt-8" />

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 text-stone-700">
            <Calendar className="h-5 w-5 text-stone-400" />
            <div>
              <dt className="text-xs uppercase tracking-wider text-stone-400">Date</dt>
              <dd>{formatDate(typedMarket.date)}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3 text-stone-700">
            <MapPin className="h-5 w-5 text-stone-400" />
            <div>
              <dt className="text-xs uppercase tracking-wider text-stone-400">Location</dt>
              <dd>
                {typedMarket.location_name}
                {typedMarket.address && (
                  <span className="block text-sm text-stone-500">
                    {typedMarket.address}
                  </span>
                )}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-3 text-stone-700">
            <DollarSign className="h-5 w-5 text-stone-400" />
            <div>
              <dt className="text-xs uppercase tracking-wider text-stone-400">Booth fee</dt>
              <dd>{formatCurrency(typedMarket.booth_fee)}</dd>
            </div>
          </div>
          {typedMarket.application_deadline && (
            <div className="flex items-center gap-3 text-stone-700">
              <Clock className="h-5 w-5 text-stone-400" />
              <div>
                <dt className="text-xs uppercase tracking-wider text-stone-400">
                  Apply by
                </dt>
                <dd>{formatDate(typedMarket.application_deadline)}</dd>
              </div>
            </div>
          )}
        </dl>

        {typedMarket.categories_needed.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
              Categories needed
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {typedMarket.categories_needed.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {formatCategory(cat)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 border-t border-stone-100 pt-8">
          {profile?.role === "vendor" && typedMarket.status === "open" ? (
            <ApplyButton
              marketId={typedMarket.id}
              vendorId={profile.id}
              hasApplied={!!existingApplication}
            />
          ) : !user ? (
            <Button asChild size="lg">
              <Link href={`/login?redirect=/markets/${typedMarket.id}`}>
                Log in to apply
              </Link>
            </Button>
          ) : profile?.role === "organizer" ? (
            <p className="text-sm text-stone-500">
              You&apos;re logged in as an organizer. Switch to a vendor account to apply.
            </p>
          ) : typedMarket.status !== "open" ? (
            <p className="text-sm text-stone-500">
              Applications are closed for this market.
            </p>
          ) : null}
        </div>
      </article>
    </div>
  );
}

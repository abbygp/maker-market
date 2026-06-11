import { notFound } from "next/navigation";
import Link from "next/link";
import { AtSign, Globe, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCategory } from "@/lib/constants";
import type { Profile } from "@/types/database";

export default async function MakerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "vendor")
    .maybeSingle();

  if (!profile) notFound();

  const vendor = profile as Profile;
  const instagramUrl = vendor.instagram_handle
    ? `https://instagram.com/${vendor.instagram_handle.replace(/^@/, "")}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-800">
              {vendor.business_name || "Untitled Maker"}
            </h1>
            {vendor.category && (
              <Badge variant="accent">
                {formatCategory(vendor.category)}
              </Badge>
            )}
          </div>

          {vendor.bio && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
              {vendor.bio}
            </p>
          )}
        </div>

        <aside className="space-y-3 rounded-xl border border-stone-200/80 bg-white p-6 shadow-sm">
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
              @{vendor.instagram_handle?.replace(/^@/, "")}
              <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
            </a>
          )}
          {vendor.website_url && (
            <a
              href={vendor.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-stone-700 hover:text-amber-800"
            >
              <Globe className="h-4 w-4" />
              Website
              <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
            </a>
          )}
          {!instagramUrl && !vendor.website_url && (
            <p className="text-sm text-stone-400">No links added yet.</p>
          )}
        </aside>
      </div>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-stone-400">
              Portfolio
            </h2>
            <p className="mt-1 text-stone-600">
              Work samples from this maker&apos;s resume.
            </p>
          </div>
        </div>

        {vendor.portfolio_images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {vendor.portfolio_images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200/80 bg-stone-100 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${vendor.business_name} portfolio ${index + 1}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-200 bg-white/60 px-6 py-16 text-center">
            <p className="text-stone-500">No portfolio images yet.</p>
          </div>
        )}
      </section>

      <div className="mt-12">
        <Button variant="outline" asChild>
          <Link href="/markets">Browse markets</Link>
        </Button>
      </div>
    </div>
  );
}

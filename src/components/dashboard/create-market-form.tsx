"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CRAFT_CATEGORIES } from "@/lib/constants";
import { uploadMarketPhotos } from "@/lib/supabase/upload-market-photo";
import { MarketPhotosInput } from "@/components/markets/market-photos-input";
import type { MarketStatus } from "@/types/database";

export function CreateMarketForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<MarketStatus>("open");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [pendingPhotoFiles, setPendingPhotoFiles] = useState<File[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const { data: market, error: insertError } = await supabase
      .from("markets")
      .insert({
        organizer_id: user.id,
        title: form.get("title") as string,
        description: (form.get("description") as string) || null,
        date: form.get("date") as string,
        location_name: form.get("location_name") as string,
        address: (form.get("address") as string) || null,
        booth_fee: form.get("booth_fee")
          ? Number(form.get("booth_fee"))
          : null,
        application_deadline:
          (form.get("application_deadline") as string) || null,
        categories_needed: selectedCategories,
        status,
        photos: photoUrls,
      })
      .select("id")
      .single();

    if (insertError || !market) {
      setError(insertError?.message ?? "Could not create market.");
      setLoading(false);
      return;
    }

    if (pendingPhotoFiles.length > 0) {
      const uploadedUrls = await uploadMarketPhotos(
        supabase,
        user.id,
        market.id,
        pendingPhotoFiles
      );

      if (uploadedUrls.length > 0) {
        const { error: updateError } = await supabase
          .from("markets")
          .update({ photos: [...photoUrls, ...uploadedUrls] })
          .eq("id", market.id);

        if (updateError) {
          setError(
            "Market created, but some photos failed to save. You can add them later."
          );
          setLoading(false);
          router.push("/dashboard");
          router.refresh();
          return;
        }
      } else if (photoUrls.length === 0) {
        setError(
          "Market created, but photo uploads failed. Check that the market-photos storage bucket exists in Supabase."
        );
        setLoading(false);
        router.push("/dashboard");
        router.refresh();
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  function toggleCategory(value: string) {
    setSelectedCategories((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value]
    );
  }

  return (
    <Card className="border-stone-200/80 shadow-sm">
      <CardHeader>
        <CardTitle>Post a new market</CardTitle>
        <CardDescription>
          Share your upcoming craft fair with makers on MakerMarket.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Market title</Label>
            <Input id="title" name="title" required placeholder="Spring Makers Market" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe your event, vibe, and what you're looking for..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Event date</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="application_deadline">Application deadline</Label>
              <Input id="application_deadline" name="application_deadline" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_name">Location name</Label>
            <Input
              id="location_name"
              name="location_name"
              required
              placeholder="Riverfront Pavilion"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="123 Main St, Portland, OR" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="booth_fee">Booth fee ($)</Label>
              <Input id="booth_fee" name="booth_fee" type="number" min={0} step="1" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as MarketStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <MarketPhotosInput
            photoUrls={photoUrls}
            onPhotoUrlsChange={setPhotoUrls}
            pendingFiles={pendingPhotoFiles}
            onPendingFilesChange={setPendingPhotoFiles}
          />

          <div className="space-y-2">
            <Label>Categories needed</Label>
            <div className="flex flex-wrap gap-2">
              {CRAFT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    selectedCategories.includes(cat.value)
                      ? "border-amber-300 bg-amber-50 text-amber-900"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create market"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

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
import type { CraftCategory, Profile } from "@/types/database";

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(profile.business_name || "");
  const [category, setCategory] = useState<CraftCategory | "">(
    profile.category || ""
  );
  const [bio, setBio] = useState(profile.bio || "");
  const [instagram, setInstagram] = useState(profile.instagram_handle || "");
  const [website, setWebsite] = useState(profile.website_url || "");
  const [portfolioInput, setPortfolioInput] = useState(
    profile.portfolio_images.join("\n")
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const portfolioImages = portfolioInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        business_name: businessName,
        category: category || null,
        bio: bio || null,
        instagram_handle: instagram || null,
        website_url: website || null,
        portfolio_images: portfolioImages,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push(`/makers/${profile.id}`);
    router.refresh();
  }

  return (
    <Card className="border-stone-200/80 shadow-sm">
      <CardHeader>
        <CardTitle>Edit your maker resume</CardTitle>
        <CardDescription>
          This profile is submitted when you apply to a market. Keep it polished.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>

          {profile.role === "vendor" && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as CraftCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CRAFT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell organizers about your craft..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram handle</Label>
              <Input
                id="instagram"
                placeholder="@yourshop"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio image URLs</Label>
            <Textarea
              id="portfolio"
              rows={5}
              value={portfolioInput}
              onChange={(e) => setPortfolioInput(e.target.value)}
              placeholder="One image URL per line"
            />
            <p className="text-xs text-stone-500">
              Paste public image URLs (one per line). Supabase Storage URLs work great.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save profile"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/makers/${profile.id}`)}
            >
              Preview
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Store, Palette } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { CraftCategory, UserRole } from "@/types/database";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "details">("role");
  const [role, setRole] = useState<UserRole | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState<CraftCategory | "">("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to continue.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      role,
      business_name: businessName || null,
      category: role === "vendor" ? category || null : null,
      bio: bio || null,
      portfolio_images: [],
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push(role === "organizer" ? "/dashboard" : "/profile/edit");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-800">
          Welcome to MakerMarket
        </h1>
        <p className="mt-2 text-stone-500">
          Tell us how you&apos;ll use the platform — you can always update this later.
        </p>
      </div>

      {step === "role" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setRole("vendor");
              setStep("details");
            }}
            className={cn(
              "group rounded-xl border border-stone-200 bg-white p-8 text-left shadow-sm transition hover:border-amber-200 hover:shadow-md",
              role === "vendor" && "border-amber-300 ring-2 ring-amber-100"
            )}
          >
            <Palette className="mb-4 h-8 w-8 text-amber-700" />
            <h2 className="text-xl font-semibold">I&apos;m a Maker</h2>
            <p className="mt-2 text-sm text-stone-500">
              Build your maker resume, browse upcoming markets, and apply in one click.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("organizer");
              setStep("details");
            }}
            className={cn(
              "group rounded-xl border border-stone-200 bg-white p-8 text-left shadow-sm transition hover:border-amber-200 hover:shadow-md",
              role === "organizer" && "border-amber-300 ring-2 ring-amber-100"
            )}
          >
            <Store className="mb-4 h-8 w-8 text-amber-700" />
            <h2 className="text-xl font-semibold">I&apos;m an Organizer</h2>
            <p className="mt-2 text-sm text-stone-500">
              Post markets, set booth fees, and manage vendor applications on a kanban board.
            </p>
          </button>
        </div>
      ) : (
        <Card className="border-stone-200/80 shadow-sm">
          <CardHeader>
            <CardTitle>
              {role === "vendor" ? "Set up your maker profile" : "Set up your organizer profile"}
            </CardTitle>
            <CardDescription>
              {role === "vendor"
                ? "This becomes your maker resume — vendors apply with this profile."
                : "This is how makers will recognize your markets."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  placeholder="Wildflower Studio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              {role === "vendor" && (
                <div className="space-y-2">
                  <Label>Primary craft category</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as CraftCategory)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                <Label htmlFor="bio">Short bio</Label>
                <Input
                  id="bio"
                  placeholder="Hand-thrown ceramics inspired by the coast..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("role")}
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Continue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

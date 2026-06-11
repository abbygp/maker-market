import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import type { Profile } from "@/types/database";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <ProfileEditForm profile={profile as Profile} />
    </div>
  );
}

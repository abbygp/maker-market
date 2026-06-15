import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MakerProfileView } from "@/components/profile/maker-profile-view";
import { OrganizerProfileView } from "@/components/profile/organizer-profile-view";
import type { Market, Profile } from "@/types/database";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  const typedProfile = profile as Profile;

  if (typedProfile.role === "vendor") {
    return <MakerProfileView profile={typedProfile} isOwner />;
  }

  const { data: markets } = await supabase
    .from("markets")
    .select("*")
    .eq("organizer_id", user.id)
    .order("date", { ascending: true });

  return (
    <OrganizerProfileView
      profile={typedProfile}
      markets={(markets as Market[]) ?? []}
      isOwner
    />
  );
}

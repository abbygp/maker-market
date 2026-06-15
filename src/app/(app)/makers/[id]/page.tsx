import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MakerProfileView } from "@/components/profile/maker-profile-view";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <MakerProfileView
      profile={profile as Profile}
      isOwner={user?.id === id}
    />
  );
}

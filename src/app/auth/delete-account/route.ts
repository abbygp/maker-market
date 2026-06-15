import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createAdminClient();
  if (!admin) {
    redirect("/markets?error=account_deletion_unavailable");
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.auth.signOut();
  redirect("/login?deleted=1");
}

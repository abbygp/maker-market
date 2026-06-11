import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateMarketForm } from "@/components/dashboard/create-market-form";

export default async function NewMarketPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "organizer") redirect("/markets");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <CreateMarketForm />
    </div>
  );
}

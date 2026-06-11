import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  let user = null;
  let profile = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("role, business_name")
        .eq("id", user.id)
        .maybeSingle();
      profile = userProfile;
    }
  }

  return (
    <header className="border-b border-stone-200/80 bg-[#faf8f5]/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/markets" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-stone-800">
            MakerMarket
          </span>
          <span className="hidden text-xs text-stone-500 sm:inline">
            craft fair job board
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/markets">Markets</Link>
          </Button>

          {user && profile?.role === "vendor" && (
            <>
              <Button variant="ghost" asChild>
                <Link href={`/makers/${user.id}`}>My Resume</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
            </>
          )}

          {user && profile?.role === "organizer" && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          )}

          {!user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          ) : (
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">
                Sign out
              </Button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}

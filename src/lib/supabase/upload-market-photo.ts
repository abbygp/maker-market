import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "market-photos";

export async function uploadMarketPhoto(
  supabase: SupabaseClient,
  organizerId: string,
  marketId: string,
  file: File
): Promise<string | null> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${organizerId}/${marketId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Market photo upload failed:", error.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

export async function uploadMarketPhotos(
  supabase: SupabaseClient,
  organizerId: string,
  marketId: string,
  files: File[]
): Promise<string[]> {
  const uploads = await Promise.all(
    files.map((file) => uploadMarketPhoto(supabase, organizerId, marketId, file))
  );

  return uploads.filter((url): url is string => Boolean(url));
}

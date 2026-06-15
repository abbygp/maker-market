-- Add photos to market listings

ALTER TABLE markets
  ADD COLUMN IF NOT EXISTS photos TEXT[] NOT NULL DEFAULT '{}';

INSERT INTO storage.buckets (id, name, public)
VALUES ('market-photos', 'market-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Market photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'market-photos');

CREATE POLICY "Organizers can upload market photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'market-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'organizer'
    )
  );

CREATE POLICY "Organizers can update their market photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'market-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Organizers can delete their market photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'market-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

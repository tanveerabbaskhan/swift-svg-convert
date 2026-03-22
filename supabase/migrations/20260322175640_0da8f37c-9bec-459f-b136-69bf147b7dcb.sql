
-- Add noindex column to pages
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS noindex boolean NOT NULL DEFAULT false;

-- Add noindex column to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS noindex boolean NOT NULL DEFAULT false;

-- Create media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage RLS policies
CREATE POLICY "Media is publicly accessible" ON storage.objects FOR SELECT TO public USING (bucket_id = 'media');
CREATE POLICY "Anyone can upload media" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'media');
CREATE POLICY "Anyone can update media" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'media');
CREATE POLICY "Anyone can delete media" ON storage.objects FOR DELETE TO public USING (bucket_id = 'media');

-- Enable realtime for conversions
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversions;

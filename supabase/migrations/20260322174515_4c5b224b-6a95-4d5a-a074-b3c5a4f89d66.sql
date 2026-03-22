
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '262 60% 50%',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories are manageable by everyone" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pages table
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pages are viewable by everyone" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Pages are manageable by everyone" ON public.pages FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  excerpt TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  featured_image TEXT,
  meta_title TEXT,
  meta_description TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog posts are viewable by everyone" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Blog posts are manageable by everyone" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Site settings (key-value store)
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Site settings are manageable by everyone" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- Conversions tracking
CREATE TABLE public.conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conversions are viewable by everyone" ON public.conversions FOR SELECT USING (true);
CREATE POLICY "Conversions can be inserted by everyone" ON public.conversions FOR INSERT WITH CHECK (true);

-- Analytics events
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  page_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Analytics events are viewable by everyone" ON public.analytics_events FOR SELECT USING (true);
CREATE POLICY "Analytics events can be inserted by everyone" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', 'PNGTOSVG'),
  ('site_description', 'Free online PNG to SVG converter. Fast, secure, and private.'),
  ('site_url', 'https://pngtosvg.com'),
  ('robots_txt', 'User-agent: *\nAllow: /'),
  ('google_analytics_id', ''),
  ('google_search_console', ''),
  ('default_meta_title', 'PNGTOSVG - Free PNG to SVG Converter'),
  ('default_meta_description', 'Convert PNG images to SVG vector graphics instantly. Free, fast, and secure.'),
  ('social_twitter', ''),
  ('social_facebook', ''),
  ('email_notifications_conversions', 'true'),
  ('email_weekly_analytics', 'true'),
  ('email_blog_comments', 'false'),
  ('email_security_alerts', 'true'),
  ('rate_limiting', 'true'),
  ('max_upload_size_mb', '10'),
  ('two_factor_auth', 'false');

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, color) VALUES
  ('Design', 'design', 'Articles about design principles and tools', '262 60% 50%'),
  ('Tutorial', 'tutorial', 'Step-by-step guides and tutorials', '210 80% 52%'),
  ('Performance', 'performance', 'Web performance optimization tips', '152 60% 42%'),
  ('News', 'news', 'Latest news and updates', '38 92% 50%');

-- Insert sample pages
INSERT INTO public.pages (title, slug, status, content, meta_title, meta_description) VALUES
  ('Home', '/', 'published', 'Welcome to PNGTOSVG', 'PNGTOSVG - Free PNG to SVG Converter', 'Convert PNG to SVG for free'),
  ('About Us', '/about', 'published', 'About PNGTOSVG platform', 'About - PNGTOSVG', 'Learn about our PNG to SVG converter'),
  ('Privacy Policy', '/privacy', 'published', 'Your privacy matters to us', 'Privacy Policy - PNGTOSVG', 'Our privacy policy'),
  ('Contact', '/contact', 'published', 'Get in touch with us', 'Contact - PNGTOSVG', 'Contact the PNGTOSVG team');

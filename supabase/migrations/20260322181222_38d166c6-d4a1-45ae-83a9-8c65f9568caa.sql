
-- Add unique constraint on site_settings.key for upsert to work
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_key_unique') THEN
    ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_key_unique UNIQUE (key);
  END IF;
END $$;

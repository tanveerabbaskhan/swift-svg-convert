import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "text/plain",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: settings } = await supabase.from("site_settings").select("value").eq("key", "robots_txt").single();

  const baseUrl = "https://pngtosvgconverter.com";

  const defaultRobots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Disallow: /admin/`;

  const robotsTxt = settings?.value || defaultRobots;

  return new Response(robotsTxt, { headers: corsHeaders });
});

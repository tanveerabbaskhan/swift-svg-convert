import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const baseUrl = "https://pngtosvgconverter.com";

  const { data: pages } = await supabase.from("pages").select("slug, updated_at, noindex").eq("status", "published");
  const { data: posts } = await supabase.from("blog_posts").select("slug, updated_at, noindex").eq("status", "published");

  const today = new Date().toISOString().split("T")[0];
  let urls = `  <url><loc>${baseUrl}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
  urls += `  <url><loc>${baseUrl}/blog</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
  urls += `  <url><loc>${baseUrl}/about</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
  urls += `  <url><loc>${baseUrl}/contact</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;

  // Add pages (skip duplicates of static routes)
  const staticPaths = new Set(["/", "/blog", "/about", "/contact"]);
  pages?.filter(p => !p.noindex && !staticPaths.has(p.slug)).forEach(p => {
    const lastmod = p.updated_at ? p.updated_at.split("T")[0] : today;
    urls += `  <url><loc>${baseUrl}${p.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  });

  // Add blog posts
  posts?.filter(p => !p.noindex).forEach(p => {
    const lastmod = p.updated_at ? p.updated_at.split("T")[0] : today;
    urls += `  <url><loc>${baseUrl}/blog/${p.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;

  return new Response(xml, { headers: corsHeaders });
});

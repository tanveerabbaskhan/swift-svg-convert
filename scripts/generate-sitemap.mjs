/**
 * Pre-build script: generates public/sitemap.xml by querying Supabase
 * for published pages and blog posts. Run before `vite build`.
 *
 * Usage: node scripts/generate-sitemap.mjs
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE_URL = "https://pngtosvgconverter.com";

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function fetchFromSupabase(table, select) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[sitemap] No Supabase env vars found, using fallback data for", table);
    // Fallback data for development when env vars are not available
    if (table === "blog_posts") {
      return [
        { slug: "png-to-svg-converter-complete-guide", updated_at: "2026-03-24T00:00:00Z", noindex: false }
      ];
    }
    if (table === "pages") {
      return [];
    }
    return [];
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}&status=eq.published&noindex=eq.false`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) {
      console.warn(`[sitemap] Failed to fetch ${table}: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.warn(`[sitemap] Error fetching ${table}:`, err.message);
    return [];
  }
}

async function generateSitemap() {
  const today = new Date().toISOString().split("T")[0];

  // Static routes
  const staticUrls = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/about", changefreq: "monthly", priority: "0.7" },
    { loc: "/contact", changefreq: "monthly", priority: "0.6" },
    { loc: "/privacy", changefreq: "yearly", priority: "0.4" },
    { loc: "/blog", changefreq: "weekly", priority: "0.9" },
  ];

  // Dynamic routes from Supabase
  const pages = await fetchFromSupabase("pages", "slug,updated_at,noindex");
  const posts = await fetchFromSupabase("blog_posts", "slug,updated_at,noindex");

  let urls = "";

  // Add static routes
  for (const route of staticUrls) {
    urls += `  <url>
    <loc>${BASE_URL}${route.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
  }

  // Add CMS pages (skip duplicates of static routes)
  const staticPaths = new Set(staticUrls.map((r) => r.loc));
  for (const page of pages) {
    if (page.noindex || staticPaths.has(page.slug)) continue;
    const lastmod = page.updated_at ? page.updated_at.split("T")[0] : today;
    urls += `  <url>
    <loc>${BASE_URL}${page.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  }

  // Add blog posts
  for (const post of posts) {
    if (post.noindex) continue;
    const lastmod = post.updated_at ? post.updated_at.split("T")[0] : today;
    urls += `  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>
`;

  const outputPath = resolve(__dirname, "..", "public", "sitemap.xml");
  writeFileSync(outputPath, xml, "utf-8");

  const totalUrls = staticUrls.length + pages.filter((p) => !p.noindex && !staticPaths.has(p.slug)).length + posts.filter((p) => !p.noindex).length;
  console.log(`[sitemap] Generated ${outputPath} with ${totalUrls} URLs`);
}

generateSitemap();

/**
 * Enhanced sitemap generator for Google SEO compliance
 * Includes all required sitemap features and optimizations
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
    if (table === "blog_posts") {
      return [
        { 
          slug: "png-to-svg-converter-complete-guide", 
          title: "PNG to SVG Converter Complete Guide",
          meta_title: "PNG to SVG Converter Complete Guide — Free Online Tool",
          meta_description: "Complete guide to converting PNG images to SVG vector graphics with our free online converter",
          excerpt: "Complete guide to converting PNG images to SVG vector graphics",
          content: "Learn how to convert PNG to SVG with our free online converter...",
          featured_image: "https://pngtosvgconverter.com/og-image.jpg",
          created_at: "2026-03-24T00:00:00Z",
          updated_at: "2026-03-24T00:00:00Z",
          noindex: false 
        }
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

function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateMainSitemap(pages, posts) {
  const today = new Date().toISOString().split("T")[0];

  // Static routes with proper priorities and frequencies
  const staticUrls = [
    { 
      loc: "/", 
      changefreq: "daily", 
      priority: "1.0",
      lastmod: today
    },
    { 
      loc: "/about", 
      changefreq: "monthly", 
      priority: "0.8",
      lastmod: today
    },
    { 
      loc: "/contact", 
      changefreq: "monthly", 
      priority: "0.7",
      lastmod: today
    },
    { 
      loc: "/privacy", 
      changefreq: "yearly", 
      priority: "0.3",
      lastmod: today
    },
    { 
      loc: "/blog", 
      changefreq: "weekly", 
      priority: "0.9",
      lastmod: today
    },
  ];

  let urls = "";

  // Add static routes
  for (const route of staticUrls) {
    urls += `  <url>
    <loc>${BASE_URL}${route.loc}</loc>
    <lastmod>${route.lastmod}</lastmod>
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
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return xml;
}

function generateImageSitemap(pages, posts) {
  let urls = "";

  // Add images from pages
  for (const page of pages) {
    if (page.noindex || !page.featured_image) continue;
    urls += `  <url>
    <loc>${BASE_URL}${page.slug}</loc>
    <image:image>
      <image:loc>${escapeXml(page.featured_image)}</image:loc>
      <image:title>${escapeXml(page.title)}</image:title>
      <image:caption>${escapeXml(page.meta_description || page.excerpt || '')}</image:caption>
    </image:image>
  </url>\n`;
  }

  // Add images from blog posts
  for (const post of posts) {
    if (post.noindex || !post.featured_image) continue;
    urls += `  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <image:image>
      <image:loc>${escapeXml(post.featured_image)}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
      <image:caption>${escapeXml(post.meta_description || post.excerpt || '')}</image:caption>
    </image:image>
  </url>\n`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap-image.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return xml;
}

function generateNewsSitemap(posts) {
  let urls = "";

  // Add recent blog posts (last 2 days for news sitemap)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  for (const post of posts) {
    if (post.noindex) continue;
    
    const publishDate = new Date(post.created_at);
    if (publishDate < twoDaysAgo) continue; // Only include recent posts

    urls += `  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>PNGTOSVG Blog</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${post.created_at}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>\n`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap-news.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return xml;
}

function generateSitemapIndex() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap-index.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-image.xml</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-news.xml</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

  return xml;
}

async function generateEnhancedSitemap() {
  // Fetch data from Supabase
  const pages = await fetchFromSupabase("pages", "slug,title,meta_title,meta_description,excerpt,featured_image,updated_at,created_at,noindex");
  const posts = await fetchFromSupabase("blog_posts", "slug,title,meta_title,meta_description,excerpt,content,featured_image,updated_at,created_at,noindex");

  // Generate different sitemap types
  const mainSitemap = generateMainSitemap(pages, posts);
  const imageSitemap = generateImageSitemap(pages, posts);
  const newsSitemap = generateNewsSitemap(posts);
  const sitemapIndex = generateSitemapIndex();

  // Write sitemap files
  const mainPath = resolve(__dirname, "..", "public", "sitemap.xml");
  const imagePath = resolve(__dirname, "..", "public", "sitemap-image.xml");
  const newsPath = resolve(__dirname, "..", "public", "sitemap-news.xml");
  const indexPath = resolve(__dirname, "..", "public", "sitemap-index.xml");

  writeFileSync(mainPath, mainSitemap, "utf-8");
  writeFileSync(imagePath, imageSitemap, "utf-8");
  writeFileSync(newsPath, newsSitemap, "utf-8");
  writeFileSync(indexPath, sitemapIndex, "utf-8");

  const totalUrls = 5 + pages.filter((p) => !p.noindex).length + posts.filter((p) => !p.noindex).length;
  console.log(`[sitemap] Generated enhanced sitemaps:`);
  console.log(`  - Main sitemap: ${mainPath} (${totalUrls} URLs)`);
  console.log(`  - Image sitemap: ${imagePath}`);
  console.log(`  - News sitemap: ${newsPath}`);
  console.log(`  - Sitemap index: ${indexPath}`);
}

// Generate enhanced sitemaps
generateEnhancedSitemap().catch(console.error);

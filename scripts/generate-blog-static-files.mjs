/**
 * Pre-build script: generates static HTML fallbacks for ALL blog posts
 * and updates sitemap to include both SPA routes and HTML fallbacks.
 * 
 * Usage: node scripts/generate-blog-static-files.mjs
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE_URL = "https://pngtosvgconverter.com";

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function fetchFromSupabase(table, select) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[blog-static] No Supabase env vars found, using fallback data");
    // Fallback data for development
    return [
      { 
        slug: "png-to-svg-converter-complete-guide", 
        title: "PNG to SVG Converter Complete Guide",
        excerpt: "Complete guide to converting PNG images to SVG vector graphics with our free online tool",
        content: "Learn how to convert PNG to SVG with our free online converter...",
        meta_title: "PNG to SVG Converter Complete Guide — Free Online Tool",
        meta_description: "Complete guide to converting PNG images to SVG vector graphics. Learn about the best tools, techniques, and tips for high-quality SVG conversion.",
        featured_image: "https://pngtosvgconverter.com/og-image.jpg",
        created_at: "2026-03-24T00:00:00Z",
        updated_at: "2026-03-24T00:00:00Z",
        noindex: false 
      }
    ];
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
      console.warn(`[blog-static] Failed to fetch ${table}: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.warn(`[blog-static] Error fetching ${table}:`, err.message);
    return [];
  }
}

function generateBlogHTML(post) {
  const title = post.meta_title || `${post.title} — PNGTOSVG`;
  const description = post.meta_description || post.excerpt || "Convert PNG images to SVG vector graphics instantly. Free, fast, and secure.";
  const url = `${BASE_URL}/blog/${post.slug}`;
  const image = post.featured_image || `${BASE_URL}/og-image.jpg`;
  const publishedDate = post.created_at || new Date().toISOString();
  const modifiedDate = post.updated_at || publishedDate;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="author" content="PNGTOSVG">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="PNGTOSVG">
    <meta property="og:image" content="${image}">
    <meta property="article:published_time" content="${publishedDate}">
    <meta property="article:modified_time" content="${modifiedDate}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${image}">
    
    <!-- Article Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${escapeHtml(post.title)}",
      "description": "${escapeHtml(description)}",
      "url": "${url}",
      "image": "${image}",
      "datePublished": "${publishedDate}",
      "dateModified": "${modifiedDate}",
      "author": {
        "@type": "Organization",
        "name": "PNGTOSVG",
        "url": "${BASE_URL}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "PNGTOSVG",
        "url": "${BASE_URL}",
        "logo": {
          "@type": "ImageObject",
          "url": "${BASE_URL}/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${url}"
      }
    }
    </script>
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/png" href="/favicon.png">
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background: #f8fafc;
        }
        .blog-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: white;
            min-height: 100vh;
        }
        .blog-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .blog-title {
            font-size: 2.5rem;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 1rem;
        }
        .blog-meta {
            color: #64748b;
            font-size: 0.9rem;
        }
        .blog-content {
            color: #334155;
            line-height: 1.8;
        }
        .blog-footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e2e8f0;
            text-align: center;
        }
        .redirect-notice {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 2rem;
            text-align: center;
        }
        .redirect-notice a {
            color: #0ea5e9;
            text-decoration: none;
            font-weight: 600;
        }
        .redirect-notice a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="blog-container">
        <div class="redirect-notice">
            <strong>Interactive Version Available:</strong> 
            <a href="/blog/${post.slug}">Click here for the full interactive experience</a>
            <br><small>You'll be redirected automatically in 10 seconds...</small>
        </div>
        
        <header class="blog-header">
            <h1 class="blog-title">${escapeHtml(post.title)}</h1>
            <div class="blog-meta">
                Published on ${new Date(publishedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
            </div>
        </header>
        
        <main class="blog-content">
            ${post.content ? post.content : `<p>${escapeHtml(post.excerpt || 'Loading content...')}</p>`}
        </main>
        
        <footer class="blog-footer">
            <p>
                <strong>Want to convert PNG to SVG?</strong><br>
                Try our free online tool at <a href="/">PNGTOSVG Converter</a>
            </p>
            <p style="margin-top: 1rem; font-size: 0.85rem; color: #64748b;">
                © 2024 PNGTOSVG. All rights reserved.
            </p>
        </footer>
    </div>

    <script>
        // Auto-redirect to interactive version after 10 seconds
        setTimeout(() => {
            window.location.href = '/blog/${post.slug}';
        }, 10000);
    </script>
</body>
</html>`;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function generateBlogStaticFiles() {
  console.log('[blog-static] Starting blog static file generation...');
  
  // Create blog directory if it doesn't exist
  const blogDir = resolve(__dirname, '..', 'public', 'blog');
  if (!existsSync(blogDir)) {
    mkdirSync(blogDir, { recursive: true });
    console.log('[blog-static] Created blog directory:', blogDir);
  }

  // Fetch all published blog posts
  const posts = await fetchFromSupabase("blog_posts", "slug,title,excerpt,content,meta_title,meta_description,featured_image,created_at,updated_at,noindex");
  
  if (posts.length === 0) {
    console.warn('[blog-static] No blog posts found');
    return;
  }

  console.log(`[blog-static] Found ${posts.length} blog posts`);

  // Generate HTML file for each post
  let generatedCount = 0;
  for (const post of posts) {
    try {
      const html = generateBlogHTML(post);
      const filePath = resolve(blogDir, `${post.slug}.html`);
      writeFileSync(filePath, html, 'utf-8');
      console.log(`[blog-static] Generated: ${post.slug}.html`);
      generatedCount++;
    } catch (error) {
      console.error(`[blog-static] Error generating ${post.slug}.html:`, error.message);
    }
  }

  console.log(`[blog-static] Generated ${generatedCount} static HTML files for blog posts`);
  
  // Now update the sitemap to include HTML fallbacks
  await updateSitemapWithHTMLFallbacks(posts);
}

async function updateSitemapWithHTMLFallbacks(posts) {
  console.log('[blog-static] Updating sitemap with HTML fallbacks...');
  
  const today = new Date().toISOString().split("T")[0];

  // Static routes
  const staticUrls = [
    { loc: "/", changefreq: "weekly", priority: "1.0" },
    { loc: "/about", changefreq: "monthly", priority: "0.7" },
    { loc: "/contact", changefreq: "monthly", priority: "0.6" },
    { loc: "/privacy", changefreq: "yearly", priority: "0.4" },
    { loc: "/blog", changefreq: "weekly", priority: "0.9" },
  ];

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

  // Add blog posts (both SPA route and HTML fallback)
  for (const post of posts) {
    if (post.noindex) continue;
    const lastmod = post.updated_at ? post.updated_at.split("T")[0] : today;
    
    // SPA route
    urls += `  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    
    // HTML fallback
    urls += `  <url>
    <loc>${BASE_URL}/blog/${post.slug}.html</loc>
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

  const totalUrls = staticUrls.length + (posts.filter(p => !p.noindex).length * 2);
  console.log(`[blog-static] Updated sitemap with ${totalUrls} URLs (including ${posts.filter(p => !p.noindex).length} blog post pairs)`);
}

// Run the generation
generateBlogStaticFiles().catch(console.error);

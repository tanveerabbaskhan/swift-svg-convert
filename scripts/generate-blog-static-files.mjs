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

function generateBlogPostHTML(post) {
  const title = post.meta_title || `${post.title} — PNGTOSVG`;
  const description = post.meta_description || post.excerpt || "Convert PNG images to SVG vector graphics instantly. Free, fast, and secure.";
  const image = post.featured_image || "https://pngtosvgconverter.com/og-image.jpg";
  const publishDate = post.created_at ? new Date(post.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const updateDate = post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : publishDate;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${BASE_URL}/blog/${post.slug}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${BASE_URL}/blog/${post.slug}">
    <meta property="og:site_name" content="PNGTOSVG">
    <meta property="og:image" content="${image}">
    <meta property="article:published_time" content="${post.created_at}">
    <meta property="article:modified_time" content="${post.updated_at}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${image}">
    
    <!-- Article Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${escapeHtml(title)}",
        "description": "${escapeHtml(description)}",
        "url": "${BASE_URL}/blog/${post.slug}",
        "datePublished": "${post.created_at}",
        "dateModified": "${post.updated_at}",
        "author": {
            "@type": "Organization",
            "name": "PNGTOSVG"
        },
        "publisher": {
            "@type": "Organization",
            "name": "PNGTOSVG",
            "url": "${BASE_URL}"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "${BASE_URL}/blog/${post.slug}"
        },
        "image": "${image}"
    }
    </script>
    
    <!-- Redirect to app after 1 second -->
    <meta http-equiv="refresh" content="1;url=/blog/${post.slug}">
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #0f172a;
            line-height: 1.2;
        }
        .meta {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 2rem;
            font-size: 0.9rem;
            color: #64748b;
        }
        .description {
            font-size: 1.25rem;
            color: #64748b;
            margin-bottom: 2rem;
            text-align: center;
        }
        .content {
            background: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        .loading {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .spinner {
            border: 4px solid #e2e8f0;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .featured-image {
            width: 100%;
            max-width: 600px;
            height: auto;
            border-radius: 0.5rem;
            margin: 0 auto 2rem;
            display: block;
        }
        .breadcrumb {
            text-align: center;
            margin-bottom: 2rem;
            font-size: 0.9rem;
            color: #64748b;
        }
        .breadcrumb a {
            color: #3b82f6;
            text-decoration: none;
        }
        .breadcrumb a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="breadcrumb">
            <a href="${BASE_URL}">Home</a> / <a href="${BASE_URL}/blog">Blog</a> / ${escapeHtml(post.title)}
        </div>
        
        <div class="header">
            <h1 class="title">${escapeHtml(post.title)}</h1>
            <div class="meta">
                <span>📅 Published: ${publishDate}</span>
                ${post.updated_at !== post.created_at ? `<span>🔄 Updated: ${updateDate}</span>` : ''}
            </div>
            ${post.excerpt ? `<p class="description">${escapeHtml(post.excerpt)}</p>` : ''}
        </div>
        
        ${post.featured_image ? `<img src="${post.featured_image}" alt="${escapeHtml(post.title)}" class="featured-image" />` : ''}
        
        <div class="content">
            <div>${post.content || 'Loading content...'}</div>
        </div>
        
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading interactive version...</p>
            <p><small>If you're not redirected automatically, <a href="/blog/${post.slug}">click here</a>.</small></p>
        </div>
    </div>
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
      const html = generateBlogPostHTML(post);
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

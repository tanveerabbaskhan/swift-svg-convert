/**
 * Fixed version of the blog static HTML generator
 */

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateBlogHTML(post, BASE_URL) {
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
        
        // Also redirect if user clicks anywhere (optional)
        document.addEventListener('click', (e) => {
            if (!e.target.closest('a')) {
                window.location.href = '/blog/${post.slug}';
            }
        });
    </script>
</body>
</html>`;
}

export { generateBlogHTML, escapeHtml };

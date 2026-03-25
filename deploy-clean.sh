#!/bin/bash

# Clean Deployment Script - Bypasses malicious script injection

echo "🚀 Creating clean deployment..."

# Create a clean deployment folder
mkdir -p clean-deploy

# Copy only essential files
cp dist/index.html clean-deploy/
cp dist/vercel.json clean-deploy/
cp -r dist/assets clean-deploy/
cp -r dist/blog clean-deploy/
cp dist/robots.txt clean-deploy/
cp dist/sitemap.xml clean-deploy/
cp dist/favicon.ico clean-deploy/

# Create a clean index.html without any script injection
cat > clean-deploy/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Free PNG to SVG Converter Online — No Signup, No Watermark</title>
    <meta name="description" content="Convert PNG to SVG instantly with true vectorization — not fake Base64 embedding. Our free online tool uses AI-powered image tracing to preserve colors, sharp edges, and transparent backgrounds. No signup. No watermark. No limits." />
    <meta name="author" content="PNGTOSVG" />
    <meta name="robots" content="index, follow" />
    <meta name="google-site-verification" content="ZsbbYdnAKNqMrWxXeVfk9NgsMpZiTG5I-ZhOEeJoCyw" />
    <link rel="canonical" href="https://pngtosvgconverter.com/" />

    <meta property="og:title" content="Free PNG to SVG Converter Online — No Signup, No Watermark" />
    <meta property="og:description" content="Convert PNG to SVG instantly with true vectorization — not fake Base64 embedding. AI-powered image tracing preserves colors, sharp edges, and transparent backgrounds." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://pngtosvgconverter.com/" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Free PNG to SVG Converter Online — No Signup, No Watermark" />
    <meta name="twitter:description" content="Convert PNG to SVG instantly with true vectorization — not fake Base64 embedding. AI-powered image tracing preserves colors, sharp edges, and transparent backgrounds." />

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PNGTOSVG",
      "url": "https://pngtosvgconverter.com",
      "description": "Free online PNG to SVG converter with bulk conversion support",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Any",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    }
    </script>
    <script type="module" crossorigin src="/assets/index-Cs6S2XNG.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/vendor-BtIrUdbE.js">
    <link rel="modulepreload" crossorigin href="/assets/router-DyYbef1e.js">
    <link rel="stylesheet" crossorigin href="/assets/index-DZhcG8jI.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
EOF

echo "✅ Clean deployment ready in 'clean-deploy' folder"
echo "📁 Deploy this folder to Vercel manually or use Vercel CLI"

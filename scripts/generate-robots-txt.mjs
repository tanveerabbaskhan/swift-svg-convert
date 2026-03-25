/**
 * Generate comprehensive robots.txt for Google SEO compliance
 * Ensures proper crawling and indexing directives
 */

const BASE_URL = "https://pngtosvgconverter.com";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function generateRobotsTxt() {
  const robotsTxt = `# Robots.txt for PNGTOSVG Converter
# Generated: ${new Date().toISOString()}
# Google SEO Compliant

User-agent: *
Allow: /
Allow: /blog/
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /sitemap.xml
Allow: /robots.txt

# Block admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/
Disallow: /node_modules/

# Block non-content files
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /*.txt$
Disallow: /*.pdf$
Disallow: /*.doc$
Disallow: /*.docx$

# Allow specific important files
Allow: /sitemap.xml
Allow: /robots.txt

# Crawl delay (optional, be conservative)
Crawl-delay: 1

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-image.xml

# Googlebot specific directives
User-agent: Googlebot
Allow: /
Allow: /blog/
Disallow: /admin/
Disallow: /api/

# Googlebot-Image specific directives
User-agent: Googlebot-Image
Allow: /
Allow: /blog/
Allow: /assets/
Disallow: /admin/

# Googlebot-News (if you have news content)
User-agent: Googlebot-News
Allow: /blog/
Disallow: /

# Bingbot specific directives
User-agent: Bingbot
Allow: /
Allow: /blog/
Disallow: /admin/
Disallow: /api/

# DuckDuckBot specific directives
User-agent: DuckDuckBot
Allow: /
Allow: /blog/
Disallow: /admin/
Disallow: /api/

# Social media crawlers
User-agent: facebookexternalhit
Allow: /
Allow: /blog/

User-agent: Twitterbot
Allow: /
Allow: /blog/

User-agent: LinkedInBot
Allow: /
Allow: /blog/

User-agent: Pinterest
Allow: /
Allow: /blog/
Allow: /assets/

# SEO tools crawlers
User-agent: AhrefsBot
Allow: /
Allow: /blog/

User-agent: SemrushBot
Allow: /
Allow: /blog/

User-agent: MJ12bot
Allow: /
Allow: /blog/

# Block unwanted bots
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /node_modules/
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /*.txt$
Disallow: /*.pdf$
Disallow: /*.doc$
Disallow: /*.docx$

# End of robots.txt`;

  const outputPath = resolve(__dirname, "..", "public", "robots.txt");
  writeFileSync(outputPath, robotsTxt, "utf-8");
  console.log(`[robots] Generated ${outputPath}`);
}

// Generate robots.txt
generateRobotsTxt();

import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/use-cms-data";

interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  tags?: string[];
  schema?: any;
}

/**
 * Advanced SEO system like Yoast plugin with comprehensive meta tags, schema markup, and social media optimization
 */
export function useAdvancedSEO(seoData: Partial<SEOData>) {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    // Generate comprehensive SEO data
    const finalSEOData: SEOData = {
      title: seoData.title || settings.homepage_meta_title || settings.default_meta_title || settings.site_name || "PNGTOSVG",
      description: seoData.description || settings.homepage_meta_description || settings.default_meta_description || settings.site_description || "Convert PNG images to SVG vector graphics instantly. Free, fast, and secure.",
      canonical: seoData.canonical || window.location.href,
      ogTitle: seoData.ogTitle || seoData.title || settings.site_name,
      ogDescription: seoData.ogDescription || seoData.description,
      ogImage: seoData.ogImage || settings.og_image || "https://pngtosvgconverter.com/og-image.jpg",
      ogType: seoData.ogType || (window.location.pathname.includes("/blog/") ? "article" : "website"),
      twitterCard: seoData.twitterCard || "summary_large_image",
      twitterTitle: seoData.twitterTitle || seoData.title || settings.site_name,
      twitterDescription: seoData.twitterDescription || seoData.description,
      twitterImage: seoData.twitterImage || settings.twitter_image || settings.og_image || "https://pngtosvgconverter.com/og-image.jpg",
      robots: seoData.robots || "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
      author: seoData.author || settings.site_author || "PNGTOSVG",
      publishedTime: seoData.publishedTime,
      modifiedTime: seoData.modifiedTime,
      articleSection: seoData.articleSection,
      tags: seoData.tags,
      schema: seoData.schema
    };

    // Clear existing SEO meta tags
    clearExistingSEOTags();

    // Set document title
    document.title = finalSEOData.title;

    // Basic meta tags
    setMetaTag("description", finalSEOData.description);
    setMetaTag("robots", finalSEOData.robots);
    setMetaTag("author", finalSEOData.author);
    setMetaTag("language", "en");
    setMetaTag("geo.region", "US");
    setMetaTag("geo.placename", "United States");
    setMetaTag("ICBM", "40.0, -100.0");

    // Canonical URL
    setLinkTag("canonical", finalSEOData.canonical);

    // Open Graph tags
    setMetaProperty("og:title", finalSEOData.ogTitle);
    setMetaProperty("og:description", finalSEOData.ogDescription);
    setMetaProperty("og:image", finalSEOData.ogImage);
    setMetaProperty("og:image:width", "1200");
    setMetaProperty("og:image:height", "630");
    setMetaProperty("og:image:type", "image/jpeg");
    setMetaProperty("og:image:alt", finalSEOData.ogTitle);
    setMetaProperty("og:url", finalSEOData.canonical);
    setMetaProperty("og:type", finalSEOData.ogType);
    setMetaProperty("og:site_name", settings.site_name || "PNGTOSVG");
    setMetaProperty("og:locale", "en_US");

    // Twitter Card tags
    setMetaName("twitter:card", finalSEOData.twitterCard);
    setMetaName("twitter:title", finalSEOData.twitterTitle);
    setMetaName("twitter:description", finalSEOData.twitterDescription);
    setMetaName("twitter:image", finalSEOData.twitterImage);
    setMetaName("twitter:image:alt", finalSEOData.twitterTitle);
    setMetaName("twitter:site", settings.social_twitter || "@pngtosvg");
    setMetaName("twitter:creator", settings.social_twitter || "@pngtosvg");

    // Article specific tags (for blog posts)
    if (finalSEOData.ogType === "article") {
      setMetaProperty("article:published_time", finalSEOData.publishedTime);
      setMetaProperty("article:modified_time", finalSEOData.modifiedTime);
      setMetaProperty("article:author", finalSEOData.author);
      setMetaProperty("article:section", finalSEOData.articleSection || "Blog");
      
      if (finalSEOData.tags && finalSEOData.tags.length > 0) {
        finalSEOData.tags.forEach((tag, index) => {
          setMetaProperty(`article:tag[${index}]`, tag);
        });
      }
    }

    // Website specific tags
    if (finalSEOData.ogType === "website") {
      setMetaProperty("website:developer", "PNGTOSVG Team");
      setMetaProperty("website:contact", "support@pngtosvgconverter.com");
    }

    // Additional SEO meta tags
    setMetaName("theme-color", "#3b82f6");
    setMetaName("msapplication-TileColor", "#3b82f6");
    setMetaName("apple-mobile-web-app-capable", "yes");
    setMetaName("apple-mobile-web-app-status-bar-style", "default");
    setMetaName("apple-mobile-web-app-title", settings.site_name || "PNGTOSVG");
    setMetaName("application-name", settings.site_name || "PNGTOSVG");
    setMetaName("msapplication-TileImage", "/mstile-144x144.png");
    setMetaName("format-detection", "telephone=no");

    // Favicon and app icons
    setLinkTag("icon", "/favicon.ico", "image/x-icon");
    setLinkTag("icon", "/favicon.svg", "image/svg+xml");
    setLinkTag("apple-touch-icon", "/apple-touch-icon.png");
    setLinkTag("manifest", "/manifest.json");

    // DNS prefetch for performance
    setLinkTag("dns-prefetch", "//www.googletagmanager.com");
    setLinkTag("dns-prefetch", "//www.google-analytics.com");
    setLinkTag("dns-prefetch", "//fonts.googleapis.com");
    setLinkTag("dns-prefetch", "//fonts.gstatic.com");

    // Preconnect for critical resources
    setLinkTag("preconnect", "//www.googletagmanager.com");
    setLinkTag("preconnect", "//www.google-analytics.com");

    // Schema.org structured data
    generateSchemaMarkup(finalSEOData, settings);

    // Google Search Console verification
    if (settings.google_search_console) {
      setMetaName("google-site-verification", settings.google_search_console);
    }

    // Bing Webmaster Tools verification
    if (settings.bing_webmaster) {
      setMetaName("msvalidate.01", settings.bing_webmaster);
    }

    // Pinterest verification
    if (settings.pinterest_verify) {
      setMetaName("p:domain_verify", settings.pinterest_verify);
    }

    // Facebook Domain Verification
    if (settings.facebook_domain) {
      setMetaName("facebook-domain-verification", settings.facebook_domain);
    }

  }, [settings, seoData]);
}

function clearExistingSEOTags() {
  // Remove existing meta tags that we'll replace
  const tagsToRemove = [
    'meta[name="description"]',
    'meta[name="robots"]',
    'meta[name="author"]',
    'meta[name="language"]',
    'meta[name="geo.region"]',
    'meta[name="geo.placename"]',
    'meta[name="ICBM"]',
    'link[rel="canonical"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
    'meta[property^="article:"]',
    'meta[property^="website:"]',
    'meta[name="theme-color"]',
    'meta[name="msapplication-TileColor"]',
    'meta[name="apple-mobile-web-app-capable"]',
    'meta[name="apple-mobile-web-app-status-bar-style"]',
    'meta[name="apple-mobile-web-app-title"]',
    'meta[name="application-name"]',
    'meta[name="msapplication-TileImage"]',
    'meta[name="format-detection"]',
    'link[rel="icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="manifest"]',
    'link[rel="dns-prefetch"]',
    'link[rel="preconnect"]',
    'meta[name="google-site-verification"]',
    'meta[name="msvalidate.01"]',
    'meta[name="p:domain_verify"]',
    'meta[name="facebook-domain-verification"]',
    'script[type="application/ld+json"]'
  ];

  tagsToRemove.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });
}

function setMetaTag(name: string, content: string) {
  const meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  document.head.appendChild(meta);
}

function setMetaName(name: string, content: string) {
  const meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  document.head.appendChild(meta);
}

function setMetaProperty(property: string, content: string) {
  const meta = document.createElement("meta");
  meta.setAttribute("property", property);
  meta.content = content;
  document.head.appendChild(meta);
}

function setLinkTag(rel: string, href: string, type?: string) {
  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  if (type) link.type = type;
  document.head.appendChild(link);
}

function generateSchemaMarkup(seoData: SEOData, settings: any) {
  let schema: any = {};

  if (seoData.ogType === "article") {
    // Article schema for blog posts
    schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": seoData.title,
      "description": seoData.description,
      "image": seoData.ogImage,
      "url": seoData.canonical,
      "datePublished": seoData.publishedTime,
      "dateModified": seoData.modifiedTime,
      "author": {
        "@type": "Organization",
        "name": settings.site_author || "PNGTOSVG",
        "url": "https://pngtosvgconverter.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": settings.site_name || "PNGTOSVG",
        "url": "https://pngtosvgconverter.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://pngtosvgconverter.com/logo.png",
          "width": 512,
          "height": 512
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": seoData.canonical
      },
      "articleSection": seoData.articleSection || "Blog",
      "keywords": seoData.tags ? seoData.tags.join(", ") : "",
      "wordCount": seoData.description ? seoData.description.split(" ").length : 0
    };
  } else {
    // Website schema for homepage
    schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": settings.site_name || "PNGTOSVG",
      "description": settings.site_description || seoData.description,
      "url": "https://pngtosvgconverter.com",
      "image": "https://pngtosvgconverter.com/og-image.jpg",
      "author": {
        "@type": "Organization",
        "name": settings.site_author || "PNGTOSVG"
      },
      "publisher": {
        "@type": "Organization",
        "name": settings.site_name || "PNGTOSVG",
        "logo": {
          "@type": "ImageObject",
          "url": "https://pngtosvgconverter.com/logo.png"
        }
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://pngtosvgconverter.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "sameAs": [
        settings.social_twitter ? `https://twitter.com/${settings.social_twitter.replace('@', '')}` : "",
        settings.social_facebook ? `https://facebook.com/${settings.social_facebook}` : ""
      ].filter(Boolean)
    };
  }

  // Add BreadcrumbList if on subpage
  if (window.location.pathname !== "/") {
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": generateBreadcrumbList(window.location.pathname)
    };

    // Create script tag for schema markup
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    // Create script tag for breadcrumbs
    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);
  } else {
    // Create script tag for schema markup
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}

function generateBreadcrumbList(pathname: string): any[] {
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://pngtosvgconverter.com"
    }
  ];

  let currentPath = "https://pngtosvgconverter.com";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const name = segment.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    breadcrumbs.push({
      "@type": "ListItem",
      "position": index + 2,
      "name": name,
      "item": currentPath
    });
  });

  return breadcrumbs;
}

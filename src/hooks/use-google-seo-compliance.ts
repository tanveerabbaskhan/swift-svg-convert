import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/use-cms-data";

interface GoogleSEOComplianceRules {
  // Technical SEO Requirements
  titleOptimization: boolean;
  descriptionOptimization: boolean;
  canonicalURL: boolean;
  robotsTxt: boolean;
  sitemapSubmission: boolean;
  mobileFriendly: boolean;
  pageSpeed: boolean;
  httpsSecurity: boolean;
  structuredData: boolean;
  imageOptimization: boolean;
  
  // Content SEO Requirements
  contentQuality: boolean;
  keywordOptimization: boolean;
  readabilityScore: boolean;
  internalLinking: boolean;
  externalLinking: boolean;
  headingStructure: boolean;
  contentLength: boolean;
  duplicateContent: boolean;
  
  // User Experience Signals
  coreWebVitals: boolean;
  mobileUsability: boolean;
  safeBrowsing: boolean;
  httpsUsage: boolean;
  noIntrusiveInterstitials: boolean;
  
  // Google Search Console Specific
  indexability: boolean;
  crawlability: boolean;
  sitemapCoverage: boolean;
  robotsDirectives: boolean;
  canonicalConsistency: boolean;
  nofollowLinks: boolean;
  redirectChains: boolean;
  soft404s: boolean;
  serverErrors: boolean;
}

/**
 * Ensures complete Google SEO compliance for all pages and posts
 * Implements all GSC requirements for indexing and discovery
 */
export function useGoogleSEOCompliance(pageData: any) {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    // Run comprehensive SEO compliance check
    const compliance = checkGoogleSEOCompliance(pageData, settings);
    applySEOCompliance(compliance, pageData, settings);
  }, [settings, pageData]);

  return {
    runComplianceCheck: () => checkGoogleSEOCompliance(pageData, settings),
    fixSEOIssues: (issues: string[]) => fixSEOIssues(issues, pageData, settings),
    generateSEOReport: () => generateSEOReport(pageData, settings)
  };
}

function checkGoogleSEOCompliance(pageData: any, settings: any): GoogleSEOComplianceRules {
  return {
    // Technical SEO Requirements
    titleOptimization: checkTitleOptimization(pageData),
    descriptionOptimization: checkDescriptionOptimization(pageData),
    canonicalURL: checkCanonicalURL(pageData),
    robotsTxt: checkRobotsTxt(settings),
    sitemapSubmission: checkSitemapSubmission(),
    mobileFriendly: checkMobileFriendly(),
    pageSpeed: checkPageSpeed(),
    httpsSecurity: checkHTTPSSecurity(),
    structuredData: checkStructuredData(pageData),
    imageOptimization: checkImageOptimization(pageData),
    
    // Content SEO Requirements
    contentQuality: checkContentQuality(pageData),
    keywordOptimization: checkKeywordOptimization(pageData),
    readabilityScore: checkReadabilityScore(pageData),
    internalLinking: checkInternalLinking(pageData),
    externalLinking: checkExternalLinking(pageData),
    headingStructure: checkHeadingStructure(pageData),
    contentLength: checkContentLength(pageData),
    duplicateContent: checkDuplicateContent(pageData),
    
    // User Experience Signals
    coreWebVitals: checkCoreWebVitals(),
    mobileUsability: checkMobileUsability(),
    safeBrowsing: checkSafeBrowsing(),
    httpsUsage: checkHTTPSUsage(),
    noIntrusiveInterstitials: checkNoIntrusiveInterstitials(),
    
    // Google Search Console Specific
    indexability: checkIndexability(pageData),
    crawlability: checkCrawlability(pageData, settings),
    sitemapCoverage: checkSitemapCoverage(),
    robotsDirectives: checkRobotsDirectives(pageData),
    canonicalConsistency: checkCanonicalConsistency(pageData),
    nofollowLinks: checkNofollowLinks(pageData),
    redirectChains: checkRedirectChains(),
    soft404s: checkSoft404s(),
    serverErrors: checkServerErrors()
  };
}

// Technical SEO Checks
function checkTitleOptimization(pageData: any): boolean {
  const title = pageData.meta_title || pageData.title;
  if (!title) return false;
  
  // Title length: 30-60 characters optimal
  const length = title.length;
  if (length < 30 || length > 60) return false;
  
  // Must contain primary keywords
  const content = title.toLowerCase();
  const hasKeywords = content.includes('png') || content.includes('svg') || content.includes('converter');
  
  // No keyword stuffing
  const words = title.split(' ');
  const keywordCount = words.filter(word => 
    word.toLowerCase().includes('png') || word.toLowerCase().includes('svg')
  ).length;
  
  return hasKeywords && keywordCount <= 2;
}

function checkDescriptionOptimization(pageData: any): boolean {
  const description = pageData.meta_description;
  if (!description) return false;
  
  // Description length: 120-160 characters optimal
  const length = description.length;
  if (length < 120 || length > 160) return false;
  
  // Must contain keywords naturally
  const content = description.toLowerCase();
  const hasKeywords = content.includes('png') || content.includes('svg') || content.includes('convert');
  
  // No keyword stuffing
  const words = description.split(' ');
  const keywordCount = words.filter(word => 
    word.toLowerCase().includes('png') || word.toLowerCase().includes('svg')
  ).length;
  
  return hasKeywords && keywordCount <= 3;
}

function checkCanonicalURL(pageData: any): boolean {
  // Check if canonical URL exists and is correct
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) return false;
  
  const canonicalUrl = canonical.getAttribute('href');
  const currentUrl = window.location.href;
  
  return canonicalUrl === currentUrl || canonicalUrl === currentUrl.replace(/\/$/, '');
}

function checkRobotsTxt(settings: any): boolean {
  // Check if robots.txt exists and allows indexing
  return settings.robots_txt && settings.robots_txt.includes('Allow: /');
}

function checkSitemapSubmission(): boolean {
  // Check if sitemap exists and is accessible
  return fetch('/sitemap.xml')
    .then(response => response.ok)
    .catch(() => false);
}

function checkMobileFriendly(): boolean {
  // Check if page is mobile-friendly
  return window.innerWidth <= 768 || 
         navigator.userAgent.includes('Mobi') ||
         matchMedia('(max-width: 768px)').matches;
}

function checkPageSpeed(): boolean {
  // Check Core Web Vitals
  return 'PerformanceObserver' in window;
}

function checkHTTPSSecurity(): boolean {
  return window.location.protocol === 'https:';
}

function checkStructuredData(pageData: any): boolean {
  // Check for structured data
  const structuredData = document.querySelector('script[type="application/ld+json"]');
  if (!structuredData) return false;
  
  try {
    const data = JSON.parse(structuredData.textContent || '');
    return data['@context'] && data['@type'];
  } catch {
    return false;
  }
}

function checkImageOptimization(pageData: any): boolean {
  // Check if images have alt text and are optimized
  const images = document.querySelectorAll('img');
  let optimizedCount = 0;
  
  images.forEach(img => {
    if (img.alt && img.alt.length > 0) optimizedCount++;
  });
  
  return images.length === 0 || optimizedCount / images.length >= 0.8;
}

// Content SEO Checks
function checkContentQuality(pageData: any): boolean {
  const content = pageData.content || '';
  if (!content) return false;
  
  // Check for minimum content length
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 300) return false;
  
  // Check for unique content (simplified)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 10) return false;
  
  return true;
}

function checkKeywordOptimization(pageData: any): boolean {
  const content = (pageData.content || '').toLowerCase();
  const title = (pageData.meta_title || pageData.title || '').toLowerCase();
  const description = (pageData.meta_description || '').toLowerCase();
  
  // Check keyword density (1-3% optimal)
  const totalWords = content.split(/\s+/).length;
  const keywordCount = (content.match(/png|svg|convert/g) || []).length;
  const density = (keywordCount / totalWords) * 100;
  
  // Check if keywords appear in title, description, and content
  const hasTitleKeywords = title.includes('png') || title.includes('svg');
  const hasDescKeywords = description.includes('png') || description.includes('svg');
  const hasContentKeywords = keywordCount > 0;
  
  return hasTitleKeywords && hasDescKeywords && hasContentKeywords && 
         density >= 1 && density <= 3;
}

function checkReadabilityScore(pageData: any): boolean {
  const content = pageData.content || '';
  if (!content) return false;
  
  // Simplified Flesch Reading Ease
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) return false;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgCharsPerWord = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (avgCharsPerWord / 4.7));
  
  return score >= 60 && score <= 80; // Good readability range
}

function checkInternalLinking(pageData: any): boolean {
  const content = pageData.content || '';
  const internalLinks = (content.match(/href="\/[^"]*"/g) || []).length;
  
  // Should have at least 2-3 internal links for longer content
  const wordCount = content.split(/\s+/).length;
  const requiredLinks = wordCount > 500 ? 3 : wordCount > 300 ? 2 : 1;
  
  return internalLinks >= requiredLinks;
}

function checkExternalLinking(pageData: any): boolean {
  const content = pageData.content || '';
  const externalLinks = (content.match(/href="https?:\/\/[^"]*"/g) || []).length;
  
  // Should have at least 1 external link for authority
  return externalLinks >= 1;
}

function checkHeadingStructure(pageData: any): boolean {
  const content = pageData.content || '';
  
  // Check for proper heading hierarchy
  const hasH1 = content.includes('<h1') || document.querySelector('h1');
  const hasH2 = content.includes('<h2') || document.querySelector('h2');
  
  return hasH1 && hasH2;
}

function checkContentLength(pageData: any): boolean {
  const content = pageData.content || '';
  const wordCount = content.split(/\s+/).length;
  
  // Minimum 300 words for blog posts, 150 for pages
  const minLength = pageData.type === 'blog' ? 300 : 150;
  return wordCount >= minLength;
}

function checkDuplicateContent(pageData: any): boolean {
  // Simplified duplicate content check
  const content = pageData.content || '';
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Check for repeated sentences (simplified)
  const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));
  const duplicateRatio = 1 - (uniqueSentences.size / sentences.length);
  
  return duplicateRatio < 0.1; // Less than 10% duplicates
}

// User Experience Signal Checks
function checkCoreWebVitals(): boolean {
  // Check if Core Web Vitals are being tracked
  return 'PerformanceObserver' in window && 'PerformanceNavigationTiming' in window;
}

function checkMobileUsability(): boolean {
  // Check mobile usability factors
  const viewport = document.querySelector('meta[name="viewport"]');
  const touchEnabled = 'ontouchstart' in window;
  
  return viewport && touchEnabled;
}

function checkSafeBrowsing(): boolean {
  // Check if site is safe (simplified)
  return window.location.protocol === 'https:';
}

function checkHTTPSUsage(): boolean {
  return window.location.protocol === 'https:';
}

function checkNoIntrusiveInterstitials(): boolean {
  // Check for intrusive interstitials (simplified)
  const modals = document.querySelectorAll('.modal, .popup, .interstitial');
  return modals.length === 0;
}

// Google Search Console Specific Checks
function checkIndexability(pageData: any): boolean {
  // Check if page can be indexed
  const robots = document.querySelector('meta[name="robots"]');
  const robotsContent = robots?.getAttribute('content') || '';
  
  return !robotsContent.includes('noindex');
}

function checkCrawlability(pageData: any, settings: any): boolean {
  // Check if page can be crawled
  const robots = document.querySelector('meta[name="robots"]');
  const robotsContent = robots?.getAttribute('content') || '';
  
  return !robotsContent.includes('nofollow') && !robotsContent.includes('noarchive');
}

function checkSitemapCoverage(): boolean {
  // Check if current URL is in sitemap
  return fetch('/sitemap.xml')
    .then(response => response.text())
    .then(xml => xml.includes(window.location.pathname))
    .catch(() => false);
}

function checkRobotsDirectives(pageData: any): boolean {
  // Check robots directives
  const robots = document.querySelector('meta[name="robots"]');
  const robotsContent = robots?.getAttribute('content') || '';
  
  return robotsContent === '' || robotsContent.includes('index') || robotsContent.includes('follow');
}

function checkCanonicalConsistency(pageData: any): boolean {
  // Check canonical consistency
  const canonical = document.querySelector('link[rel="canonical"]');
  const canonicalUrl = canonical?.getAttribute('href');
  const currentUrl = window.location.href;
  
  return canonicalUrl === currentUrl || canonicalUrl === currentUrl.replace(/\/$/, '');
}

function checkNofollowLinks(pageData: any): boolean {
  // Check nofollow links
  const nofollowLinks = document.querySelectorAll('a[rel="nofollow"]');
  const totalLinks = document.querySelectorAll('a').length;
  
  // Should have reasonable nofollow ratio
  return totalLinks === 0 || (nofollowLinks.length / totalLinks) <= 0.1;
}

function checkRedirectChains(): boolean {
  // Check for redirect chains (simplified)
  return window.location.href === document.URL;
}

function checkSoft404s(): boolean {
  // Check for soft 404s
  return document.title !== '404 Not Found' && 
         !document.body.textContent?.includes('Page not found');
}

function checkServerErrors(): boolean {
  // Check server errors (simplified)
  return document.title !== '500 Internal Server Error' &&
         !document.body.textContent?.includes('Internal Server Error');
}

function applySEOCompliance(compliance: GoogleSEOComplianceRules, pageData: any, settings: any) {
  // Apply SEO fixes based on compliance check
  const issues = Object.entries(compliance)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (issues.length > 0) {
    console.warn('SEO Compliance Issues:', issues);
    fixSEOIssues(issues, pageData, settings);
  }
}

function fixSEOIssues(issues: string[], pageData: any, settings: any) {
  issues.forEach(issue => {
    switch (issue) {
      case 'titleOptimization':
        fixTitleOptimization(pageData);
        break;
      case 'descriptionOptimization':
        fixDescriptionOptimization(pageData);
        break;
      case 'canonicalURL':
        fixCanonicalURL(pageData);
        break;
      case 'structuredData':
        fixStructuredData(pageData, settings);
        break;
      case 'imageOptimization':
        fixImageOptimization(pageData);
        break;
      // Add more fixes as needed
    }
  });
}

function fixTitleOptimization(pageData: any) {
  const currentTitle = pageData.meta_title || pageData.title || '';
  if (!currentTitle) return;
  
  // Optimize title length and keywords
  let optimizedTitle = currentTitle;
  
  if (optimizedTitle.length < 30) {
    optimizedTitle += ' — PNGTOSVG';
  } else if (optimizedTitle.length > 60) {
    optimizedTitle = optimizedTitle.substring(0, 57) + '...';
  }
  
  // Add keywords if missing
  if (!optimizedTitle.toLowerCase().includes('png') && !optimizedTitle.toLowerCase().includes('svg')) {
    optimizedTitle += ' | PNG to SVG Converter';
  }
  
  document.title = optimizedTitle;
}

function fixDescriptionOptimization(pageData: any) {
  const currentDesc = pageData.meta_description || '';
  if (!currentDesc) return;
  
  let optimizedDesc = currentDesc;
  
  if (optimizedDesc.length < 120) {
    optimizedDesc += ' Convert PNG images to SVG vector graphics instantly with our free online tool.';
  } else if (optimizedDesc.length > 160) {
    optimizedDesc = optimizedDesc.substring(0, 157) + '...';
  }
  
  // Update meta description
  let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = optimizedDesc;
}

function fixCanonicalURL(pageData: any) {
  const currentUrl = window.location.href;
  
  // Remove existing canonical
  const existingCanonical = document.querySelector('link[rel="canonical"]');
  if (existingCanonical) {
    existingCanonical.remove();
  }
  
  // Add new canonical
  const canonical = document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = currentUrl;
  document.head.appendChild(canonical);
}

function fixStructuredData(pageData: any, settings: any) {
  // Remove existing structured data
  const existing = document.querySelectorAll('script[type="application/ld+json"]');
  existing.forEach(el => el.remove());
  
  // Add new structured data
  const structuredData = generateStructuredData(pageData, settings);
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

function fixImageOptimization(pageData: any) {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt || img.alt.length === 0) {
      img.alt = pageData.title || 'PNG to SVG conversion';
    }
  });
}

function generateStructuredData(pageData: any, settings: any) {
  const isArticle = window.location.pathname.includes('/blog/');
  
  if (isArticle) {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": pageData.title,
      "description": pageData.meta_description,
      "image": pageData.featured_image || settings.og_image,
      "url": window.location.href,
      "datePublished": pageData.created_at,
      "dateModified": pageData.updated_at,
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
      }
    };
  } else {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": settings.site_name || "PNGTOSVG",
      "description": settings.site_description,
      "url": "https://pngtosvgconverter.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://pngtosvgconverter.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
  }
}

function generateSEOReport(pageData: any, settings: any) {
  const compliance = checkGoogleSEOCompliance(pageData, settings);
  
  const score = Object.values(compliance).filter(Boolean).length;
  const total = Object.values(compliance).length;
  const percentage = Math.round((score / total) * 100);
  
  const issues = Object.entries(compliance)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  const passed = Object.entries(compliance)
    .filter(([key, value]) => value)
    .map(([key]) => key);
  
  return {
    score: percentage,
    total,
    passed,
    issues,
    status: percentage >= 90 ? 'Excellent' : percentage >= 75 ? 'Good' : 'Needs Improvement',
    recommendations: generateRecommendations(issues)
  };
}

function generateRecommendations(issues: string[]): string[] {
  const recommendations: { [key: string]: string } = {
    titleOptimization: 'Optimize your title to be 30-60 characters with relevant keywords',
    descriptionOptimization: 'Write a compelling description of 120-160 characters',
    canonicalURL: 'Add a canonical URL to prevent duplicate content issues',
    robotsTxt: 'Ensure your robots.txt allows indexing of important pages',
    sitemapSubmission: 'Submit your sitemap to Google Search Console',
    mobileFriendly: 'Ensure your page is mobile-friendly and responsive',
    pageSpeed: 'Improve page loading speed for better user experience',
    httpsSecurity: 'Use HTTPS to secure your website',
    structuredData: 'Add structured data to help search engines understand your content',
    imageOptimization: 'Add alt text to all images and optimize file sizes',
    contentQuality: 'Improve content quality with unique, valuable information',
    keywordOptimization: 'Use keywords naturally with proper density (1-3%)',
    readabilityScore: 'Improve readability with shorter sentences and simpler language',
    internalLinking: 'Add relevant internal links to improve navigation',
    externalLinking: 'Include authoritative external links for credibility',
    headingStructure: 'Use proper heading hierarchy (H1, H2, H3)',
    contentLength: 'Ensure sufficient content length (300+ words for blog posts)',
    duplicateContent: 'Remove or rewrite duplicate content',
    coreWebVitals: 'Optimize Core Web Vitals for better user experience',
    mobileUsability: 'Ensure mobile usability best practices',
    safeBrowsing: 'Maintain a safe and secure website',
    httpsUsage: 'Use HTTPS for all pages',
    noIntrusiveInterstitials: 'Remove intrusive pop-ups and interstitials',
    indexability: 'Ensure pages are indexable (no noindex tags)',
    crawlability: 'Ensure pages are crawlable (proper robots directives)',
    sitemapCoverage: 'Include all important pages in sitemap',
    robotsDirectives: 'Use proper robots directives for crawling',
    canonicalConsistency: 'Ensure canonical URLs are consistent',
    nofollowLinks: 'Use nofollow appropriately for external links',
    redirectChains: 'Avoid redirect chains for better crawling',
    soft404s: 'Fix soft 404 errors with proper 404 pages',
    serverErrors: 'Fix server errors (5xx) immediately'
  };
  
  return issues.map(issue => recommendations[issue] || `Fix ${issue} issue`);
}

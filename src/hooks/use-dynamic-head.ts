import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/use-cms-data";

/**
 * Dynamically applies admin dashboard settings to the document head:
 * - Document title from homepage_meta_title or default_meta_title or site_name
 * - Meta description from homepage_meta_description or default_meta_description or site_description
 * - Favicon from site_favicon
 * - Google Analytics script from google_analytics_id
 * - Google Search Console verification from google_search_console
 */
export function useDynamicHead() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    // Document title - prioritize homepage meta settings
    const title = settings.homepage_meta_title || settings.default_meta_title || settings.site_name;
    if (title) document.title = title;

    // Meta description - prioritize homepage meta settings
    const desc = settings.homepage_meta_description || settings.default_meta_description || settings.site_description;
    if (desc) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
      meta.content = desc;
    }

    // Update canonical URL for homepage
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = "https://pngtosvgconverter.com/";
    } else {
      const newCanonical = document.createElement("link");
      newCanonical.rel = "canonical";
      newCanonical.href = "https://pngtosvgconverter.com/";
      document.head.appendChild(newCanonical);
    }

    // Favicon
    if (settings.site_favicon) {
      let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = settings.site_favicon;
      link.type = settings.site_favicon.endsWith(".svg") ? "image/svg+xml" : "image/png";
    }

    // Google Search Console verification
    if (settings.google_search_console) {
      let meta = document.querySelector('meta[name="google-site-verification"]') as HTMLMetaElement;
      if (!meta) { meta = document.createElement("meta"); meta.name = "google-site-verification"; document.head.appendChild(meta); }
      meta.content = settings.google_search_console;
    }

    // Enhanced Google Analytics 4 with comprehensive tracking
    if (settings.google_analytics_id && settings.google_analytics_id.startsWith("G-")) {
      const gaId = settings.google_analytics_id;
      if (!document.querySelector(`script[src*="${gaId}"]`)) {
        // Google Analytics 4 gtag.js
        const script1 = document.createElement("script");
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script1);

        // Enhanced GA4 configuration with custom tracking
        const script2 = document.createElement("script");
        script2.textContent = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // Enhanced GA4 Configuration
          gtag('config', '${gaId}', {
            page_title: document.title,
            page_location: window.location.href,
            content_group: 'PNG to SVG Converter',
            custom_map: {
              'conversion_type': 'png_to_svg_conversion',
              'tool_usage': 'converter_interaction',
              'file_size': 'upload_size_category'
            },
            send_page_view: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
          
          // Custom event tracking for conversions
          window.trackConversion = function(fileSize, conversionTime) {
            gtag('event', 'png_to_svg_conversion', {
              'event_category': 'conversions',
              'event_label': 'successful_conversion',
              'conversion_type': 'png_to_svg_conversion',
              'file_size_bytes': fileSize,
              'conversion_time_ms': conversionTime,
              'value': 1
            });
          };
          
          // Track file upload attempts
          window.trackFileUpload = function(fileSize, fileType) {
            gtag('event', 'file_upload', {
              'event_category': 'user_interaction',
              'event_label': 'upload_attempt',
              'file_size_bytes': fileSize,
              'file_type': fileType,
              'tool_usage': 'converter_interaction'
            });
          };
          
          // Track tool feature usage
          window.trackFeatureUsage = function(featureName, action) {
            gtag('event', 'feature_usage', {
              'event_category': 'engagement',
              'event_label': featureName,
              'action': action,
              'tool_usage': 'converter_interaction'
            });
          };
          
          // Track error events
          window.trackError = function(errorType, errorMessage) {
            gtag('event', 'error', {
              'event_category': 'system',
              'event_label': errorType,
              'error_message': errorMessage,
              'non_interaction': true
            });
          };
        `;
        document.head.appendChild(script2);
      }
    }

    // OG meta tags
    if (settings.site_name) {
      let ogSiteName = document.querySelector('meta[property="og:site_name"]') as HTMLMetaElement;
      if (!ogSiteName) { ogSiteName = document.createElement("meta"); ogSiteName.setAttribute("property", "og:site_name"); document.head.appendChild(ogSiteName); }
      ogSiteName.content = settings.site_name;
    }

    // Update OG tags for homepage
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle) {
      ogTitle.content = title;
    }

    const ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (ogDescription) {
      ogDescription.content = desc;
    }

    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    if (ogUrl) {
      ogUrl.content = "https://pngtosvgconverter.com/";
    }

    // Update Twitter tags for homepage
    const twitterTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement;
    if (twitterTitle) {
      twitterTitle.content = title;
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement;
    if (twitterDescription) {
      twitterDescription.content = desc;
    }
  }, [settings]);

  return settings;
}

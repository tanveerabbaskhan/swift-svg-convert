import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/use-cms-data";

/**
 * Dynamically applies admin dashboard settings to the document head:
 * - Document title from default_meta_title or site_name
 * - Meta description from default_meta_description
 * - Favicon from site_favicon
 * - Google Analytics script from google_analytics_id
 * - Google Search Console verification from google_search_console
 */
export function useDynamicHead() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    // Document title
    const title = settings.default_meta_title || settings.site_name;
    if (title) document.title = title;

    // Meta description
    const desc = settings.default_meta_description || settings.site_description;
    if (desc) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
      meta.content = desc;
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

    // Google Analytics
    if (settings.google_analytics_id && settings.google_analytics_id.startsWith("G-")) {
      const gaId = settings.google_analytics_id;
      if (!document.querySelector(`script[src*="${gaId}"]`)) {
        const script1 = document.createElement("script");
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script1);

        const script2 = document.createElement("script");
        script2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
        document.head.appendChild(script2);
      }
    }

    // OG meta tags
    if (settings.site_name) {
      let ogSiteName = document.querySelector('meta[property="og:site_name"]') as HTMLMetaElement;
      if (!ogSiteName) { ogSiteName = document.createElement("meta"); ogSiteName.setAttribute("property", "og:site_name"); document.head.appendChild(ogSiteName); }
      ogSiteName.content = settings.site_name;
    }
  }, [settings]);

  return settings;
}

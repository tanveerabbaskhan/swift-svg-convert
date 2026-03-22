import PublicPageLayout from "@/components/PublicPageLayout";
import { usePages } from "@/hooks/use-cms-data";

export default function PrivacyPage() {
  const { data: pages } = usePages();
  const page = pages?.find(p => p.slug === "/privacy");

  return (
    <PublicPageLayout>
      <div className="container max-w-3xl py-16 px-4 sm:px-6 animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">{page?.title || "Privacy Policy"}</h1>
        {page?.content ? (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          <div className="prose prose-sm max-w-none">
            <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
            <h2>Data Collection</h2>
            <p>PNGTOSVG processes all images locally in your browser. We do not upload, store, or transmit your files to any server. Your images never leave your device.</p>
            <h2>Analytics</h2>
            <p>We may collect anonymous usage statistics (page views, conversion counts) to improve our service. No personally identifiable information is collected.</p>
            <h2>Cookies</h2>
            <p>We use essential cookies only to ensure the website functions correctly. No tracking cookies are used.</p>
            <h2>Contact</h2>
            <p>If you have questions about this policy, please <a href="/contact">contact us</a>.</p>
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}

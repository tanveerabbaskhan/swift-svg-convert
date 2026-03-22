import PublicPageLayout from "@/components/PublicPageLayout";
import { usePages } from "@/hooks/use-cms-data";

export default function AboutPage() {
  const { data: pages } = usePages();
  const page = pages?.find(p => p.slug === "/about");

  return (
    <PublicPageLayout>
      <div className="container max-w-3xl py-16 px-4 sm:px-6 animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">{page?.title || "About Us"}</h1>
        {page?.content ? (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          <div className="prose prose-sm max-w-none">
            <p>PNGTOSVG is a free, privacy-focused tool that converts PNG images to scalable SVG vector graphics directly in your browser. No uploads, no servers — your files never leave your device.</p>
            <h2>Our Mission</h2>
            <p>We believe design tools should be accessible, fast, and private. Our converter uses advanced client-side algorithms to produce clean vector output without compromising your data.</p>
            <h2>How It Works</h2>
            <p>Our engine analyzes your PNG image pixel-by-pixel, performs color quantization, and generates optimized SVG paths. The entire process happens in your browser using HTML5 Canvas and Web Workers.</p>
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}

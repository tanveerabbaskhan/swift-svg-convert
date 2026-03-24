import PublicPageLayout from "@/components/PublicPageLayout";
import { useBlogPosts } from "@/hooks/use-cms-data";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Calendar, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import "@/styles/blog-content.css";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: posts, isLoading } = useBlogPosts();

  const post = posts?.find((p: any) => p.slug === slug && p.status === "published");

  // Debug: Log the post data to see what meta fields are available
  useEffect(() => {
    if (post) {
      console.log('Post data:', post);
      console.log('Meta title:', (post as any).meta_title);
      console.log('Meta description:', (post as any).meta_description);
      console.log('Title:', post.title);
      console.log('Excerpt:', (post as any).excerpt);
    }
  }, [post]);

  // Set document title and meta tags when post loads
  useEffect(() => {
    if (post) {
      // Small delay to ensure this runs after useDynamicHead
      const timeout = setTimeout(() => {
        const title = (post as any).meta_title || `${post.title} — PNGTOSVG`;
        const description = (post as any).meta_description || (post as any).excerpt || "Convert PNG images to SVG vector graphics instantly. Free, fast, and secure.";
        const url = `https://pngtosvgconverter.com/blog/${post.slug}`;
        const image = (post as any).featured_image;
        
        console.log('Updating blog post SEO:', { title, description, url });
        
        // Update document title
        document.title = title;
        
        // Update or create meta tags
        updateMetaTag('description', description);
        updateMetaTag('og:title', title);
        updateMetaTag('og:description', description);
        updateMetaTag('og:url', url);
        updateMetaTag('og:type', 'article');
        updateMetaTag('og:site_name', 'PNGTOSVG');
        if (image) {
          updateMetaTag('og:image', image);
          updateMetaTag('twitter:image', image);
        }
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        
        // Update canonical URL
        updateCanonicalTag(url);
        
        console.log('Blog post SEO updated successfully');
      }, 100);
      
      return () => clearTimeout(timeout);
    }
    return () => { 
      document.title = "Free PNG to SVG Converter Online — No Signup, No Watermark";
      // Reset canonical to homepage
      updateCanonicalTag('https://pngtosvgconverter.com/');
    };
  }, [post]);

  // Helper functions to update meta tags
  const updateMetaTag = (name: string, content: string) => {
    let tag = document.querySelector(`meta[name="${name}"]`) || 
               document.querySelector(`meta[property="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  const updateCanonicalTag = (href: string) => {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', href);
  };

  if (isLoading) {
    return (
      <PublicPageLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </PublicPageLayout>
    );
  }

  if (!post) {
    return (
      <PublicPageLayout>
        <div className="container max-w-3xl py-20 px-4 text-center animate-fade-up">
          <h1 className="text-3xl font-bold mb-3">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist or hasn't been published yet.</p>
          <Button onClick={() => navigate("/blog")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
          </Button>
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      <article className="container max-w-3xl py-12 sm:py-16 px-4 sm:px-6 animate-fade-up">
        {/* Back link */}
        <a
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
        </a>

        {/* Featured image */}
        {(post as any).featured_image && (
          <img
            src={(post as any).featured_image}
            alt={post.title}
            className="w-full h-auto max-h-[400px] object-cover rounded-2xl mb-8"
          />
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          {(post as any).categories?.name && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Tag className="h-3 w-3" /> {(post as any).categories.name}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 leading-tight">{post.title}</h1>

        {/* Excerpt */}
        {(post as any).excerpt && (
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed border-l-4 border-primary/30 pl-4 italic">
            {(post as any).excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />
      </article>
    </PublicPageLayout>
  );
}

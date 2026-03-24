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
      console.log('=== BLOG POST DEBUG ===');
      console.log('Full post object:', post);
      console.log('Post keys:', Object.keys(post));
      console.log('Meta title:', (post as any).meta_title);
      console.log('Meta description:', (post as any).meta_description);
      console.log('Title:', post.title);
      console.log('Excerpt:', (post as any).excerpt);
      console.log('Slug:', post.slug);
      console.log('Created at:', post.created_at);
      console.log('========================');
    }
  }, [post]);

  // Set document title and meta tags when post loads
  useEffect(() => {
    if (post) {
      // Use requestAnimationFrame to ensure this runs after all other head updates
      const updateSEO = () => {
        const title = (post as any).meta_title || `${post.title} — PNGTOSVG`;
        const description = (post as any).meta_description || (post as any).excerpt || "Convert PNG images to SVG vector graphics instantly. Free, fast, and secure.";
        const url = `https://pngtosvgconverter.com/blog/${post.slug}`;
        const image = (post as any).featured_image;
        
        console.log('Updating blog post SEO:', { 
          title, 
          description, 
          url,
          metaTitle: (post as any).meta_title,
          metaDescription: (post as any).meta_description,
          postTitle: post.title,
          excerpt: (post as any).excerpt
        });
        
        // Update document title
        document.title = title;
        
        // Update or create meta tags with higher priority
        updateMetaTag('description', description);
        updateMetaTag('og:title', title);
        updateMetaTag('og:description', description);
        updateMetaTag('og:url', url);
        updateMetaTag('og:type', 'article');
        updateMetaTag('og:site_name', 'PNGTOSVG');
        updateMetaTag('og:image', image || 'https://pngtosvgconverter.com/og-image.jpg');
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', image || 'https://pngtosvgconverter.com/og-image.jpg');
        
        // Update canonical URL
        updateCanonicalTag(url);
        
        // Also set article structured data
        updateStructuredData(title, description, url, post.created_at, image);
        
        console.log('Blog post SEO updated successfully');
      };

      // Multiple attempts to ensure it overrides any other head updates
      requestAnimationFrame(updateSEO);
      const timeout1 = setTimeout(updateSEO, 100);
      const timeout2 = setTimeout(updateSEO, 500);
      
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    }
    return () => { 
      document.title = "Free PNG to SVG Converter Online — No Signup, No Watermark";
      updateCanonicalTag('https://pngtosvgconverter.com/');
    };
  }, [post]);

  // Helper functions to update meta tags
  const updateMetaTag = (name: string, content: string) => {
    let tag = document.querySelector(`meta[name="${name}"]`) || 
               document.querySelector(`meta[property="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name', name);
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

  const updateStructuredData = (title: string, description: string, url: string, date: string, image?: string) => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-structured-data="blog-post"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create new structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "url": url,
      "datePublished": date,
      "dateModified": date,
      "author": {
        "@type": "Organization",
        "name": "PNGTOSVG"
      },
      "publisher": {
        "@type": "Organization",
        "name": "PNGTOSVG",
        "url": "https://pngtosvgconverter.com"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      }
    };

    if (image) {
      structuredData.image = image;
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'blog-post');
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);
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
      <article className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-background to-muted/20 border-b">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <span>/</span>
              <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
              <span>/</span>
              <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{post.title}</span>
            </nav>

            {/* Featured Image */}
            {(post as any).featured_image && (
              <div className="mb-8 -mx-4 sm:mx-0">
                <img
                  src={(post as any).featured_image}
                  alt={post.title}
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
                />
              </div>
            )}

            {/* Title Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight text-foreground">
                {post.title}
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.created_at}>
                    {new Date(post.created_at).toLocaleDateString("en-US", { 
                      year: "numeric", 
                      month: "long", 
                      day: "numeric" 
                    })}
                  </time>
                </div>
                {(post as any).categories?.name && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      <Tag className="h-3.5 w-3.5" />
                      {(post as any).categories.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Excerpt */}
            {(post as any).excerpt && (
              <div className="max-w-3xl mx-auto mb-8">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-center italic border-l-4 border-primary/30 pl-6 py-2">
                  {(post as any).excerpt}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto">
            {/* Table of Contents - for long posts */}
            {(post as any).content && (post as any).content.length > 2000 && (
              <div className="bg-muted/30 rounded-xl p-6 mb-12 border">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Table of Contents</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {/* This would need to be generated from headings in the content */}
                  <p className="text-sm">Table of contents will be automatically generated from headings in your content.</p>
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg prose-headings:font-bold prose-headings:tracking-tight max-w-none">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
              />
            </div>

            {/* Article Footer */}
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Published on {new Date(post.created_at).toLocaleDateString("en-US", { 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </div>
                <Button 
                  onClick={() => navigate("/blog")} 
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Blog
                </Button>
              </div>
            </div>

            {/* Related Posts Section */}
            <div className="mt-16 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold mb-8 text-foreground">Related Articles</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* This would show related blog posts */}
                <div className="bg-muted/30 rounded-xl p-6 text-center text-muted-foreground">
                  <p className="text-sm">Related articles will appear here based on category and tags.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </PublicPageLayout>
  );
}

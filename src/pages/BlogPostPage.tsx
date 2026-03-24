import PublicPageLayout from "@/components/PublicPageLayout";
import { useBlogPosts } from "@/hooks/use-cms-data";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, Calendar, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import "@/styles/blog-content.css";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: posts, isLoading, error } = useBlogPosts();

  // Debug logging
  console.log('BlogPostPage - slug:', slug);
  console.log('BlogPostPage - posts:', posts);
  console.log('BlogPostPage - isLoading:', isLoading);
  console.log('BlogPostPage - error:', error);

  // Additional debug for slugs
  if (posts && posts.length > 0) {
    console.log('Available slugs:', posts.map(p => ({ slug: p.slug, title: p.title, status: p.status })));
  }

  const post = posts?.find((p: any) => p.slug === slug && p.status === "published");

  console.log('BlogPostPage - found post:', post);

  // Fallback: try to find post by slug regardless of status
  const anyPost = posts?.find((p: any) => p.slug === slug);
  console.log('BlogPostPage - found any post (including draft):', anyPost);

  // If no post found with exact match, try case-insensitive match
  const caseInsensitivePost = posts?.find((p: any) => p.slug?.toLowerCase() === slug?.toLowerCase());
  console.log('BlogPostPage - case-insensitive match:', caseInsensitivePost);

  // Use the best match
  const finalPost = post || anyPost || caseInsensitivePost;

  // Debug: Log the post data to see what meta fields are available
  useEffect(() => {
    if (finalPost) {
      console.log('=== BLOG POST DEBUG ===');
      console.log('Full post object:', finalPost);
      console.log('Post keys:', Object.keys(finalPost));
      console.log('Meta title:', (finalPost as any).meta_title);
      console.log('Meta description:', (finalPost as any).meta_description);
      console.log('Title:', finalPost.title);
      console.log('Excerpt:', (finalPost as any).excerpt);
      console.log('Slug:', finalPost.slug);
      console.log('Created at:', finalPost.created_at);
      console.log('========================');
    }
  }, [finalPost]);

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

  // Set document title and meta tags when post loads
  useEffect(() => {
    if (finalPost) {
      // Use requestAnimationFrame to ensure this runs after all other head updates
      const updateSEO = () => {
        const title = (finalPost as any).meta_title || `${finalPost.title} — PNGTOSVG`;
        const description = (finalPost as any).meta_description || (finalPost as any).excerpt || "Convert PNG images to SVG vector graphics instantly. Free, fast, and secure.";
        const url = `https://pngtosvgconverter.com/blog/${finalPost.slug}`;
        const image = (finalPost as any).featured_image;
        
        console.log('Updating blog post SEO:', { 
          title, 
          description, 
          url,
          metaTitle: (finalPost as any).meta_title,
          metaDescription: (finalPost as any).meta_description,
          postTitle: finalPost.title,
          excerpt: (finalPost as any).excerpt
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
        updateStructuredData(title, description, url, finalPost.created_at, image);
        
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
  }, [finalPost]);

  const updateStructuredData = (title: string, description: string, url: string, date: string, image?: string) => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-structured-data="blog-post"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create new structured data
    const structuredData: any = {
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

  if (error) {
    return (
      <PublicPageLayout>
        <div className="container max-w-3xl py-20 px-4 text-center animate-fade-up">
          <h1 className="text-3xl font-bold mb-3">Error Loading Post</h1>
          <p className="text-muted-foreground mb-6">There was an error loading the blog post. Please try again later.</p>
          <Button onClick={() => navigate("/blog")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
          </Button>
        </div>
      </PublicPageLayout>
    );
  }

  if (!finalPost) {
    return (
      <PublicPageLayout>
        <div className="container max-w-3xl py-20 px-4 text-center animate-fade-up">
          <h1 className="text-3xl font-bold mb-3">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The blog post "{slug}" doesn't exist or hasn't been published yet.
            {posts && posts.length > 0 && (
              <span className="block mt-2 text-sm">
                Available posts: {posts.map(p => p.slug).join(', ')}
              </span>
            )}
          </p>
          <Button onClick={() => navigate("/blog")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
          </Button>
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <PublicPageLayout>
        <article className="min-h-screen bg-background">
          {/* Hero Section */}
          <div className="bg-gradient-to-b from-background via-muted/10 to-background border-b border-border">
            <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 sm:mb-8">
                <Link to="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
                <span className="text-border">/</span>
                <Link to="/blog" className="hover:text-foreground transition-colors font-medium">Blog</Link>
                <span className="text-border">/</span>
                <span className="text-foreground font-medium truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">{finalPost.title}</span>
              </nav>

              {/* Featured Image */}
              {(finalPost as any).featured_image && (
                <div className="mb-8 sm:mb-12 -mx-4 sm:mx-0">
                  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl">
                    <img
                      src={(finalPost as any).featured_image}
                      alt={finalPost.title}
                      className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                  </div>
                </div>
              )}

              {/* Title Section */}
              <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6 sm:mb-8 leading-tight sm:leading-tight md:leading-tight text-foreground">
                  {finalPost.title}
                </h1>
                
                {/* Meta Information */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base text-muted-foreground">
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-full">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    <time dateTime={finalPost.created_at} className="font-medium">
                      {new Date(finalPost.created_at).toLocaleDateString("en-US", { 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })}
                    </time>
                  </div>
                  {(finalPost as any).categories?.name && (
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-full">
                      <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="text-primary font-medium">
                        {(finalPost as any).categories.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Excerpt */}
              {(finalPost as any).excerpt && (
                <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
                  <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-l-4 border-primary rounded-r-xl p-6 sm:p-8">
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed sm:leading-relaxed md:leading-relaxed text-center font-medium">
                      {(finalPost as any).excerpt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="max-w-4xl mx-auto">
              {/* Article Content - Justified and Enhanced */}
              <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none">
                <div
                  className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none text-foreground leading-relaxed sm:leading-relaxed lg:leading-relaxed"
                  style={{ textAlign: 'justify', textJustify: 'inter-word' }}
                  dangerouslySetInnerHTML={{ __html: finalPost.content || "" }}
                />
              </div>

              {/* Article Footer */}
              <div className="mt-12 sm:mt-16 lg:mt-20 pt-8 sm:pt-10 border-t border-border">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                  <div className="text-sm sm:text-base text-muted-foreground text-center sm:text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-primary">📝</span>
                      <span>Published</span>
                    </div>
                    <time dateTime={finalPost.created_at} className="font-medium">
                      {new Date(finalPost.created_at).toLocaleDateString("en-US", { 
                        weekday: 'long',
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      })}
                    </time>
                  </div>
                  <Button 
                    onClick={() => navigate("/blog")} 
                    variant="outline"
                    size="lg"
                    className="gap-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto"
                  >
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    Back to Blog
                  </Button>
                </div>
              </div>

              {/* Share Section */}
              <div className="mt-12 sm:mt-16 lg:mt-20 pt-8 sm:pt-10 border-t border-border">
                <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-foreground text-center">Share this article</h3>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <span>📧</span> Email
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <span>🔗</span> Copy Link
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <span>📱</span> WhatsApp
                  </Button>
                </div>
              </div>

              {/* Related Posts Section */}
              <div className="mt-16 sm:mt-20 lg:mt-24 pt-8 sm:pt-10 border-t border-border">
                <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-foreground text-center">Related Articles</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* Related posts placeholder */}
                  <div className="bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl p-6 sm:p-8 text-center border border-border hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary text-xl">📄</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">More Articles Coming Soon</h3>
                    <p className="text-sm text-muted-foreground">Related articles will appear here based on category and tags.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </PublicPageLayout>
    </ErrorBoundary>
  );
}

import PublicPageLayout from "@/components/PublicPageLayout";
import { useBlogPosts } from "@/hooks/use-cms-data";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Calendar, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: posts, isLoading } = useBlogPosts();

  const post = posts?.find((p: any) => p.slug === slug && p.status === "published");

  // Set document title when post loads
  useEffect(() => {
    if (post) {
      document.title = (post as any).meta_title || post.title + " — PNGTOSVG";
    }
    return () => { document.title = "Free PNG to SVG Converter Online — No Signup, No Watermark"; };
  }, [post]);

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
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-4 prose-h1:leading-tight
            prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3 prose-h2:leading-tight
            prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2 prose-h3:leading-tight
            prose-p:leading-relaxed prose-p:text-foreground prose-p:mb-4
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-md
            prose-blockquote:border-l-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
            prose-pre:bg-muted prose-pre:rounded-xl prose-pre:p-4 prose-pre:font-mono prose-pre:text-sm prose-pre:overflow-x-auto
            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
            prose-li:mb-2 prose-li:text-foreground
            prose-strong:text-foreground prose-strong:font-semibold
            dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />
      </article>
    </PublicPageLayout>
  );
}

import PublicPageLayout from "@/components/PublicPageLayout";
import { useBlogPosts } from "@/hooks/use-cms-data";
import { Loader2, Calendar, ArrowRight } from "lucide-react";

export default function BlogListingPage() {
  const { data: posts, isLoading } = useBlogPosts();
  const publishedPosts = posts?.filter((p: any) => p.status === "published") || [];

  return (
    <PublicPageLayout>
      <div className="container max-w-4xl py-16 px-4 sm:px-6 animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Blog</h1>
        <p className="text-muted-foreground mb-10">Tips, tutorials, and updates from the PNGTOSVG team.</p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : publishedPosts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm mt-1">Check back soon for new content.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {publishedPosts.map((post: any) => (
              <article
                key={post.id}
                className="group rounded-2xl border bg-card p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3.5 w-3.5" />
                  <time>{new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
                  {post.categories?.name && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{post.categories.name}</span>
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  <a href={`/blog/${post.slug}`}>{post.title}</a>
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                )}
                <a
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </article>
            ))}
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}

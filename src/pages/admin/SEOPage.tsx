import { Search, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const seoPages = [
  { url: "/", title: "Home - PNGTOSVG", score: 94, issues: 0, status: "good" },
  { url: "/about", title: "About Us", score: 87, issues: 2, status: "warning" },
  { url: "/blog/svg-matters", title: "Why SVG Matters", score: 91, issues: 1, status: "good" },
  { url: "/privacy", title: "Privacy Policy", score: 72, issues: 4, status: "warning" },
  { url: "/contact", title: "Contact", score: 45, issues: 8, status: "error" },
];

const tips = [
  "Add meta descriptions to all pages",
  "Ensure all images have alt attributes",
  "Optimize Core Web Vitals scores",
  "Add structured data (JSON-LD) to key pages",
  "Create an XML sitemap",
];

export default function SEOPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SEO</h1>
          <p className="text-muted-foreground mt-1">Monitor and improve search engine optimization.</p>
        </div>
        <Button><RefreshCw className="h-4 w-4 mr-2" /> Run Audit</Button>
      </div>

      {/* Overview */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-5 shadow-sm animate-fade-up stagger-1">
          <p className="text-sm text-muted-foreground mb-1">Average Score</p>
          <p className="text-3xl font-bold tabular-nums text-gradient">78</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm animate-fade-up stagger-2">
          <p className="text-sm text-muted-foreground mb-1">Total Issues</p>
          <p className="text-3xl font-bold tabular-nums">15</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm animate-fade-up stagger-3">
          <p className="text-sm text-muted-foreground mb-1">Pages Indexed</p>
          <p className="text-3xl font-bold tabular-nums">5</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Page Scores */}
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-up stagger-2">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-semibold">Page Scores</h2>
          </div>
          <div className="divide-y">
            {seoPages.map((p) => (
              <div key={p.url} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                {p.status === "good" ? <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> :
                 p.status === "warning" ? <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" /> :
                 <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.url}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold tabular-nums">{p.score}</p>
                  <p className="text-xs text-muted-foreground">{p.issues} issues</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-3">
          <h2 className="font-semibold mb-4">Recommendations</h2>
          <ul className="space-y-3">
            {tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Search className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

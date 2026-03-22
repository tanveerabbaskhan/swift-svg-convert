import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Save, Globe, FileText, Code, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePages, useBlogPosts, useSiteSettings, useUpdateSiteSetting, useUpdatePage, useUpdateBlogPost } from "@/hooks/use-cms-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";

function scorePageSEO(page: { meta_title?: string | null; meta_description?: string | null; title: string; content?: string | null }) {
  let score = 0;
  const issues: string[] = [];
  if (page.meta_title && page.meta_title.length > 0) { score += 30; if (page.meta_title.length > 60) issues.push("Meta title too long (>60 chars)"); }
  else { issues.push("Missing meta title"); }
  if (page.meta_description && page.meta_description.length > 0) { score += 30; if (page.meta_description.length > 160) issues.push("Meta description too long (>160 chars)"); }
  else { issues.push("Missing meta description"); }
  if (page.content && page.content.length > 100) score += 20;
  else issues.push("Content too short");
  if (page.title.length > 0) score += 20;
  return { score: Math.min(score, 100), issues };
}

export default function SEOPage() {
  const { data: pages, isLoading: pagesLoading } = usePages();
  const { data: posts, isLoading: postsLoading } = useBlogPosts();
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();

  const [seoSettings, setSeoSettings] = useState({
    default_meta_title: "",
    default_meta_description: "",
    robots_txt: "",
    google_analytics_id: "",
    google_search_console: "",
    social_twitter: "",
    social_facebook: "",
  });

  useEffect(() => {
    if (settings) {
      setSeoSettings({
        default_meta_title: settings.default_meta_title || "",
        default_meta_description: settings.default_meta_description || "",
        robots_txt: settings.robots_txt || "",
        google_analytics_id: settings.google_analytics_id || "",
        google_search_console: settings.google_search_console || "",
        social_twitter: settings.social_twitter || "",
        social_facebook: settings.social_facebook || "",
      });
    }
  }, [settings]);

  const isLoading = pagesLoading || postsLoading || settingsLoading;

  const allItems = [
    ...(pages?.map(p => ({ ...p, type: "page" as const })) || []),
    ...(posts?.map(p => ({ ...p, type: "post" as const })) || []),
  ];

  const scored = allItems.map(item => {
    const { score, issues } = scorePageSEO(item);
    return { ...item, score, issues, status: score >= 80 ? "good" : score >= 50 ? "warning" : "error" };
  }).sort((a, b) => a.score - b.score);

  const avgScore = scored.length ? Math.round(scored.reduce((s, i) => s + i.score, 0) / scored.length) : 0;
  const totalIssues = scored.reduce((s, i) => s + i.issues.length, 0);

  const handleSaveSettings = () => {
    Object.entries(seoSettings).forEach(([key, value]) => {
      updateSetting.mutate({ key, value });
    });
    toast.success("SEO settings saved");
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SEO</h1>
          <p className="text-muted-foreground mt-1">Monitor and improve search engine optimization.</p>
        </div>
      </div>

      {/* Overview */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {isLoading ? [1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />) : (
          <>
            <div className="rounded-xl border bg-card p-5 shadow-sm animate-fade-up stagger-1">
              <p className="text-sm text-muted-foreground mb-1">Average Score</p>
              <p className="text-3xl font-bold tabular-nums text-gradient">{avgScore}</p>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm animate-fade-up stagger-2">
              <p className="text-sm text-muted-foreground mb-1">Total Issues</p>
              <p className="text-3xl font-bold tabular-nums">{totalIssues}</p>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm animate-fade-up stagger-3">
              <p className="text-sm text-muted-foreground mb-1">Pages Analyzed</p>
              <p className="text-3xl font-bold tabular-nums">{scored.length}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Page Scores */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-up stagger-2">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="font-semibold">Page & Post SEO Scores</h2>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : scored.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No pages or posts to analyze</p>
          ) : (
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {scored.map((p) => (
                <div key={p.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-4">
                    {p.status === "good" ? <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> :
                     p.status === "warning" ? <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" /> :
                     <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.type === "page" ? p.slug : `/blog/${p.slug}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold tabular-nums">{p.score}</p>
                      <p className="text-xs text-muted-foreground">{p.issues.length} issues</p>
                    </div>
                  </div>
                  {p.issues.length > 0 && (
                    <ul className="mt-2 ml-9 space-y-1">
                      {p.issues.map((issue, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-destructive" /> {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global SEO Settings */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-3">
            <div className="flex items-center gap-3 mb-5">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Global SEO Defaults</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Default Meta Title</Label>
                <Input value={seoSettings.default_meta_title} onChange={(e) => setSeoSettings(s => ({ ...s, default_meta_title: e.target.value }))} className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">{seoSettings.default_meta_title.length}/60 characters</p>
              </div>
              <div>
                <Label>Default Meta Description</Label>
                <Textarea value={seoSettings.default_meta_description} onChange={(e) => setSeoSettings(s => ({ ...s, default_meta_description: e.target.value }))} className="mt-1.5" rows={2} />
                <p className="text-xs text-muted-foreground mt-1">{seoSettings.default_meta_description.length}/160 characters</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-4">
            <div className="flex items-center gap-3 mb-5">
              <Code className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Verification & Analytics</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Google Analytics ID</Label>
                <Input value={seoSettings.google_analytics_id} onChange={(e) => setSeoSettings(s => ({ ...s, google_analytics_id: e.target.value }))} className="mt-1.5" placeholder="G-XXXXXXXXXX" />
              </div>
              <div>
                <Label>Google Search Console</Label>
                <Input value={seoSettings.google_search_console} onChange={(e) => setSeoSettings(s => ({ ...s, google_search_console: e.target.value }))} className="mt-1.5" placeholder="Verification meta tag content" />
              </div>
              <div>
                <Label>Robots.txt</Label>
                <Textarea value={seoSettings.robots_txt} onChange={(e) => setSeoSettings(s => ({ ...s, robots_txt: e.target.value }))} className="mt-1.5 font-mono text-xs" rows={4} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-4">
            <div className="flex items-center gap-3 mb-5">
              <Share2 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Social Profiles</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Twitter / X URL</Label>
                <Input value={seoSettings.social_twitter} onChange={(e) => setSeoSettings(s => ({ ...s, social_twitter: e.target.value }))} className="mt-1.5" placeholder="https://x.com/yourprofile" />
              </div>
              <div>
                <Label>Facebook URL</Label>
                <Input value={seoSettings.social_facebook} onChange={(e) => setSeoSettings(s => ({ ...s, social_facebook: e.target.value }))} className="mt-1.5" placeholder="https://facebook.com/yourpage" />
              </div>
            </div>
          </div>

          <Button variant="hero" size="lg" onClick={handleSaveSettings} disabled={updateSetting.isPending}>
            <Save className="h-4 w-4 mr-2" /> Save SEO Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

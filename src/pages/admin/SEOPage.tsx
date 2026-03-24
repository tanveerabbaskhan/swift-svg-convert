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
  const goodPages = scored.filter(p => p.status === "good").length;
  const warningPages = scored.filter(p => p.status === "warning").length;
  const errorPages = scored.filter(p => p.status === "error").length;

  const handleSaveSettings = () => {
    Object.entries(seoSettings).forEach(([key, value]) => {
      updateSetting.mutate({ key, value });
    });
    toast.success("SEO settings saved");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-background via-muted/10 to-background border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                SEO Management
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Monitor, analyze, and improve your website's search engine optimization with comprehensive SEO tools and insights.
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {isLoading ? (
              [1,2,3,4].map(i => <Skeleton key={i} className="h-32 sm:h-40 rounded-2xl" />)
            ) : (
              <>
                <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">{avgScore}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${avgScore >= 80 ? 'bg-success' : avgScore >= 50 ? 'bg-warning' : 'bg-destructive'} animate-pulse`}></div>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2">Average Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{avgScore}/100</p>
                  <div className="mt-3 w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        avgScore >= 80 ? 'bg-success' : avgScore >= 50 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${avgScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-success/5 via-success/10 to-success/5 border border-success/20 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                    <span className="text-2xl sm:text-3xl font-bold text-success">{goodPages}</span>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2">Optimized Pages</p>
                  <div className="text-xs text-success/80">SEO score ≥ 80</div>
                </div>

                <div className="bg-gradient-to-br from-warning/5 via-warning/10 to-warning/5 border border-warning/20 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                    <span className="text-2xl sm:text-3xl font-bold text-warning">{warningPages}</span>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2">Needs Improvement</p>
                  <div className="text-xs text-warning/80">SEO score 50-79</div>
                </div>

                <div className="bg-gradient-to-br from-destructive/5 via-destructive/10 to-destructive/5 border border-destructive/20 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <XCircle className="h-6 w-6 text-destructive" />
                    <span className="text-2xl sm:text-3xl font-bold text-destructive">{totalIssues}</span>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-2">Total Issues</p>
                  <div className="text-xs text-destructive/80">Critical problems found</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Page Scores - Takes 2 columns on XL */}
          <div className="xl:col-span-2">
            <div className="bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Page & Post SEO Analysis</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{scored.length} items</span>
                    <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin-slow" />
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="p-6 sm:p-8 space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : scored.length === 0 ? (
                <div className="p-12 sm:p-16 text-center">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Content Found</h3>
                  <p className="text-sm text-muted-foreground">No pages or posts available to analyze.</p>
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[600px] sm:max-h-[700px] overflow-y-auto">
                  {scored.map((p, index) => (
                    <div key={p.id} className="p-4 sm:p-6 hover:bg-muted/10 transition-all duration-200 border-l-4 border-transparent hover:border-primary/30">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {p.status === "good" ? (
                            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            </div>
                          ) : p.status === "warning" ? (
                            <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                              <XCircle className="h-4 w-4 text-destructive" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base sm:text-lg text-foreground truncate mb-1">{p.title}</h3>
                              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
                                  {p.type === "page" ? <FileText className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                                  {p.type === "page" ? "Page" : "Blog Post"}
                                </span>
                                <code className="px-2 py-1 bg-muted/50 rounded text-xs">
                                  {p.type === "page" ? p.slug : `/blog/${p.slug}`}
                                </code>
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0 text-right">
                              <div className={`text-2xl sm:text-3xl font-bold tabular-nums ${
                                p.status === "good" ? "text-success" : 
                                p.status === "warning" ? "text-warning" : "text-destructive"
                              }`}>
                                {p.score}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {p.issues.length} issue{p.issues.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          
                          {p.issues.length > 0 && (
                            <div className="mt-3 p-3 bg-muted/20 rounded-lg border border-border/50">
                              <p className="text-xs font-medium text-foreground mb-2">Issues to fix:</p>
                              <ul className="space-y-1">
                                {p.issues.map((issue, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0"></span>
                                    <span className="leading-relaxed">{issue}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Settings Sidebar - Takes 1 column on XL */}
          <div className="xl:col-span-1 space-y-6 sm:space-y-8">
            {/* Global SEO Settings */}
            <div className="bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Global SEO Settings</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <Label htmlFor="meta_title" className="text-sm font-medium text-foreground">Default Meta Title</Label>
                  <Input 
                    id="meta_title"
                    value={seoSettings.default_meta_title} 
                    onChange={(e) => setSeoSettings(s => ({ ...s, default_meta_title: e.target.value }))} 
                    className="mt-2 h-11" 
                    placeholder="Enter default meta title"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {seoSettings.default_meta_title.length}/60 characters
                    </p>
                    <div className={`text-xs ${
                      seoSettings.default_meta_title.length > 60 ? 'text-destructive' : 
                      seoSettings.default_meta_title.length > 50 ? 'text-warning' : 'text-success'
                    }`}>
                      {seoSettings.default_meta_title.length > 60 ? 'Too long' : 
                       seoSettings.default_meta_title.length > 50 ? 'Getting long' : 'Good length'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="meta_description" className="text-sm font-medium text-foreground">Default Meta Description</Label>
                  <Textarea 
                    id="meta_description"
                    value={seoSettings.default_meta_description} 
                    onChange={(e) => setSeoSettings(s => ({ ...s, default_meta_description: e.target.value }))} 
                    className="mt-2 min-h-[80px] resize-none" 
                    placeholder="Enter default meta description"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {seoSettings.default_meta_description.length}/160 characters
                    </p>
                    <div className={`text-xs ${
                      seoSettings.default_meta_description.length > 160 ? 'text-destructive' : 
                      seoSettings.default_meta_description.length > 150 ? 'text-warning' : 'text-success'
                    }`}>
                      {seoSettings.default_meta_description.length > 160 ? 'Too long' : 
                       seoSettings.default_meta_description.length > 150 ? 'Getting long' : 'Good length'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification & Analytics */}
            <div className="bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Analytics & Verification</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <Label htmlFor="analytics" className="text-sm font-medium text-foreground">Google Analytics ID</Label>
                  <Input 
                    id="analytics"
                    value={seoSettings.google_analytics_id} 
                    onChange={(e) => setSeoSettings(s => ({ ...s, google_analytics_id: e.target.value }))} 
                    className="mt-2 h-11" 
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Enter your Google Analytics measurement ID</p>
                </div>
                
                <div>
                  <Label htmlFor="gsc" className="text-sm font-medium text-foreground">Google Search Console</Label>
                  <Input 
                    id="gsc"
                    value={seoSettings.google_search_console} 
                    onChange={(e) => setSeoSettings(s => ({ ...s, google_search_console: e.target.value }))} 
                    className="mt-2 h-11" 
                    placeholder="Verification meta tag content"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Google site verification meta content</p>
                </div>
                
                <div>
                  <Label htmlFor="robots" className="text-sm font-medium text-foreground">Robots.txt</Label>
                  <Textarea 
                    id="robots"
                    value={seoSettings.robots_txt} 
                    onChange={(e) => setSeoSettings(s => ({ ...s, robots_txt: e.target.value }))} 
                    className="mt-2 min-h-[100px] resize-none font-mono text-xs" 
                    placeholder="User-agent: *&#10;Allow: /&#10;Sitemap: https://yoursite.com/sitemap.xml"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Custom robots.txt content for search engines</p>
                </div>
              </div>
            </div>

            {/* Social Profiles */}
            <div className="bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Share2 className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Social Profiles</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <Label htmlFor="twitter" className="text-sm font-medium text-foreground">Twitter / X URL</Label>
                  <Input 
                    id="twitter"
                    value={seoSettings.social_twitter} 
                    onChange={(e) => setSeoSettings(s => ({ ...s, social_twitter: e.target.value }))} 
                    className="mt-2 h-11" 
                    placeholder="https://x.com/yourprofile"
                  />
                </div>
                
                <div>
                  <Label htmlFor="facebook" className="text-sm font-medium text-foreground">Facebook URL</Label>
                  <Input 
                    id="facebook"
                    value={seoSettings.social_facebook} 
                    onChange={(e) => setSeoSettings(s => ({ ...s, social_facebook: e.target.value }))} 
                    className="mt-2 h-11" 
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              variant="default" 
              size="lg" 
              onClick={handleSaveSettings} 
              disabled={updateSetting.isPending}
              className="w-full h-12 text-base font-semibold gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {updateSetting.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save SEO Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

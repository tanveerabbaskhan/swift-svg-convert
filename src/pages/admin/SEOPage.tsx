import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Save, Globe, FileText, Code, Share2, Home, Trash2, Search, Eye, Zap, Shield, Target, TrendingUp, Users, Clock, Image, Link, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePages, useBlogPosts, useSiteSettings, useUpdateSiteSetting, useUpdatePage, useUpdateBlogPost } from "@/hooks/use-cms-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import SEOComplianceDashboard from "@/components/SEOComplianceDashboard";

// Advanced SEO scoring algorithm like Yoast
function scoreAdvancedSEO(page: { 
  meta_title?: string | null; 
  meta_description?: string | null; 
  title: string; 
  content?: string | null;
  slug?: string;
  featured_image?: string | null;
  meta_keywords?: string | null;
}) {
  let score = 0;
  const issues: string[] = [];
  const good: string[] = [];
  const warnings: string[] = [];

  // Title analysis (30 points)
  if (page.meta_title && page.meta_title.length > 0) {
    score += 15;
    if (page.meta_title.length >= 30 && page.meta_title.length <= 60) {
      score += 10;
      good.push("Meta title length is optimal (30-60 chars)");
    } else if (page.meta_title.length > 60) {
      warnings.push("Meta title is too long (>60 chars)");
      score += 5;
    } else {
      warnings.push("Meta title is short (<30 chars)");
      score += 7;
    }
    
    // Check if title contains keywords
    if (page.meta_title.toLowerCase().includes('png') || page.meta_title.toLowerCase().includes('svg')) {
      score += 5;
      good.push("Title contains relevant keywords");
    }
  } else {
    issues.push("Missing meta title");
  }

  // Description analysis (25 points)
  if (page.meta_description && page.meta_description.length > 0) {
    score += 12;
    if (page.meta_description.length >= 120 && page.meta_description.length <= 160) {
      score += 10;
      good.push("Meta description length is optimal (120-160 chars)");
    } else if (page.meta_description.length > 160) {
      warnings.push("Meta description is too long (>160 chars)");
      score += 6;
    } else if (page.meta_description.length < 120) {
      warnings.push("Meta description is short (<120 chars)");
      score += 8;
    }
    
    // Check if description contains keywords
    if (page.meta_description.toLowerCase().includes('png') || page.meta_description.toLowerCase().includes('svg')) {
      score += 3;
      good.push("Description contains relevant keywords");
    }
  } else {
    issues.push("Missing meta description");
  }

  // Content analysis (20 points)
  if (page.content && page.content.length > 0) {
    const wordCount = page.content.split(/\s+/).length;
    if (wordCount >= 300) {
      score += 15;
      good.push(`Content has good word count (${wordCount} words)`);
    } else if (wordCount >= 150) {
      score += 10;
      warnings.push(`Content could be longer (${wordCount} words)`);
    } else {
      score += 5;
      issues.push(`Content is too short (${wordCount} words)`);
    }

    // Check for keyword density
    const contentLower = page.content.toLowerCase();
    const keywordCount = (contentLower.match(/png|svg/g) || []).length;
    const keywordDensity = (keywordCount / wordCount) * 100;
    
    if (keywordDensity >= 1 && keywordDensity <= 3) {
      score += 5;
      good.push("Good keyword density (1-3%)");
    } else if (keywordDensity > 3) {
      warnings.push("Keyword density might be too high");
      score += 2;
    }
  } else {
    issues.push("Missing content");
  }

  // Image analysis (15 points)
  if (page.featured_image) {
    score += 10;
    good.push("Has featured image");
    // In a real implementation, you'd check if the image has alt text
    score += 5;
  } else {
    warnings.push("No featured image found");
  }

  // URL structure (10 points)
  if (page.slug) {
    if (page.slug.length <= 50 && !page.slug.includes('_')) {
      score += 10;
      good.push("URL structure is good");
    } else {
      warnings.push("URL could be optimized");
      score += 5;
    }
  }

  return { 
    score: Math.min(score, 100), 
    issues, 
    good, 
    warnings,
    readability: calculateReadability(page.content || ""),
    keywordDensity: calculateKeywordDensity(page.content || ""),
    wordCount: page.content ? page.content.split(/\s+/).length : 0
  };
}

function calculateReadability(content: string): number {
  if (!content) return 0;
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgCharsPerWord = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // Simplified Flesch Reading Ease score
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (avgCharsPerWord / 4.7));
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateKeywordDensity(content: string): number {
  if (!content) return 0;
  
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const keywords = content.toLowerCase().match(/png|svg/g) || [];
  
  return words.length > 0 ? Number(((keywords.length / words.length) * 100).toFixed(2)) : 0;
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
    bing_webmaster: "",
    pinterest_verify: "",
    facebook_domain: "",
    site_author: "",
    site_description: "",
    og_image: "",
    twitter_image: "",
    favicon: "",
    enable_sitemap: true,
    enable_rss: true,
    enable_amp: false,
    enable_structured_data: true,
    enable_social_meta: true,
    enable_analytics: true,
    enable_webmaster_tools: true,
    default_robots: "index, follow",
    title_separator: "—",
    home_title: "",
    home_description: "",
    enable_social_open_graph: true,
    enable_twitter_cards: true,
    enable_facebook_og: true,
    enable_json_ld: true,
    enable_breadcrumbs: true,
    enable_canonical_urls: true,
    enable_xml_sitemap: true,
    enable_rss_feed: true,
    social_image_width: "1200",
    social_image_height: "630",
    twitter_username: "",
    facebook_app_id: "",
    instagram_profile: "",
    linkedin_profile: "",
    youtube_channel: "",
    enable_local_seo: true,
    business_name: "",
    business_type: "OnlineService",
    business_phone: "",
    business_email: "",
    business_address: "",
    business_city: "",
    business_state: "",
    business_zip: "",
    business_country: "",
    business_lat: "",
    business_lng: "",
    business_hours: "",
    enable_tracking: true,
    tracking_anonymize_ip: true,
    tracking_ad_personalization: false,
    tracking_enhanced_ecommerce: false,
  });

  // Homepage meta settings
  const [homepageMeta, setHomepageMeta] = useState({
    meta_title: "",
    meta_description: "",
  });

  const [isClearingCache, setIsClearingCache] = useState(false);

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

      // Set homepage meta settings
      setHomepageMeta({
        meta_title: settings.homepage_meta_title || "",
        meta_description: settings.homepage_meta_description || "",
      });
    }
  }, [settings]);

  const handleHomepageMetaSave = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: "homepage_meta_title", value: homepageMeta.meta_title }),
        updateSetting.mutateAsync({ key: "homepage_meta_description", value: homepageMeta.meta_description }),
      ]);
      toast.success("Homepage meta settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save homepage meta settings");
    }
  };

  const handleCacheClear = async () => {
    setIsClearingCache(true);
    try {
      // Clear browser cache for the homepage
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Trigger a service worker update if available
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }

      toast.success("Cache cleared successfully! Homepage will update on next visit.");

      // Optionally reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      toast.error("Failed to clear cache");
    } finally {
      setIsClearingCache(false);
    }
  };

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

      {/* Homepage Meta Management & Cache Clear */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Homepage Meta Settings */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Homepage Meta Settings</CardTitle>
                  <CardDescription>Manage homepage SEO meta tags</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="homepage-title" className="text-sm font-medium">Meta Title</Label>
                <Input
                  id="homepage-title"
                  placeholder="Enter homepage meta title"
                  value={homepageMeta.meta_title}
                  onChange={(e) => setHomepageMeta(prev => ({ ...prev, meta_title: e.target.value }))}
                  className="border-border/50"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {homepageMeta.meta_title.length}/60 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="homepage-description" className="text-sm font-medium">Meta Description</Label>
                <Textarea
                  id="homepage-description"
                  placeholder="Enter homepage meta description"
                  value={homepageMeta.meta_description}
                  onChange={(e) => setHomepageMeta(prev => ({ ...prev, meta_description: e.target.value }))}
                  className="border-border/50 min-h-[100px]"
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  {homepageMeta.meta_description.length}/160 characters
                </p>
              </div>

              <Button 
                onClick={handleHomepageMetaSave}
                disabled={updateSetting.isPending}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {updateSetting.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Homepage Meta
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Cache Clear */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Cache Management</CardTitle>
                  <CardDescription>Clear website cache for updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">What cache clearing does:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Clears browser cache storage</li>
                    <li>• Removes localStorage data</li>
                    <li>• Clears sessionStorage</li>
                    <li>• Updates service workers</li>
                    <li>• Forces homepage content refresh</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> After clearing cache, the homepage will reflect your meta changes immediately for all users.
                  </p>
                </div>

                <Button 
                  onClick={handleCacheClear}
                  disabled={isClearingCache}
                  variant="outline"
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  {isClearingCache ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Clearing Cache...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Cache
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
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

      {/* Google SEO Compliance Dashboard */}
      <div className="mt-8">
        <SEOComplianceDashboard pageData={{
          title: homepageMeta.meta_title || settings?.site_name || "PNGTOSVG",
          meta_title: homepageMeta.meta_title,
          meta_description: homepageMeta.meta_description,
          content: settings?.site_description,
          slug: window.location.pathname,
          featured_image: settings?.og_image,
          type: 'page'
        }} />
      </div>
    </div>
  );
}

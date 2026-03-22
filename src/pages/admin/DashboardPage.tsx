import { ArrowUpRight, FileText, Eye, Users, PenTool, Plus, Search, UserPlus, Image as ImageIcon, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useDashboardStats, useConversions, useBlogPosts } from "@/hooks/use-cms-data";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const quickActions = [
  { label: "New Blog Post", icon: PenTool, path: "/admin/blog" },
  { label: "Create Page", icon: FileText, path: "/admin/pages" },
  { label: "SEO Audit", icon: Search, path: "/admin/seo" },
  { label: "User Invites", icon: UserPlus, path: "/admin/settings" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: conversions } = useConversions();
  const { data: posts } = useBlogPosts();
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [useRealData, setUseRealData] = useState(true);

  // Real-time conversion counter
  useEffect(() => {
    supabase.from("conversions").select("*", { count: "exact", head: true }).then(({ count }) => {
      setLiveCount(count || 0);
    });
    const channel = supabase.channel("dashboard-conversions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversions" }, () => {
        setLiveCount(prev => (prev ?? 0) + 1);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const displayCount = useRealData ? (liveCount ?? stats?.totalConversions ?? 0) : 12450;

  const statCards = [
    { label: "Images Vectorized", value: displayCount, icon: ImageIcon, live: true },
    { label: "Page Views", value: stats?.totalPageViews ?? 0, icon: Eye },
    { label: "Total Pages", value: stats?.totalPages ?? 0, icon: Users },
    { label: "Blog Posts", value: stats?.totalPosts ?? 0, icon: PenTool },
  ];

  const recentActivity = [
    ...(conversions?.slice(0, 3).map(c => ({
      action: "PNG converted",
      detail: c.file_name || "Unknown file",
      time: new Date(c.created_at).toLocaleDateString(),
    })) || []),
    ...(posts?.slice(0, 3).map(p => ({
      action: p.status === "published" ? "Post published" : "Post drafted",
      detail: `"${p.title}"`,
      time: new Date(p.updated_at).toLocaleDateString(),
    })) || []),
  ].slice(0, 6);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Data source toggle */}
      <div className="flex items-center gap-3 mb-6 rounded-lg border bg-card p-3 w-fit animate-fade-up">
        <Activity className="h-4 w-4 text-primary" />
        <Label htmlFor="real-data" className="text-sm cursor-pointer">Real-time data</Label>
        <Switch id="real-data" checked={useRealData} onCheckedChange={setUseRealData} />
        <span className="text-xs text-muted-foreground">{useRealData ? "Live" : "Demo"}</span>
        {useRealData && <div className="h-2 w-2 rounded-full bg-success animate-pulse" />}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((s, i) => (
          <div key={s.label} className={`rounded-xl border bg-card p-4 sm:p-5 shadow-sm animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm text-muted-foreground">{s.label}</span>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
            </div>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tabular-nums">{s.value.toLocaleString()}</span>
                {s.live && useRealData && <div className="h-2 w-2 rounded-full bg-success animate-pulse flex-shrink-0" />}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-4 sm:p-6 shadow-sm animate-fade-up stagger-2">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No activity yet. Start by creating a blog post or converting a PNG!</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm animate-fade-up stagger-3">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((a) => (
              <Button key={a.label} variant="outline" className="w-full justify-start" onClick={() => navigate(a.path)}>
                <a.icon className="h-4 w-4 mr-2" /> {a.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

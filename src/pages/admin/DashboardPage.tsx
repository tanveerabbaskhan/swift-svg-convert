import { ArrowUpRight, FileText, Eye, Users, PenTool, Plus, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDashboardStats, useConversions, useBlogPosts } from "@/hooks/use-cms-data";
import { Skeleton } from "@/components/ui/skeleton";

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

  const statCards = [
    { label: "Total Conversions", value: stats?.totalConversions ?? 0, icon: FileText },
    { label: "Page Views", value: stats?.totalPageViews ?? 0, icon: Eye },
    { label: "Total Pages", value: stats?.totalPages ?? 0, icon: Users },
    { label: "Blog Posts", value: stats?.totalPosts ?? 0, icon: PenTool },
  ];

  // Recent activity from real data
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
    <div className="p-8">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={s.label} className={`rounded-xl border bg-card p-5 shadow-sm animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold tabular-nums">{s.value.toLocaleString()}</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-2">
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

        {/* Quick Actions */}
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-3">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((a) => (
              <Button key={a.label} variant="outline" className="w-full justify-start" onClick={() => navigate(a.path)}>
                <a.icon className="h-4 w-4 mr-2" />
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { ArrowUpRight, ArrowDownRight, FileText, Eye, Users, PenTool, Plus, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Total Conversions", value: "1,247", change: "+12%", up: true, icon: FileText },
  { label: "Page Views", value: "8,432", change: "+5%", up: true, icon: Eye },
  { label: "Total Users", value: "342", change: "+2%", up: true, icon: Users },
  { label: "Blog Posts", value: "18", change: "+3", up: true, icon: PenTool },
];

const quickActions = [
  { label: "New Blog Post", icon: PenTool, path: "/admin/blog" },
  { label: "Create Page", icon: FileText, path: "/admin/pages" },
  { label: "SEO Audit", icon: Search, path: "/admin/seo" },
  { label: "User Invites", icon: UserPlus, path: "/admin/settings" },
];

const recentActivity = [
  { action: "PNG converted", detail: "logo-mark.png → SVG", time: "2 min ago" },
  { action: "Blog post published", detail: "\"Why SVG Matters in 2024\"", time: "1 hour ago" },
  { action: "New user registered", detail: "sarah.c@email.com", time: "3 hours ago" },
  { action: "Page updated", detail: "About Us page", time: "5 hours ago" },
  { action: "SEO report generated", detail: "Homepage score: 94/100", time: "Yesterday" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className={`rounded-xl border bg-card p-5 shadow-sm animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums">{s.value}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${s.up ? "text-success" : "text-destructive"}`}>
              {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {s.change} from last month
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-2">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
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

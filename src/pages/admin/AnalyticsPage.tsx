import { BarChart3, TrendingUp, Users, Eye, FileText, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";

const conversionData = [
  { day: "Mon", conversions: 42 },
  { day: "Tue", conversions: 58 },
  { day: "Wed", conversions: 35 },
  { day: "Thu", conversions: 73 },
  { day: "Fri", conversions: 91 },
  { day: "Sat", conversions: 64 },
  { day: "Sun", conversions: 48 },
];

const trafficData = [
  { day: "Mon", views: 320, users: 180 },
  { day: "Tue", views: 450, users: 240 },
  { day: "Wed", views: 380, users: 210 },
  { day: "Thu", views: 520, users: 290 },
  { day: "Fri", views: 680, users: 380 },
  { day: "Sat", views: 410, users: 220 },
  { day: "Sun", views: 350, users: 190 },
];

const topPages = [
  { page: "/", views: 3240, bounce: "32%" },
  { page: "/blog/svg-matters", views: 1243, bounce: "45%" },
  { page: "/blog/png-vs-svg", views: 892, bounce: "38%" },
  { page: "/about", views: 567, bounce: "52%" },
  { page: "/contact", views: 234, bounce: "61%" },
];

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track performance and user engagement.</p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Page Views", value: "8,432", change: "+12%", icon: Eye },
          { label: "Unique Users", value: "2,847", change: "+8%", icon: Users },
          { label: "Conversions", value: "411", change: "+23%", icon: FileText },
          { label: "Bounce Rate", value: "38%", change: "-4%", icon: TrendingUp },
        ].map((s, i) => (
          <div key={s.label} className={`rounded-xl border bg-card p-5 shadow-sm animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-success flex items-center gap-1 mt-1"><ArrowUpRight className="h-3 w-3" />{s.change}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-2">
          <h2 className="font-semibold mb-4">Conversions (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 90%)", fontSize: 13 }} />
              <Bar dataKey="conversions" fill="hsl(262 60% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-3">
          <h2 className="font-semibold mb-4">Traffic (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 90%)", fontSize: 13 }} />
              <Area type="monotone" dataKey="views" stroke="hsl(262 60% 50%)" fill="hsl(262 60% 50% / 0.1)" strokeWidth={2} />
              <Area type="monotone" dataKey="users" stroke="hsl(16 85% 58%)" fill="hsl(16 85% 58% / 0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Pages */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-up stagger-4">
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-semibold">Top Pages</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium text-muted-foreground">Page</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Views</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Bounce Rate</th>
            </tr>
          </thead>
          <tbody>
            {topPages.map((p) => (
              <tr key={p.page} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-4 font-mono text-xs">{p.page}</td>
                <td className="p-4 tabular-nums">{p.views.toLocaleString()}</td>
                <td className="p-4 tabular-nums">{p.bounce}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

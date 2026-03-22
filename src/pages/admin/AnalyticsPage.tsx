import { Eye, Users, FileText, TrendingUp, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useConversions, useAnalyticsEvents } from "@/hooks/use-cms-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

function groupByDay(items: { created_at: string }[], days: number) {
  const now = new Date();
  const result: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { weekday: "short" });
    result[key] = 0;
  }
  items.forEach((item) => {
    const d = new Date(item.created_at);
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff < days) {
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      result[key] = (result[key] || 0) + 1;
    }
  });
  return Object.entries(result).map(([day, count]) => ({ day, count }));
}

export default function AnalyticsPage() {
  const { data: conversions, isLoading: convLoading } = useConversions();
  const { data: events, isLoading: eventsLoading } = useAnalyticsEvents();
  const isLoading = convLoading || eventsLoading;

  const pageViews = useMemo(() => events?.filter(e => e.event_type === "page_view") || [], [events]);
  const uniquePages = useMemo(() => new Set(pageViews.map(e => e.page_url)).size, [pageViews]);

  const convChart = useMemo(() => groupByDay(conversions || [], 7), [conversions]);
  const viewsChart = useMemo(() => groupByDay(pageViews, 7), [pageViews]);

  const topPages = useMemo(() => {
    const counts: Record<string, number> = {};
    pageViews.forEach(e => { counts[e.page_url || "/"] = (counts[e.page_url || "/"] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([page, views]) => ({ page, views }));
  }, [pageViews]);

  const stats = [
    { label: "Page Views", value: pageViews.length, icon: Eye },
    { label: "Unique Pages", value: uniquePages, icon: Users },
    { label: "Conversions", value: conversions?.length || 0, icon: FileText },
    { label: "Events", value: events?.length || 0, icon: TrendingUp },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track performance and user engagement — data is live from your database.</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className={`rounded-xl border bg-card p-5 shadow-sm animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold tabular-nums">{s.value.toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-2">
          <h2 className="font-semibold mb-4">Conversions (Last 7 Days)</h2>
          {isLoading ? <Skeleton className="h-60" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={convChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 90%)", fontSize: 13 }} />
                <Bar dataKey="count" name="Conversions" fill="hsl(262 60% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-3">
          <h2 className="font-semibold mb-4">Page Views (Last 7 Days)</h2>
          {isLoading ? <Skeleton className="h-60" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={viewsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 90%)", fontSize: 13 }} />
                <Area type="monotone" dataKey="count" name="Views" stroke="hsl(262 60% 50%)" fill="hsl(262 60% 50% / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-up stagger-4">
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-semibold">Top Pages</h2>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10" />)}</div>
        ) : topPages.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No page view data yet. Analytics events will appear here as users visit your site.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium text-muted-foreground">Page</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Views</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((p) => (
                <tr key={p.page} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-mono text-xs">{p.page}</td>
                  <td className="p-4 tabular-nums">{p.views.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

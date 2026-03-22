import { Save, Globe, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/use-cms-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();

  const [form, setForm] = useState({
    site_name: "",
    site_description: "",
    site_url: "",
    email_notifications_conversions: true,
    email_weekly_analytics: true,
    email_blog_comments: false,
    email_security_alerts: true,
    two_factor_auth: false,
    rate_limiting: true,
    max_upload_size_mb: "10",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        site_name: settings.site_name || "",
        site_description: settings.site_description || "",
        site_url: settings.site_url || "",
        email_notifications_conversions: settings.email_notifications_conversions === "true",
        email_weekly_analytics: settings.email_weekly_analytics === "true",
        email_blog_comments: settings.email_blog_comments === "true",
        email_security_alerts: settings.email_security_alerts === "true",
        two_factor_auth: settings.two_factor_auth === "true",
        rate_limiting: settings.rate_limiting === "true",
        max_upload_size_mb: settings.max_upload_size_mb || "10",
      });
    }
  }, [settings]);

  const handleSave = () => {
    const entries: [string, string][] = [
      ["site_name", form.site_name],
      ["site_description", form.site_description],
      ["site_url", form.site_url],
      ["email_notifications_conversions", String(form.email_notifications_conversions)],
      ["email_weekly_analytics", String(form.email_weekly_analytics)],
      ["email_blog_comments", String(form.email_blog_comments)],
      ["email_security_alerts", String(form.email_security_alerts)],
      ["two_factor_auth", String(form.two_factor_auth)],
      ["rate_limiting", String(form.rate_limiting)],
      ["max_upload_size_mb", form.max_upload_size_mb],
    ];
    entries.forEach(([key, value]) => updateSetting.mutate({ key, value }));
    toast.success("Settings saved successfully");
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your platform settings — all changes are saved to the database.</p>
      </div>

      <div className="space-y-8">
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="h-4 w-4 text-primary" /></div>
            <h2 className="font-semibold text-lg">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" value={form.site_name} onChange={(e) => setForm(f => ({ ...f, site_name: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="siteDesc">Site Description</Label>
              <Textarea id="siteDesc" value={form.site_description} onChange={(e) => setForm(f => ({ ...f, site_description: e.target.value }))} className="mt-1.5" rows={3} />
            </div>
            <div>
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input id="siteUrl" value={form.site_url} onChange={(e) => setForm(f => ({ ...f, site_url: e.target.value }))} className="mt-1.5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Bell className="h-4 w-4 text-primary" /></div>
            <h2 className="font-semibold text-lg">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Email notifications for new conversions", key: "email_notifications_conversions" as const },
              { label: "Weekly analytics report", key: "email_weekly_analytics" as const },
              { label: "Blog comment notifications", key: "email_blog_comments" as const },
              { label: "Security alerts", key: "email_security_alerts" as const },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between py-2">
                <Label htmlFor={n.key} className="cursor-pointer">{n.label}</Label>
                <Switch id={n.key} checked={form[n.key]} onCheckedChange={(v) => setForm(f => ({ ...f, [n.key]: v }))} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="h-4 w-4 text-primary" /></div>
            <h2 className="font-semibold text-lg">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="2fa" className="cursor-pointer">Two-factor authentication</Label>
              <Switch id="2fa" checked={form.two_factor_auth} onCheckedChange={(v) => setForm(f => ({ ...f, two_factor_auth: v }))} />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="rateLimit" className="cursor-pointer">Rate limiting on converter</Label>
              <Switch id="rateLimit" checked={form.rate_limiting} onCheckedChange={(v) => setForm(f => ({ ...f, rate_limiting: v }))} />
            </div>
            <div>
              <Label htmlFor="maxSize">Max upload size (MB)</Label>
              <Input id="maxSize" type="number" value={form.max_upload_size_mb} onChange={(e) => setForm(f => ({ ...f, max_upload_size_mb: e.target.value }))} className="mt-1.5 w-32" />
            </div>
          </div>
        </div>

        <Button variant="hero" size="lg" onClick={handleSave} disabled={updateSetting.isPending} className="animate-fade-up stagger-4">
          <Save className="h-4 w-4 mr-2" /> Save Settings
        </Button>
      </div>
    </div>
  );
}

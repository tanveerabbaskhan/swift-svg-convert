import { Save, Globe, Bell, Shield, ImageIcon, Upload, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/use-cms-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const [form, setForm] = useState({
    site_name: "", site_description: "", site_url: "",
    site_logo: "", site_favicon: "", trustpilot_url: "",
    email_notifications_conversions: true, email_weekly_analytics: true,
    email_blog_comments: false, email_security_alerts: true,
    two_factor_auth: false, rate_limiting: true, max_upload_size_mb: "10",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        site_name: settings.site_name || "", site_description: settings.site_description || "",
        site_url: settings.site_url || "", site_logo: settings.site_logo || "", site_favicon: settings.site_favicon || "", trustpilot_url: settings.trustpilot_url || "",
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

  const uploadAsset = async (file: File, type: "logo" | "favicon") => {
    setUploading(type);
    const ext = file.name.split(".").pop();
    const path = `branding/${type}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast.error("Upload failed"); setUploading(null); return; }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    setForm(f => ({ ...f, [type === "logo" ? "site_logo" : "site_favicon"]: publicUrl }));
    setUploading(null);
    toast.success(`${type === "logo" ? "Logo" : "Favicon"} uploaded`);
  };

  const handleSave = () => {
    const entries: [string, string][] = [
      ["site_name", form.site_name], ["site_description", form.site_description], ["site_url", form.site_url],
      ["site_logo", form.site_logo], ["site_favicon", form.site_favicon], ["trustpilot_url", form.trustpilot_url],
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

  if (isLoading) return <div className="p-8 max-w-3xl space-y-6"><Skeleton className="h-8 w-48" />{[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>;

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <div className="mb-6 sm:mb-8 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your platform settings.</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Branding */}
        <div className="rounded-xl border bg-card p-5 sm:p-6 shadow-sm animate-fade-up stagger-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><ImageIcon className="h-4 w-4 text-primary" /></div>
            <h2 className="font-semibold text-lg">Branding</h2>
          </div>
          <div className="space-y-5">
            <div>
              <Label>Site Logo</Label>
              <div className="mt-1.5 flex items-center gap-4">
                {form.site_logo ? (
                  <div className="relative">
                    <img src={form.site_logo} alt="Logo" className="h-12 max-w-[200px] object-contain border rounded-lg p-1" />
                    <button onClick={() => setForm(f => ({ ...f, site_logo: "" }))} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">×</button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => logoRef.current?.click()} disabled={uploading === "logo"}>
                    <Upload className="h-3.5 w-3.5 mr-1" /> {uploading === "logo" ? "Uploading..." : "Upload Logo"}
                  </Button>
                )}
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAsset(e.target.files[0], "logo")} />
              </div>
            </div>
            <div>
              <Label>Favicon</Label>
              <div className="mt-1.5 flex items-center gap-4">
                {form.site_favicon ? (
                  <div className="relative">
                    <img src={form.site_favicon} alt="Favicon" className="h-8 w-8 object-contain border rounded p-0.5" />
                    <button onClick={() => setForm(f => ({ ...f, site_favicon: "" }))} className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px]">×</button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => faviconRef.current?.click()} disabled={uploading === "favicon"}>
                    <Upload className="h-3.5 w-3.5 mr-1" /> {uploading === "favicon" ? "Uploading..." : "Upload Favicon"}
                  </Button>
                )}
                <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAsset(e.target.files[0], "favicon")} />
              </div>
            </div>
          </div>
        </div>

        {/* General */}
        <div className="rounded-xl border bg-card p-5 sm:p-6 shadow-sm animate-fade-up stagger-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="h-4 w-4 text-primary" /></div>
            <h2 className="font-semibold text-lg">General</h2>
          </div>
          <div className="space-y-4">
            <div><Label>Site Name</Label><Input value={form.site_name} onChange={(e) => setForm(f => ({ ...f, site_name: e.target.value }))} className="mt-1.5" /></div>
            <div><Label>Site Description</Label><Textarea value={form.site_description} onChange={(e) => setForm(f => ({ ...f, site_description: e.target.value }))} className="mt-1.5" rows={3} /></div>
            <div><Label>Site URL</Label><Input value={form.site_url} onChange={(e) => setForm(f => ({ ...f, site_url: e.target.value }))} className="mt-1.5" /></div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border bg-card p-5 sm:p-6 shadow-sm animate-fade-up stagger-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Bell className="h-4 w-4 text-primary" /></div>
            <h2 className="font-semibold text-lg">Notifications</h2>
          </div>
          <div className="space-y-4">
            {([
              { label: "Email notifications for new conversions", key: "email_notifications_conversions" },
              { label: "Weekly analytics report", key: "email_weekly_analytics" },
              { label: "Blog comment notifications", key: "email_blog_comments" },
              { label: "Security alerts", key: "email_security_alerts" },
            ] as const).map((n) => (
              <div key={n.key} className="flex items-center justify-between py-2">
                <Label htmlFor={n.key} className="cursor-pointer">{n.label}</Label>
                <Switch id={n.key} checked={form[n.key]} onCheckedChange={(v) => setForm(f => ({ ...f, [n.key]: v }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border bg-card p-5 sm:p-6 shadow-sm animate-fade-up stagger-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="h-4 w-4 text-primary" /></div>
            <h2 className="font-semibold text-lg">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2"><Label htmlFor="2fa" className="cursor-pointer">Two-factor authentication</Label><Switch id="2fa" checked={form.two_factor_auth} onCheckedChange={(v) => setForm(f => ({ ...f, two_factor_auth: v }))} /></div>
            <div className="flex items-center justify-between py-2"><Label htmlFor="rateLimit" className="cursor-pointer">Rate limiting on converter</Label><Switch id="rateLimit" checked={form.rate_limiting} onCheckedChange={(v) => setForm(f => ({ ...f, rate_limiting: v }))} /></div>
            <div><Label>Max upload size (MB)</Label><Input type="number" value={form.max_upload_size_mb} onChange={(e) => setForm(f => ({ ...f, max_upload_size_mb: e.target.value }))} className="mt-1.5 w-32" /></div>
          </div>
        </div>

        <Button variant="hero" size="lg" onClick={handleSave} disabled={updateSetting.isPending} className="animate-fade-up">
          <Save className="h-4 w-4 mr-2" /> Save Settings
        </Button>
      </div>
    </div>
  );
}

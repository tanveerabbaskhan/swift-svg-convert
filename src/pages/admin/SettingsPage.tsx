import { Save, Globe, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your platform settings.</p>
      </div>

      <div className="space-y-8">
        {/* General */}
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="h-4 w-4 text-primary" /></div>
            <h2 className="font-semibold text-lg">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" defaultValue="PNGTOSVG" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="siteDesc">Site Description</Label>
              <Textarea id="siteDesc" defaultValue="Free online PNG to SVG converter. Fast, secure, and private." className="mt-1.5" rows={3} />
            </div>
            <div>
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input id="siteUrl" defaultValue="https://pngtosvg.com" className="mt-1.5" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Bell className="h-4 w-4 text-primary" /></div>
            <h2 className="font-semibold text-lg">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Email notifications for new conversions", id: "conv" },
              { label: "Weekly analytics report", id: "analytics" },
              { label: "Blog comment notifications", id: "comments" },
              { label: "Security alerts", id: "security" },
            ].map((n) => (
              <div key={n.id} className="flex items-center justify-between py-2">
                <Label htmlFor={n.id} className="cursor-pointer">{n.label}</Label>
                <Switch id={n.id} defaultChecked={n.id !== "comments"} />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-fade-up stagger-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="h-4 w-4 text-primary" /></div>
            <h2 className="font-semibold text-lg">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="2fa" className="cursor-pointer">Two-factor authentication</Label>
              <Switch id="2fa" />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="rateLimit" className="cursor-pointer">Rate limiting on converter</Label>
              <Switch id="rateLimit" defaultChecked />
            </div>
            <div>
              <Label htmlFor="maxSize">Max upload size (MB)</Label>
              <Input id="maxSize" type="number" defaultValue="10" className="mt-1.5 w-32" />
            </div>
          </div>
        </div>

        <Button variant="hero" size="lg" className="animate-fade-up stagger-4">
          <Save className="h-4 w-4 mr-2" /> Save Settings
        </Button>
      </div>
    </div>
  );
}

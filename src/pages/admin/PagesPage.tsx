import { Plus, Edit, Trash2, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePages, useCreatePage, useUpdatePage, useDeletePage } from "@/hooks/use-cms-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";

type PageForm = {
  title: string; slug: string; content: string; status: string;
  meta_title: string; meta_description: string; og_image: string; noindex: boolean;
};

const emptyForm: PageForm = { title: "", slug: "", content: "", status: "draft", meta_title: "", meta_description: "", og_image: "", noindex: false };

export default function PagesPage() {
  const { data: pages, isLoading } = usePages();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PageForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const openNew = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title, slug: p.slug, content: p.content || "", status: p.status,
      meta_title: p.meta_title || "", meta_description: p.meta_description || "",
      og_image: p.og_image || "", noindex: p.noindex || false,
    });
    setDialogOpen(true);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `pages/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    setForm(f => ({ ...f, og_image: publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleSave = () => {
    if (!form.title || !form.slug) return;
    if (editingId) {
      updatePage.mutate({ id: editingId, ...form, og_image: form.og_image || null }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createPage.mutate({ ...form, og_image: form.og_image || null } as any, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const autoSlug = (title: string) => {
    setForm(f => ({ ...f, title, slug: f.slug || "/" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "") }));
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground mt-1">Manage your website pages.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> New Page</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-up stagger-1">
        {isLoading ? (
          <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !pages?.length ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">No pages yet</p>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Create Page</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground p-4">Title</th>
                  <th className="text-left font-medium text-muted-foreground p-4 hidden sm:table-cell">Slug</th>
                  <th className="text-left font-medium text-muted-foreground p-4">Status</th>
                  <th className="text-left font-medium text-muted-foreground p-4 hidden md:table-cell">Index</th>
                  <th className="text-right font-medium text-muted-foreground p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium">{p.title}</td>
                    <td className="p-4 text-muted-foreground font-mono text-xs hidden sm:table-cell">{p.slug}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "published" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`text-xs ${(p as any).noindex ? "text-destructive" : "text-success"}`}>
                        {(p as any).noindex ? "noindex" : "index"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePage.mutate(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Page" : "New Page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => editingId ? setForm(f => ({ ...f, title: e.target.value })) : autoSlug(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="mt-1.5 font-mono text-sm" />
              </div>
            </div>

            {/* OG Image */}
            <div>
              <Label>Featured / OG Image</Label>
              <div className="mt-1.5 flex items-center gap-3">
                {form.og_image ? (
                  <div className="relative">
                    <img src={form.og_image} alt="" className="h-20 w-32 rounded-lg object-cover border" />
                    <button onClick={() => setForm(f => ({ ...f, og_image: "" }))} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">×</button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => imgRef.current?.click()} disabled={uploading}>
                    <Upload className="h-3.5 w-3.5 mr-1" /> {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
                )}
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              </div>
            </div>

            <div>
              <Label>Content</Label>
              <div className="mt-1.5">
                <RichTextEditor value={form.content} onChange={(html) => setForm(f => ({ ...f, content: html }))} placeholder="Write your page content..." />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <Switch id="page-noindex" checked={form.noindex} onCheckedChange={(v) => setForm(f => ({ ...f, noindex: v }))} />
              <Label htmlFor="page-noindex" className="cursor-pointer">
                <span className="text-sm font-medium">Noindex</span>
                <span className="text-xs text-muted-foreground block">Prevent search engines from indexing this page</span>
              </Label>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">SEO Settings</h3>
              <div className="space-y-3">
                <div>
                  <Label>Meta Title</Label>
                  <Input value={form.meta_title} onChange={(e) => setForm(f => ({ ...f, meta_title: e.target.value }))} className="mt-1.5" placeholder="Page title for search engines" />
                  <p className="text-xs text-muted-foreground mt-1">{form.meta_title.length}/60 characters</p>
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea value={form.meta_description} onChange={(e) => setForm(f => ({ ...f, meta_description: e.target.value }))} className="mt-1.5" rows={2} placeholder="Page description for search engines" />
                  <p className="text-xs text-muted-foreground mt-1">{form.meta_description.length}/160 characters</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createPage.isPending || updatePage.isPending}>
                <Save className="h-4 w-4 mr-2" /> {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

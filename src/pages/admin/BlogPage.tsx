import { Plus, Edit, Trash2, Save, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, useCategories } from "@/hooks/use-cms-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";

type PostForm = {
  title: string; slug: string; content: string; excerpt: string;
  category_id: string; status: string; meta_title: string; meta_description: string;
  featured_image: string; noindex: boolean;
};

const emptyForm: PostForm = { title: "", slug: "", content: "", excerpt: "", category_id: "", status: "draft", meta_title: "", meta_description: "", featured_image: "", noindex: false };

export default function BlogPage() {
  const { data: posts, isLoading } = useBlogPosts();
  const { data: categories } = useCategories();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const openNew = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title, slug: p.slug, content: p.content || "", excerpt: p.excerpt || "",
      category_id: p.category_id || "", status: p.status,
      meta_title: p.meta_title || "", meta_description: p.meta_description || "",
      featured_image: p.featured_image || "", noindex: p.noindex || false,
    });
    setDialogOpen(true);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `blog/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    setForm(f => ({ ...f, featured_image: publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleSave = () => {
    if (!form.title || !form.slug) return;
    const payload = {
      ...form,
      category_id: form.category_id || null,
      featured_image: form.featured_image || null,
      published_at: form.status === "published" ? new Date().toISOString() : null,
    };
    if (editingId) {
      updatePost.mutate({ id: editingId, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createPost.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const autoSlug = (title: string) => {
    setForm(f => ({ ...f, title, slug: f.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "") }));
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Create and manage blog content.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> New Post</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-up stagger-1">
        {isLoading ? (
          <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !posts?.length ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">No blog posts yet</p>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Create Post</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground p-4">Title</th>
                  <th className="text-left font-medium text-muted-foreground p-4 hidden sm:table-cell">Category</th>
                  <th className="text-left font-medium text-muted-foreground p-4">Status</th>
                  <th className="text-left font-medium text-muted-foreground p-4 hidden md:table-cell">Index</th>
                  <th className="text-left font-medium text-muted-foreground p-4 hidden md:table-cell">Views</th>
                  <th className="text-right font-medium text-muted-foreground p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.featured_image && <img src={p.featured_image} alt="" className="h-8 w-8 rounded object-cover" />}
                        <span className="font-medium">{p.title}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      {(p as any).categories?.name ? (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{(p as any).categories.name}</span>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
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
                    <td className="p-4 text-muted-foreground tabular-nums hidden md:table-cell">{p.views.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePost.mutate(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <DialogTitle>{editingId ? "Edit Post" : "New Blog Post"}</DialogTitle>
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

            {/* Featured Image */}
            <div>
              <Label>Featured Image</Label>
              <div className="mt-1.5 flex items-center gap-3">
                {form.featured_image ? (
                  <div className="relative">
                    <img src={form.featured_image} alt="" className="h-20 w-32 rounded-lg object-cover border" />
                    <button onClick={() => setForm(f => ({ ...f, featured_image: "" }))} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">×</button>
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
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))} className="mt-1.5" rows={2} placeholder="Short summary for previews" />
            </div>
            <div>
              <Label>Content</Label>
              <div className="mt-1.5">
                <RichTextEditor value={form.content} onChange={(html) => setForm(f => ({ ...f, content: html }))} placeholder="Write your blog post..." />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm(f => ({ ...f, category_id: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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

            {/* Noindex toggle */}
            <div className="flex items-center gap-3 py-2">
              <Switch id="noindex" checked={form.noindex} onCheckedChange={(v) => setForm(f => ({ ...f, noindex: v }))} />
              <Label htmlFor="noindex" className="cursor-pointer">
                <span className="text-sm font-medium">Noindex</span>
                <span className="text-xs text-muted-foreground block">Prevent search engines from indexing this post</span>
              </Label>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">SEO Settings</h3>
              <div className="space-y-3">
                <div>
                  <Label>Meta Title</Label>
                  <Input value={form.meta_title} onChange={(e) => setForm(f => ({ ...f, meta_title: e.target.value }))} className="mt-1.5" placeholder="Title for search engines" />
                  <p className="text-xs text-muted-foreground mt-1">{form.meta_title.length}/60 characters</p>
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea value={form.meta_description} onChange={(e) => setForm(f => ({ ...f, meta_description: e.target.value }))} className="mt-1.5" rows={2} placeholder="Description for search engines" />
                  <p className="text-xs text-muted-foreground mt-1">{form.meta_description.length}/160 characters</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createPost.isPending || updatePost.isPending}>
                <Save className="h-4 w-4 mr-2" /> {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

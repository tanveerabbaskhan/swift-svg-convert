import { Plus, Edit, Trash2, FolderOpen, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-cms-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useBlogPosts } from "@/hooks/use-cms-data";

type CatForm = { name: string; slug: string; description: string; color: string };
const emptyForm: CatForm = { name: "", slug: "", description: "", color: "262 60% 50%" };

const colorOptions = [
  { label: "Purple", value: "262 60% 50%" },
  { label: "Blue", value: "210 80% 52%" },
  { label: "Green", value: "152 60% 42%" },
  { label: "Amber", value: "38 92% 50%" },
  { label: "Coral", value: "16 85% 58%" },
  { label: "Red", value: "0 72% 51%" },
];

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const { data: posts } = useBlogPosts();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CatForm>(emptyForm);

  const openNew = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: any) => {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug, description: c.description || "", color: c.color || "262 60% 50%" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.slug) return;
    if (editingId) {
      updateCat.mutate({ id: editingId, ...form }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createCat.mutate(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const getPostCount = (catId: string) => posts?.filter(p => p.category_id === catId).length || 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your blog content.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> New Category</Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : !categories?.length ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          <p className="text-lg font-medium mb-2">No categories yet</p>
          <Button onClick={openNew} className="mt-2"><Plus className="h-4 w-4 mr-2" /> Create Category</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c, i) => (
            <div key={c.id} className={`rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-up stagger-${Math.min(i + 1, 4)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `hsl(${c.color || "262 60% 50%"} / 0.12)` }}>
                  <FolderOpen className="h-5 w-5" style={{ color: `hsl(${c.color || "262 60% 50%"})` }} />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCat.mutate(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <h3 className="font-semibold text-lg">{c.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">/{c.slug}</p>
              <p className="text-sm text-muted-foreground mt-2">{getPostCount(c.id)} posts</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => {
                const name = e.target.value;
                setForm(f => ({ ...f, name, slug: editingId ? f.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "") }));
              }} className="mt-1.5" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="mt-1.5 font-mono text-sm" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1.5" rows={2} />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {colorOptions.map(co => (
                  <button
                    key={co.value}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${form.color === co.value ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: `hsl(${co.value})` }}
                    onClick={() => setForm(f => ({ ...f, color: co.value }))}
                    title={co.label}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createCat.isPending || updateCat.isPending}>
                <Save className="h-4 w-4 mr-2" /> {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

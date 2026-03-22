import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: 1, name: "Design", slug: "design", posts: 8, color: "262 60% 50%" },
  { id: 2, name: "Tutorial", slug: "tutorial", posts: 12, color: "210 80% 52%" },
  { id: 3, name: "Performance", slug: "performance", posts: 5, color: "152 60% 42%" },
  { id: 4, name: "News", slug: "news", posts: 3, color: "38 92% 50%" },
  { id: 5, name: "Tips & Tricks", slug: "tips-tricks", posts: 7, color: "16 85% 58%" },
];

export default function CategoriesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your blog content.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Category</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c, i) => (
          <div key={c.id} className={`rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `hsl(${c.color} / 0.12)` }}>
                <FolderOpen className="h-5 w-5" style={{ color: `hsl(${c.color})` }} />
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <h3 className="font-semibold text-lg">{c.name}</h3>
            <p className="text-sm text-muted-foreground font-mono">/{c.slug}</p>
            <p className="text-sm text-muted-foreground mt-2">{c.posts} posts</p>
          </div>
        ))}
      </div>
    </div>
  );
}

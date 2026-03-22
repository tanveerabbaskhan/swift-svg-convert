import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const posts = [
  { id: 1, title: "Why SVG Matters in 2024", category: "Design", status: "Published", date: "2024-03-15", views: 1243 },
  { id: 2, title: "PNG vs SVG: Complete Guide", category: "Tutorial", status: "Published", date: "2024-03-10", views: 892 },
  { id: 3, title: "Optimizing Vector Graphics", category: "Performance", status: "Draft", date: "2024-03-08", views: 0 },
  { id: 4, title: "Web Performance with SVG", category: "Performance", status: "Published", date: "2024-03-01", views: 567 },
  { id: 5, title: "Logo Design Best Practices", category: "Design", status: "Published", date: "2024-02-25", views: 2104 },
];

export default function BlogPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Create and manage blog content.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Post</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-up stagger-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left font-medium text-muted-foreground p-4">Title</th>
              <th className="text-left font-medium text-muted-foreground p-4">Category</th>
              <th className="text-left font-medium text-muted-foreground p-4">Status</th>
              <th className="text-left font-medium text-muted-foreground p-4">Date</th>
              <th className="text-left font-medium text-muted-foreground p-4">Views</th>
              <th className="text-right font-medium text-muted-foreground p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-4 font-medium">{p.title}</td>
                <td className="p-4"><span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{p.category}</span></td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "Published" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{p.date}</td>
                <td className="p-4 text-muted-foreground tabular-nums">{p.views.toLocaleString()}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

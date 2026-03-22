import { Plus, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const initialPages = [
  { id: 1, title: "Home", slug: "/", status: "Published", updated: "2024-03-15" },
  { id: 2, title: "About Us", slug: "/about", status: "Published", updated: "2024-03-10" },
  { id: 3, title: "Privacy Policy", slug: "/privacy", status: "Published", updated: "2024-02-28" },
  { id: 4, title: "Terms of Service", slug: "/terms", status: "Draft", updated: "2024-03-01" },
  { id: 5, title: "Contact", slug: "/contact", status: "Published", updated: "2024-03-12" },
];

export default function PagesPage() {
  const [pages] = useState(initialPages);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground mt-1">Manage your website pages.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Page</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-fade-up stagger-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left font-medium text-muted-foreground p-4">Title</th>
              <th className="text-left font-medium text-muted-foreground p-4">Slug</th>
              <th className="text-left font-medium text-muted-foreground p-4">Status</th>
              <th className="text-left font-medium text-muted-foreground p-4">Updated</th>
              <th className="text-right font-medium text-muted-foreground p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-4 font-medium">{p.title}</td>
                <td className="p-4 text-muted-foreground font-mono text-xs">{p.slug}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "Published" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{p.updated}</td>
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

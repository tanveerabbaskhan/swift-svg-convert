import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, FileText, PenTool, FolderOpen, Search, BarChart3, Settings, 
  LogOut, FileCode, ChevronLeft, Menu 
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/pages", icon: FileText, label: "Pages" },
  { to: "/admin/blog", icon: PenTool, label: "Blog Posts" },
  { to: "/admin/categories", icon: FolderOpen, label: "Categories" },
  { to: "/admin/seo", icon: Search, label: "SEO" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-64"} flex-shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300`}>
        <div className={`h-16 flex items-center ${collapsed ? "justify-center" : "px-5"} border-b border-sidebar-border`}>
          {!collapsed && (
            <button onClick={() => navigate("/")} className="flex items-center gap-2.5 font-bold text-lg text-sidebar-accent-foreground">
              <div className="h-7 w-7 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <FileCode className="h-3.5 w-3.5 text-sidebar-primary-foreground" />
              </div>
              PNGTOSVG
            </button>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className={`${collapsed ? "" : "ml-auto"} h-7 w-7 flex items-center justify-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors`}>
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                } ${collapsed ? "justify-center px-0" : ""}`
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">A</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">Admin User</p>
                <p className="text-xs text-sidebar-foreground truncate">admin@pngtosvg.com</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" className={`w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${collapsed ? "px-0 justify-center" : "justify-start"}`} onClick={() => navigate("/")}>
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Back to Site</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

import { FileCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteSettings } from "@/hooks/use-cms-data";

export default function PublicPageLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();
  const siteName = settings?.site_name || "PNGTOSVG";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
              <FileCode className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">{siteName}</span>
          </button>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <a href="/about" className="hover:text-foreground transition-colors">About</a>
            <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 bg-muted/20">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <div className="h-5 w-5 rounded-md gradient-primary flex items-center justify-center">
              <FileCode className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
            {siteName}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="/about" className="hover:text-foreground transition-colors">About</a>
            <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

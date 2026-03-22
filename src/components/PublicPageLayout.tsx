import { FileCode, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useSiteSettings } from "@/hooks/use-cms-data";
import { useDynamicHead } from "@/hooks/use-dynamic-head";

export default function PublicPageLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const settings = useDynamicHead(); // applies title, favicon, GA, GSC
  const siteName = settings?.site_name || "PNGTOSVG";
  const siteLogo = settings?.site_logo || "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 font-bold text-lg tracking-tight">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-7 max-w-[140px] object-contain" />
            ) : (
              <>
                <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
                  <FileCode className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="hidden sm:inline">{siteName}</span>
              </>
            )}
          </button>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
            <a href="/about" className="hover:text-foreground transition-colors">About</a>
            <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 bg-muted/20">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-5 max-w-[100px] object-contain" />
            ) : (
              <>
                <div className="h-5 w-5 rounded-md gradient-primary flex items-center justify-center">
                  <FileCode className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
                {siteName}
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="/about" className="hover:text-foreground transition-colors">About</a>
            <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
            <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

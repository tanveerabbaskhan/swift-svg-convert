import { FileCode, Moon, Sun, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useSiteSettings } from "@/hooks/use-cms-data";
import { useDynamicHead } from "@/hooks/use-dynamic-head";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function PublicPageLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const settings = useDynamicHead(); // applies title, favicon, GA, GSC
  const siteName = settings?.site_name || "PNGTOSVG";
  const siteLogo = settings?.site_logo || "";
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                to={item.href} 
                className="hover:text-foreground transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-md" ref={mobileMenuRef}>
            <nav className="container px-4 py-4">
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 px-4 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 font-medium"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs opacity-50">→</span>
                  </Link>
                ))}
                <div className="pt-3 mt-3 border-t border-border">
                  <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium text-muted-foreground">Theme</span>
                    <button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Toggle dark mode"
                    >
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}
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
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

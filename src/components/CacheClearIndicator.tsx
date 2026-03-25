import { useState, useEffect } from "react";
import { Trash2, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

export function CacheClearIndicator() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Show cache clear indicator only for admin users on homepage
  useEffect(() => {
    if (user && window.location.pathname === "/") {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user]);

  const handleCacheClear = async () => {
    setIsClearing(true);
    try {
      // Clear browser cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Trigger service worker update
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }

      toast.success("Cache cleared successfully! Homepage will refresh.");

      // Reload page after clearing cache
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      toast.error("Failed to clear cache");
    } finally {
      setIsClearing(false);
    }
  };

  if (!isVisible || !user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Admin Cache Control</p>
            <p className="text-xs text-gray-500">Clear cache to see latest changes</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <Button
        onClick={handleCacheClear}
        disabled={isClearing}
        size="sm"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isClearing ? (
          <>
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Clearing...
          </>
        ) : (
          <>
            <Trash2 className="h-3 w-3 mr-1" />
            Clear Cache
          </>
        )}
      </Button>
    </div>
  );
}

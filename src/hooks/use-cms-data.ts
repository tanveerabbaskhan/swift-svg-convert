import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ===== CATEGORIES =====
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: { name: string; slug: string; description?: string; color?: string }) => {
      const { data, error } = await supabase.from("categories").insert(cat).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; slug?: string; description?: string; color?: string }) => {
      const { error } = await supabase.from("categories").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== PAGES =====
export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (page: { title: string; slug: string; content?: string; status?: string; meta_title?: string; meta_description?: string }) => {
      const { data, error } = await supabase.from("pages").insert(page).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pages"] }); toast.success("Page created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("pages").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pages"] }); toast.success("Page updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pages"] }); toast.success("Page deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== BLOG POSTS =====
export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, categories(name)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: { title: string; slug: string; content?: string; excerpt?: string; category_id?: string; status?: string; meta_title?: string; meta_description?: string; published_at?: string }) => {
      const { data, error } = await supabase.from("blog_posts").insert(post).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["blog_posts"] }); toast.success("Blog post created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("blog_posts").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["blog_posts"] }); toast.success("Blog post updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["blog_posts"] }); toast.success("Blog post deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== SITE SETTINGS =====
export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      data.forEach((row) => { map[row.key] = row.value || ""; });
      return map;
    },
  });
}

export function useUpdateSiteSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from("site_settings").upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["site_settings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ===== CONVERSIONS =====
export function useConversions() {
  return useQuery({
    queryKey: ["conversions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("conversions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateConversion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conv: { file_name?: string; file_size?: number }) => {
      const { error } = await supabase.from("conversions").insert(conv);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["conversions"] }); },
  });
}

// ===== ANALYTICS =====
export function useAnalyticsEvents() {
  return useQuery({
    queryKey: ["analytics_events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("analytics_events").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
  });
}

export function useTrackEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: { event_type: string; page_url?: string; metadata?: Record<string, any> }) => {
      const { error } = await supabase.from("analytics_events").insert(event);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["analytics_events"] }); },
  });
}

// ===== DASHBOARD STATS =====
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: async () => {
      const [convRes, postsRes, pagesRes, eventsRes] = await Promise.all([
        supabase.from("conversions").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("pages").select("*", { count: "exact", head: true }),
        supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_type", "page_view"),
      ]);
      return {
        totalConversions: convRes.count || 0,
        totalPosts: postsRes.count || 0,
        totalPages: pagesRes.count || 0,
        totalPageViews: eventsRes.count || 0,
      };
    },
  });
}

// ===== CONTACT SUBMISSIONS =====
export function useCreateContactSubmission() {
  return useMutation({
    mutationFn: async (submission: { name: string; email: string; message: string }) => {
      const { error } = await supabase.from("contact_submissions" as any).insert(submission);
      if (error) throw error;
    },
    onError: (e: Error) => toast.error(e.message),
  });
}


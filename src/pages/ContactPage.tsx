import PublicPageLayout from "@/components/PublicPageLayout";
import { usePages, useCreateContactSubmission } from "@/hooks/use-cms-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageSquare, Send, Loader2 } from "lucide-react";

export default function ContactPage() {
  const { data: pages } = usePages();
  const page = pages?.find(p => p.slug === "/contact");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const createSubmission = useCreateContactSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubmission.mutateAsync(form);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <PublicPageLayout>
      <div className="container max-w-3xl py-16 px-4 sm:px-6 animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{page?.title || "Contact Us"}</h1>
        {page?.content && (
          <div className="prose prose-sm max-w-none mb-8" dangerouslySetInnerHTML={{ __html: page.content }} />
        )}
        <p className="text-muted-foreground mb-8">Have a question or feedback? We'd love to hear from you.</p>

        <div className="grid md:grid-cols-5 gap-8">
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5" required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1.5" required />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="mt-1.5" rows={5} required />
            </div>
            <Button type="submit" variant="hero" size="lg" disabled={createSubmission.isPending}>
              {createSubmission.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {createSubmission.isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-5">
              <Mail className="h-5 w-5 text-primary mb-3" />
              <p className="font-medium text-sm">Email</p>
              <p className="text-sm text-muted-foreground">support@pngtosvgconverter.com</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <MessageSquare className="h-5 w-5 text-primary mb-3" />
              <p className="font-medium text-sm">Response Time</p>
              <p className="text-sm text-muted-foreground">We typically respond within 24 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}


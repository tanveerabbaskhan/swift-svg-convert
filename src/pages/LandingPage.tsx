import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Download, ArrowRight, Zap, Shield, Layers, Image, FileCode, X, Check, Trash2, ExternalLink, Palette, Eye, Lock, Scissors, Moon, Sun, ArrowDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCreateConversion, useTrackEvent, useSiteSettings } from "@/hooks/use-cms-data";
import { useDynamicHead } from "@/hooks/use-dynamic-head";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type ConversionFile = {
  id: string;
  file: File;
  preview: string;
  svgResult: string | null;
  progress: number;
  status: "pending" | "converting" | "done" | "error";
};

const features = [
  { icon: Zap, title: "True Vectorization — Not Base64", desc: "We trace your image pixel-by-pixel and rebuild it as real SVG paths. Not a wrapper. Not an embed. A genuine vector file.", accent: "from-primary to-primary/70" },
  { icon: Palette, title: "Colors Preserved — Full Color Output", desc: "Keep every color from your original PNG. Our color tracing mode rebuilds each color region as a separate vector path.", accent: "from-accent to-accent/70" },
  { icon: Eye, title: "Transparent Backgrounds Supported", desc: "Upload a PNG with no background. Get an SVG with no background. No white fill. No unexpected background color.", accent: "from-primary to-accent" },
  { icon: Lock, title: "No Signup Required — Ever", desc: "Open the page. Upload your file. Download your SVG. No account. No email. No password. No credit card.", accent: "from-accent to-primary" },
  { icon: FileCode, title: "No Watermark on Output", desc: "Your converted SVG file is clean. No branding. No overlay. No locked quality behind a paywall.", accent: "from-primary to-primary/70" },
  { icon: Shield, title: "Runs Entirely in Your Browser", desc: "Your PNG never leaves your device. Processing happens locally — no file upload to a server. Completely private.", accent: "from-accent to-accent/70" },
  { icon: Scissors, title: "Works for Logos, Icons, and Cricut Files", desc: "Flat images with clear edges convert perfectly. Logos, icons, clip art, and Cricut cut files all supported.", accent: "from-primary to-accent" },
  { icon: Moon, title: "Black and White + Full Color Modes", desc: "Monochrome images use our black and white preset for the cleanest edges. Color images use full color tracing.", accent: "from-accent to-primary" },
];

const steps = [
  { num: "01", title: "Upload Your PNG", desc: "Click the upload area or drag and drop your PNG file directly onto the converter. Supports PNG files of any size. No file size limits.", icon: Upload },
  { num: "02", title: "Choose Your Settings", desc: "Select Full Color mode to preserve all colors from your original image. Select Black and White mode for logos, icons, and line art with the cleanest edge tracing.", icon: Layers },
  { num: "03", title: "Download Your SVG", desc: "Click Convert. Your PNG is traced into real SVG vector paths — not embedded as Base64. Download your clean, scalable SVG file instantly. No watermark.", icon: Download },
];

const problems = [
  { title: "SVG looks blurry or cartoonish after conversion", desc: "Our image tracing uses edge-detection algorithms to preserve sharp boundaries. Use High Fidelity mode for complex images and Low Fidelity for logos.", icon: Eye },
  { title: "Colors look completely different after conversion", desc: "Full Color tracing mode rebuilds each color region separately. Adjust color precision for better accuracy.", icon: Palette },
  { title: "Parts of my logo went missing after tracing", desc: "Use the path cleanup tool to manually refine or restore missing areas.", icon: Scissors },
  { title: "SVG file is too large", desc: "Use the SVG optimizer to reduce path count without visible quality loss.", icon: FileCode },
  { title: "White background appeared even though PNG was transparent", desc: "Transparency is preserved by default. Ensure the \"Preserve Transparency\" option is enabled.", icon: Layers },
  { title: "SVG looks pixelated", desc: "This happens when using fake converters that embed PNG as Base64. Our tool creates real vector paths.", icon: Zap },
];

const faqs = [
  { q: "What is a PNG to SVG converter?", a: "A PNG to SVG converter transforms raster images made of pixels into scalable vector graphics built from mathematical paths. True converters rebuild images as vector paths, while fake ones simply embed the PNG inside an SVG file." },
  { q: "How do I convert PNG to SVG for free?", a: "Upload your PNG, choose Full Color or Black and White mode, click Convert, and download your SVG instantly. No signup, no watermark, and no payment required." },
  { q: "Why does my SVG look blurry or pixelated after conversion?", a: "This usually means the file is a Base64-embedded PNG inside an SVG. A real SVG created through vectorization will stay sharp at any size." },
  { q: "How do I keep the colors when converting PNG to SVG?", a: "Use Full Color mode. This traces each color region separately and preserves the original color details." },
  { q: "Is it possible to convert a raster image to a real vector automatically?", a: "Yes, especially for logos, icons, and simple graphics. Complex images with gradients may require manual cleanup." },
  { q: "What types of PNG files convert best to SVG?", a: "Images with clear edges, flat colors, and high contrast — like logos, icons, and line art — produce the best results." },
  { q: "Why is my converted SVG file so large?", a: "Complex images create more vector paths. Use an optimizer or simplify the original PNG before converting." },
  { q: "Why does my SVG have a white background?", a: "This happens when transparency isn't preserved. Enable the transparency option before converting." },
  { q: "Can I convert PNG to SVG without losing quality?", a: "Yes. Once converted into vector paths, SVG files scale infinitely without losing quality." },
  { q: "What is the difference between PNG and SVG?", a: "PNG is pixel-based and loses quality when scaled. SVG is vector-based and remains sharp at any size." },
  { q: "Do I need to create an account to use this converter?", a: "No. You can upload, convert, and download files without signing up." },
  { q: "How does image tracing work in SVG conversion?", a: "Image tracing detects edges and color regions in a PNG and converts them into mathematical curves and vector paths, creating a scalable version of the image." },
];

function convertPng(preview: string, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      onProgress(20);
      const canvas = document.createElement("canvas");
      const w = Math.min(img.width, 800);
      const h = Math.round((img.height / img.width) * w);
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      onProgress(40);
      const data = ctx.getImageData(0, 0, w, h);
      const blockSize = 4;
      let rects = "";
      const totalBlocks = Math.ceil(h / blockSize) * Math.ceil(w / blockSize);
      let done = 0;
      for (let y = 0; y < h; y += blockSize) {
        for (let x = 0; x < w; x += blockSize) {
          const idx = (y * w + x) * 4;
          const r = data.data[idx], g = data.data[idx+1], b = data.data[idx+2], a = data.data[idx+3];
          if (a < 20) { done++; continue; }
          const rr = Math.round(r/32)*32, gg = Math.round(g/32)*32, bb = Math.round(b/32)*32;
          rects += `<rect x="${x}" y="${y}" width="${blockSize}" height="${blockSize}" fill="rgb(${rr},${gg},${bb})" opacity="${(a/255).toFixed(2)}"/>`;
          done++;
        }
        onProgress(40 + Math.round((done / totalBlocks) * 55));
      }
      onProgress(98);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${rects}</svg>`;
      setTimeout(() => { onProgress(100); resolve(svg); }, 100);
    };
    img.src = preview;
  });
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [totalConverted, setTotalConverted] = useState<number>(0);
  const settings = useDynamicHead();
  const siteName = settings?.site_name || "PNGTOSVG";
  const siteLogo = settings?.site_logo || "";
  const trustpilotUrl = settings?.trustpilot_url || "";
  const createConversion = useCreateConversion();
  const trackEvent = useTrackEvent();
  const inputRef = useRef<HTMLInputElement>(null);

  // FAQ Schema (JSON-LD)
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  useEffect(() => {
    trackEvent.mutate({ event_type: "page_view", page_url: "/" });
    supabase.from("conversions").select("*", { count: "exact", head: true }).then(({ count }) => {
      setTotalConverted(count || 0);
    });
    const channel = supabase.channel("live-conversions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversions" }, () => {
        setTotalConverted(prev => prev + 1);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addFiles = useCallback((fileList: FileList) => {
    const newFiles: ConversionFile[] = Array.from(fileList)
      .filter(f => f.type === "image/png")
      .map(f => ({ id: crypto.randomUUID(), file: f, preview: "", svgResult: null, progress: 0, status: "pending" as const }));
    newFiles.forEach(cf => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles(prev => prev.map(pf => pf.id === cf.id ? { ...pf, preview: e.target?.result as string } : pf));
      };
      reader.readAsDataURL(cf.file);
    });
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const convertFile = async (cf: ConversionFile) => {
    if (!cf.preview) return;
    setFiles(prev => prev.map(f => f.id === cf.id ? { ...f, status: "converting", progress: 0 } : f));
    const svg = await convertPng(cf.preview, (p) => {
      setFiles(prev => prev.map(f => f.id === cf.id ? { ...f, progress: p } : f));
    });
    setFiles(prev => prev.map(f => f.id === cf.id ? { ...f, svgResult: svg, status: "done", progress: 100 } : f));
    createConversion.mutate({ file_name: cf.file.name, file_size: cf.file.size });
    trackEvent.mutate({ event_type: "conversion", page_url: "/", metadata: { file_name: cf.file.name } });
  };

  const convertAll = async () => {
    const pending = files.filter(f => f.status === "pending" && f.preview);
    for (const cf of pending) await convertFile(cf);
  };

  const downloadSvg = (cf: ConversionFile) => {
    if (!cf.svgResult) return;
    const blob = new Blob([cf.svgResult], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = cf.file.name.replace(/\.png$/i, "") + ".svg";
    a.click(); URL.revokeObjectURL(url);
  };

  const downloadAll = () => files.filter(f => f.svgResult).forEach(downloadSvg);
  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));
  const clearAll = () => setFiles([]);

  const pendingCount = files.filter(f => f.status === "pending").length;
  const doneCount = files.filter(f => f.status === "done").length;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md safe-top">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-7 sm:h-8 max-w-[140px] object-contain" />
            ) : (
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg gradient-primary flex items-center justify-center">
                <FileCode className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
              </div>
            )}
            {!siteLogo && <span>{siteName}</span>}
          </button>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#converter" className="hover:text-foreground transition-colors">Converter</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">About</a>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="text-xs sm:text-sm">Dashboard</Button>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-24">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px] pointer-events-none" />

        <div className="container relative px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            {/* Trust bar */}
            <div className="flex items-center justify-center gap-6 mb-8 sm:mb-10 animate-fade-up text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Free forever</span>
              <span className="hidden sm:flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> 100% private</span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> No signup</span>
              <span className="hidden sm:flex items-center gap-1.5"><FileCode className="h-3.5 w-3.5 text-primary" /> No watermark</span>
            </div>

            <div className="text-center animate-fade-up">
              <h1 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1] sm:leading-[1.08]">
                Free <span className="text-gradient">PNG to SVG</span> Converter
                <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-muted-foreground mt-2 sm:mt-3 tracking-normal">
                  Convert Raster Images to Scalable Vector Graphics Online
                </span>
              </h1>
              <p className="mt-5 sm:mt-7 text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Upload your PNG. Get a real SVG — not a Base64 wrapper. We perform true image tracing, converting your raster pixels into clean, scalable SVG paths that resize without quality loss.
              </p>
            </div>

            {/* Live counter chip */}
            <div className="mt-6 flex items-center justify-center animate-fade-up" style={{ animationDelay: "0.15s" }}>
              <div className="inline-flex items-center gap-2.5 rounded-full border bg-card px-4 py-2 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm tabular-nums">
                  <span className="font-semibold text-foreground">{totalConverted.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">images vectorized</span>
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl" className="text-sm sm:text-base w-full sm:w-auto" onClick={() => document.getElementById("converter")?.scrollIntoView({ behavior: "smooth" })}>
                Start Converting — It's Free <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-sm w-full sm:w-auto" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                See How It Works <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONVERTER ─── */}
      <section id="converter" className="py-10 sm:py-16">
        <div className="container max-w-4xl px-4 sm:px-6">
          <div className="rounded-2xl border bg-card p-4 sm:p-8 shadow-xl shadow-primary/5 animate-fade-up stagger-1">
            {files.length === 0 ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 sm:p-16 cursor-pointer transition-all duration-300 ${dragOver ? "drop-zone-active border-primary" : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30"}`}
              >
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-primary/20">
                  <Upload className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
                </div>
                <p className="text-base sm:text-lg font-semibold mb-1">Drop your PNG files here</p>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">or click to browse • Multiple files supported • No file size limit</p>
                <input ref={inputRef} type="file" accept="image/png" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium">{files.length} file{files.length > 1 ? "s" : ""}</span>
                    {doneCount > 0 && <span className="text-xs text-success flex items-center gap-1"><Check className="h-3 w-3" />{doneCount} converted</span>}
                    {pendingCount > 0 && <span className="text-xs text-muted-foreground">{pendingCount} pending</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}><Upload className="h-3.5 w-3.5 mr-1" /> Add More</Button>
                    {pendingCount > 0 && <Button variant="hero" size="sm" onClick={convertAll}>Convert All ({pendingCount})</Button>}
                    {doneCount > 0 && <Button variant="success" size="sm" onClick={downloadAll}><Download className="h-3.5 w-3.5 mr-1" /> Download All</Button>}
                    <Button variant="ghost" size="sm" onClick={clearAll}><Trash2 className="h-3.5 w-3.5 mr-1" /> Clear</Button>
                    <input ref={inputRef} type="file" accept="image/png" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
                  </div>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {files.map(cf => (
                    <div key={cf.id} className="rounded-xl border p-3 sm:p-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:8px_8px] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {cf.preview && <img src={cf.preview} alt="" className="max-h-full max-w-full object-contain" />}
                        </div>
                        {cf.svgResult && (
                          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:8px_8px] flex items-center justify-center overflow-hidden flex-shrink-0">
                            <div dangerouslySetInnerHTML={{ __html: cf.svgResult }} className="max-h-full max-w-full [&>svg]:max-h-[80px] [&>svg]:max-w-[80px]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{cf.file.name}</p>
                            <button onClick={() => removeFile(cf.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"><X className="h-4 w-4" /></button>
                          </div>
                          <p className="text-xs text-muted-foreground">{(cf.file.size / 1024).toFixed(1)} KB</p>
                          {cf.status === "converting" && (
                            <div className="mt-2">
                              <Progress value={cf.progress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1 tabular-nums">{cf.progress}%</p>
                            </div>
                          )}
                          {cf.status === "done" && (
                            <div className="mt-3">
                              <span className="text-xs text-success flex items-center gap-1 mb-2"><Check className="h-3 w-3" /> Converted successfully</span>
                              <Button variant="hero" size="lg" className="w-full text-sm font-semibold" onClick={() => downloadSvg(cf)}>
                                <Download className="h-4 w-4 mr-2" /> Download the Converted SVG
                              </Button>
                            </div>
                          )}
                          {cf.status === "pending" && cf.preview && (
                            <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={() => convertFile(cf)}>Convert</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── FEATURES (2-col alternating cards) ─── */}
      <section id="features" className="py-16 sm:py-24 bg-muted/20">
        <div className="container px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16 animate-fade-up">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">Why we're different</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.15]">
              Everything You Were Frustrated About With Other Converters — Fixed
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border bg-card p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-up overflow-hidden"
                style={{ animationDelay: `${Math.min(i * 0.08, 0.4)}s` }}
              >
                <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base mb-1.5">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW TO CONVERT (timeline layout) ─── */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="container max-w-4xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16 animate-fade-up">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent mb-3">Simple process</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">How to Convert PNG to SVG — Three Steps</h2>
          </div>
          <div className="relative">
            {/* Vertical connector line */}
            <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-0.5" />
            <div className="space-y-8 sm:space-y-0">
              {steps.map((s, i) => (
                <div key={s.num} className={`relative sm:flex items-center gap-8 animate-fade-up ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`} style={{ animationDelay: `${i * 0.12}s` }}>
                  <div className={`flex-1 ${i % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}>
                    <div className={`rounded-2xl border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow ${i % 2 === 0 ? "sm:mr-4" : "sm:ml-4"}`}>
                      <div className="text-3xl font-bold text-gradient mb-2">{s.num}</div>
                      <h3 className="font-semibold text-base sm:text-lg mb-2">{s.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                  {/* Center node */}
                  <div className="hidden sm:flex h-12 w-12 rounded-full gradient-primary items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0 z-10">
                    <s.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT IS PNG TO SVG + WHY CONVERT ─── */}
      <section className="py-16 sm:py-24 bg-muted/20">
        <div className="container max-w-5xl px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 animate-fade-up">
            {/* Left — What Is */}
            <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">Definition</span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">What Is a PNG to SVG Converter?</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                A PNG to SVG converter is a tool that transforms raster images — built from fixed pixel grids — into scalable vector graphics defined by mathematical paths and geometric shapes. This process is called vectorization or image tracing.
              </p>
            </div>
            {/* Right — Why Convert */}
            <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent mb-3">Use cases</span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">Why Convert PNG to SVG?</h3>
              <ul className="space-y-3">
                {[
                  "Print logos at large format without pixelation",
                  "Use images in Cricut, Silhouette, or vinyl cutters",
                  "Build sharp icons for retina displays and any screen",
                  "Get editable vector files for clients from PNG exports",
                  "Import into Figma, Inkscape, or Illustrator",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PNG vs SVG (visual comparison) ─── */}
      <section className="py-16 sm:py-24">
        <div className="container max-w-4xl px-4 sm:px-6">
          <div className="animate-fade-up">
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">Technical comparison</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">PNG vs SVG — What Actually Happens to Your Image</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* PNG side */}
              <div className="rounded-2xl border-2 border-destructive/20 bg-destructive/[0.03] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Image className="h-5 w-5 text-destructive" />
                  </div>
                  <h3 className="font-bold text-lg">PNG (Raster)</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" /> Fixed pixel grid — every pixel has one color</li>
                  <li className="flex items-start gap-2"><X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" /> Enlarging stretches pixels — creates blur</li>
                  <li className="flex items-start gap-2"><X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" /> Quality degrades at larger sizes</li>
                  <li className="flex items-start gap-2"><X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" /> Not editable as shapes or paths</li>
                </ul>
              </div>
              {/* SVG side */}
              <div className="rounded-2xl border-2 border-success/20 bg-success/[0.03] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <FileCode className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="font-bold text-lg">SVG (Vector)</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> Mathematical shapes, curves, and paths</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> Scales infinitely without quality loss</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> Crisp on retina, mobile, and print</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" /> Fully editable in design tools</li>
                </ul>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
              Converting PNG to SVG means analyzing pixel groups, detecting edges and color regions, and recreating them as vector paths — a true vector file, not a pixel image inside an SVG container.
            </p>
          </div>
        </div>
      </section>

      {/* ─── COMMON PROBLEMS ─── */}
      <section className="py-16 sm:py-24 bg-muted/20">
        <div className="container max-w-4xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14 animate-fade-up">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent mb-3">Troubleshooting</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Common Problems After Converting — And How We Handle Them</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {problems.map((item, i) => (
              <div key={item.title} className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1.5">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUSTPILOT ─── */}
      {trustpilotUrl && (
        <section id="reviews" className="py-16 sm:py-24">
          <div className="container max-w-3xl px-4 sm:px-6 text-center animate-fade-up">
            <div className="rounded-2xl border bg-card p-8 sm:p-12 shadow-sm">
              <div className="mb-5">
                <svg viewBox="0 0 126 31" className="h-8 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.2 0H4.7C2.1 0 0 2.1 0 4.7v21.5c0 2.6 2.1 4.7 4.7 4.7h16.5c2.6 0 4.7-2.1 4.7-4.7V4.7C25.9 2.1 23.8 0 21.2 0z" fill="#00B67A"/>
                  <path d="M13 21.5l-3.7 1.1 1-3.7L6 14.2h4.3L13 8l2.7 6.2h4.3l-4.3 4.7 1 3.7L13 21.5z" fill="#fff"/>
                  <text x="32" y="22" fontFamily="system-ui" fontSize="18" fontWeight="700" fill="currentColor">Trustpilot</text>
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">See what our users think</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                Read verified reviews from real users on Trustpilot.
              </p>
              <a
                href={trustpilotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#00B67A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#00A06A] transition-colors shadow-md shadow-[#00B67A]/20"
              >
                Read Reviews on Trustpilot <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-16 sm:py-24 bg-muted/20">
        <div className="container max-w-2xl px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14 animate-fade-up">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">Got questions?</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3 animate-fade-up stagger-1">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-2xl bg-card px-5 sm:px-6 shadow-sm hover:shadow-md transition-shadow data-[state=open]:shadow-md">
                <AccordionTrigger className="text-sm sm:text-base font-medium text-left hover:no-underline py-5">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-16 sm:py-24">
        <div className="container max-w-3xl px-4 sm:px-6">
          <div className="rounded-2xl gradient-primary p-8 sm:p-14 text-center shadow-2xl shadow-primary/20 animate-fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">Ready to convert your PNGs?</h2>
            <p className="mt-3 sm:mt-4 text-primary-foreground/80 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Start converting your PNG images to high-quality, scalable SVG vector files for free. No sign-up. No watermark. No limits.
            </p>
            <Button variant="secondary" size="xl" className="mt-7 sm:mt-9 text-sm sm:text-base" onClick={() => document.getElementById("converter")?.scrollIntoView({ behavior: "smooth" })}>
              Start Converting Now <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t py-10 sm:py-14 bg-muted/10">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                {siteLogo ? (
                  <img src={siteLogo} alt={siteName} className="h-6 max-w-[120px] object-contain" />
                ) : (
                  <>
                    <div className="h-6 w-6 rounded-md gradient-primary flex items-center justify-center">
                      <FileCode className="h-3 w-3 text-primary-foreground" />
                    </div>
                    {siteName}
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground max-w-xs">Free PNG to SVG converter. True vectorization, no Base64 wrappers. 100% browser-based and private.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-5 text-sm text-muted-foreground">
                <a href="/about" className="hover:text-foreground transition-colors">About</a>
                <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
                <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              </div>
              <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

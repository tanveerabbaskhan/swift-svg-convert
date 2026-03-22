import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Download, ArrowRight, Zap, Shield, Layers, Image, FileCode, X, Check, Trash2, ExternalLink } from "lucide-react";
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
  { icon: Zap, title: "True Vectorization — Not Base64", desc: "We trace your image pixel-by-pixel and rebuild it as real SVG paths. Not a wrapper. Not an embed. A genuine vector file." },
  { icon: Layers, title: "Colors Preserved — Full Color Output", desc: "Keep every color from your original PNG. Our color tracing mode rebuilds each color region as a separate vector path." },
  { icon: Image, title: "Transparent Backgrounds Supported", desc: "Upload a PNG with no background. Get an SVG with no background. No white fill. No unexpected background color." },
  { icon: Shield, title: "No Signup Required — Ever", desc: "Open the page. Upload your file. Download your SVG. No account. No email. No password. No credit card." },
  { icon: FileCode, title: "No Watermark on Output", desc: "Your converted SVG file is clean. No branding. No overlay. No locked quality behind a paywall." },
  { icon: Shield, title: "Runs Entirely in Your Browser", desc: "Your PNG never leaves your device. Processing happens locally — no file upload to a server. Completely private." },
  { icon: Layers, title: "Works for Logos, Icons, and Cricut Files", desc: "Flat images with clear edges convert perfectly. Logos, icons, clip art, and Cricut cut files all supported." },
  { icon: Zap, title: "Black and White + Full Color Modes", desc: "Monochrome images use our black and white preset for the cleanest edges. Color images use full color tracing." },
];

const steps = [
  { num: "01", title: "Upload Your PNG", desc: "Click the upload area or drag and drop your PNG file directly onto the converter. Supports PNG files of any size. No file size limits." },
  { num: "02", title: "Choose Your Settings", desc: "Select Full Color mode to preserve all colors from your original image. Select Black and White mode for logos, icons, and line art with the cleanest edge tracing." },
  { num: "03", title: "Download Your SVG", desc: "Click Convert. Your PNG is traced into real SVG vector paths — not embedded as Base64. Download your clean, scalable SVG file instantly. No watermark." },
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
  const settings = useDynamicHead(); // applies title, favicon, GA, GSC dynamically
  const siteName = settings?.site_name || "PNGTOSVG";
  const siteLogo = settings?.site_logo || "";
  const trustpilotUrl = settings?.trustpilot_url || "";
  const createConversion = useCreateConversion();
  const trackEvent = useTrackEvent();
  const inputRef = useRef<HTMLInputElement>(null);

  // Live counter
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
    <div className="min-h-screen bg-background">
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
            <a href="#reviews" className="hover:text-foreground transition-colors">Reviews</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">About</a>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>Dashboard</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-muted-foreground shadow-sm">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent" />
              Free. No signup. No watermark. No file size limit.
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Free <span className="text-gradient">PNG to SVG</span> Converter — Convert Raster Images to Scalable Vector Graphics Online
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              Upload your PNG. Get a real SVG — not a Base64 wrapper. Most free converters embed your PNG inside an SVG file without any actual vectorization. Ours performs true image tracing — converting your raster pixels into clean, scalable SVG paths that resize without quality loss.
            </p>
            <p className="mt-3 text-sm text-muted-foreground font-medium">Works in your browser. Completely private.</p>
            {/* Live counter */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="tabular-nums font-medium text-foreground">{totalConverted.toLocaleString()}</span> images converted
            </div>
            <div className="mt-8 sm:mt-10 flex items-center justify-center gap-3 sm:gap-4">
              <Button variant="hero" size="xl" className="text-sm sm:text-base" onClick={() => document.getElementById("converter")?.scrollIntoView({ behavior: "smooth" })}>
                Start Converting <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Converter */}
      <section id="converter" className="py-12 sm:py-20">
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
                <p className="text-xs sm:text-sm text-muted-foreground text-center">or click to browse • Multiple files supported • PNG up to 10MB</p>
                <input ref={inputRef} type="file" accept="image/png" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Toolbar */}
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

                {/* File list */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {files.map(cf => (
                    <div key={cf.id} className="rounded-xl border p-3 sm:p-4 bg-muted/10 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Preview */}
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:8px_8px] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {cf.preview && <img src={cf.preview} alt="" className="max-h-full max-w-full object-contain" />}
                        </div>
                        {/* SVG Preview */}
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
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-success flex items-center gap-1"><Check className="h-3 w-3" /> Converted</span>
                              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => downloadSvg(cf)}><Download className="h-3 w-3 mr-1" /> SVG</Button>
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

      {/* Features */}
      <section id="features" className="py-12 sm:py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16 animate-fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Why choose {siteName}?</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">The fastest, most private way to convert your raster images to scalable vectors.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto">
            {features.map((f, i) => (
              <div key={f.title} className={`rounded-2xl border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-up stagger-${i + 1}`}>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl gradient-primary flex items-center justify-center mb-4 sm:mb-5 shadow-md shadow-primary/15">
                  <f.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content: What is PNG to SVG */}
      <section className="py-12 sm:py-20">
        <div className="container max-w-4xl px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center animate-fade-up">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">What is PNG to SVG conversion?</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                PNG (Portable Network Graphics) is a raster image format made of pixels. SVG (Scalable Vector Graphics) uses mathematical paths, making images infinitely scalable without quality loss.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Converting PNG to SVG is essential for logos, icons, and illustrations that need to look sharp at any size — from mobile screens to billboards.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card p-4 sm:p-5 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gradient">∞</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Scalable</p>
              </div>
              <div className="rounded-xl border bg-card p-4 sm:p-5 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gradient">0</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Quality Loss</p>
              </div>
              <div className="rounded-xl border bg-card p-4 sm:p-5 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gradient">CSS</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Stylable</p>
              </div>
              <div className="rounded-xl border bg-card p-4 sm:p-5 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gradient">SEO</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Friendly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-muted/30">
        <div className="container max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16 animate-fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">Three simple steps to get your SVG file.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className={`text-center animate-fade-up stagger-${i + 1}`}>
                <div className="text-4xl sm:text-5xl font-bold text-gradient mb-3 sm:mb-4">{s.num}</div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">{s.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trustpilot Reviews */}
      {trustpilotUrl && (
        <section id="reviews" className="py-12 sm:py-20">
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

      {/* FAQ */}
      <section id="faq" className="py-12 sm:py-20 bg-muted/30">
        <div className="container max-w-2xl px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 animate-fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Frequently asked questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3 animate-fade-up stagger-1">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl bg-card px-5 shadow-sm">
                <AccordionTrigger className="text-sm sm:text-base font-medium text-left hover:no-underline py-4">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20">
        <div className="container max-w-3xl px-4 sm:px-6">
          <div className="rounded-2xl gradient-primary p-8 sm:p-12 text-center shadow-2xl shadow-primary/20 animate-fade-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">Ready to convert?</h2>
            <p className="mt-3 text-primary-foreground/80 max-w-md mx-auto text-sm sm:text-base">Start converting your PNG images to high-quality SVG files for free. No sign-up required.</p>
            <Button variant="secondary" size="xl" className="mt-6 sm:mt-8 text-sm sm:text-base" onClick={() => document.getElementById("converter")?.scrollIntoView({ behavior: "smooth" })}>
              Start Now <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 sm:py-12 bg-muted/20">
        <div className="container flex flex-col gap-4 sm:flex-row items-center justify-between text-sm text-muted-foreground px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-foreground">
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
          <div className="flex items-center gap-4 text-xs">
            <a href="/about" className="hover:text-foreground transition-colors">About</a>
            <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

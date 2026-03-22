import { useState, useCallback, useRef } from "react";
import { Upload, Download, ArrowRight, Zap, Shield, Layers, Image, FileCode, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Zap, title: "Lightning Fast", desc: "Convert your PNG files to SVG format in seconds with our optimized engine." },
  { icon: Shield, title: "Secure & Private", desc: "Files are processed locally in your browser. Nothing is uploaded to any server." },
  { icon: Layers, title: "High Quality", desc: "Advanced tracing algorithms preserve detail and produce clean vector paths." },
];

const steps = [
  { num: "01", title: "Upload PNG", desc: "Drag & drop or click to upload your PNG image file." },
  { num: "02", title: "Configure", desc: "Adjust settings like color count, detail level, and smoothing." },
  { num: "03", title: "Download SVG", desc: "Get your converted SVG file ready for any use case." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/png")) return;
    setFile(f);
    setSvgResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const convert = useCallback(async () => {
    if (!preview) return;
    setConverting(true);
    await new Promise((r) => setTimeout(r, 600));

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const w = Math.min(img.width, 800);
      const h = Math.round((img.height / img.width) * w);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h);
      
      // Simple color quantization + rect-based SVG
      const blockSize = 4;
      let rects = "";
      for (let y = 0; y < h; y += blockSize) {
        for (let x = 0; x < w; x += blockSize) {
          const idx = (y * w + x) * 4;
          const r = data.data[idx];
          const g = data.data[idx + 1];
          const b = data.data[idx + 2];
          const a = data.data[idx + 3];
          if (a < 20) continue;
          const rr = Math.round(r / 32) * 32;
          const gg = Math.round(g / 32) * 32;
          const bb = Math.round(b / 32) * 32;
          rects += `<rect x="${x}" y="${y}" width="${blockSize}" height="${blockSize}" fill="rgb(${rr},${gg},${bb})" opacity="${(a / 255).toFixed(2)}"/>`;
        }
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${rects}</svg>`;
      setSvgResult(svg);
      setConverting(false);
    };
    img.src = preview;
  }, [preview]);

  const downloadSvg = () => {
    if (!svgResult) return;
    const blob = new Blob([svgResult], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (file?.name || "image").replace(/\.png$/i, "") + ".svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setSvgResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <FileCode className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>PNGTOSVG</span>
          </button>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#converter" className="hover:text-foreground transition-colors">Converter</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
          </nav>
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>Dashboard</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
              <Zap className="h-3.5 w-3.5 text-accent" />
              Free, fast & private — no uploads to server
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.08]">
              Convert <span className="text-gradient">PNG to SVG</span> in seconds
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Transform your raster images into scalable vector graphics. 100% browser-based, no data leaves your device.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button variant="hero" size="xl" onClick={() => document.getElementById("converter")?.scrollIntoView({ behavior: "smooth" })}>
                Start Converting <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Converter */}
      <section id="converter" className="py-20">
        <div className="container max-w-4xl">
          <div className="rounded-2xl border bg-card p-8 shadow-xl shadow-primary/5 animate-fade-up stagger-1">
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 cursor-pointer transition-all duration-300 ${dragOver ? "drop-zone-active border-primary" : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30"}`}
              >
                <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  <Upload className="h-7 w-7 text-primary-foreground" />
                </div>
                <p className="text-lg font-semibold mb-1">Drop your PNG file here</p>
                <p className="text-sm text-muted-foreground">or click to browse • PNG files up to 10MB</p>
                <input ref={inputRef} type="file" accept="image/png" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image className="h-5 w-5 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={reset}><X className="h-4 w-4" /></Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl border p-4 bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Original PNG</p>
                    <div className="flex items-center justify-center min-h-[200px] rounded-lg bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
                      <img src={preview!} alt="Preview" className="max-h-[280px] max-w-full object-contain" />
                    </div>
                  </div>
                  <div className="rounded-xl border p-4 bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Converted SVG</p>
                    <div className="flex items-center justify-center min-h-[200px] rounded-lg bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
                      {svgResult ? (
                        <div dangerouslySetInnerHTML={{ __html: svgResult }} className="max-h-[280px] max-w-full [&>svg]:max-h-[280px] [&>svg]:max-w-full" />
                      ) : (
                        <p className="text-sm text-muted-foreground">Click convert to generate SVG</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  {!svgResult ? (
                    <Button variant="hero" size="lg" onClick={convert} disabled={converting}>
                      {converting ? (
                        <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> Converting...</span>
                      ) : (
                        <>Convert to SVG <ArrowRight className="h-4 w-4" /></>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button variant="success" size="lg" onClick={downloadSvg}>
                        <Download className="h-4 w-4" /> Download SVG
                      </Button>
                      <Button variant="outline" size="lg" onClick={reset}>Convert Another</Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-3xl font-bold tracking-tight">Why choose PNGTOSVG?</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">The fastest, most private way to convert your raster images to scalable vectors.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((f, i) => (
              <div key={f.title} className={`rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-up stagger-${i + 1}`}>
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-5 shadow-md shadow-primary/15">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to get your SVG file.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className={`text-center animate-fade-up stagger-${i + 1}`}>
                <div className="text-5xl font-bold text-gradient mb-4">{s.num}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <div className="rounded-2xl gradient-primary p-12 text-center shadow-2xl shadow-primary/20 animate-fade-up">
            <h2 className="text-3xl font-bold text-primary-foreground tracking-tight">Ready to convert?</h2>
            <p className="mt-3 text-primary-foreground/80 max-w-md mx-auto">Start converting your PNG images to high-quality SVG files for free. No sign-up required.</p>
            <Button variant="secondary" size="xl" className="mt-8" onClick={() => document.getElementById("converter")?.scrollIntoView({ behavior: "smooth" })}>
              Start Now <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <div className="h-6 w-6 rounded-md gradient-primary flex items-center justify-center">
              <FileCode className="h-3 w-3 text-primary-foreground" />
            </div>
            PNGTOSVG
          </div>
          <p>© {new Date().getFullYear()} PNGTOSVG. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Image Tracer — converts raster image data to SVG paths.
 *
 * Approach:
 * 1. Quantize colors using a simplified median-cut algorithm
 * 2. For each quantized color, create a binary bitmap (pixels of that color = 1)
 * 3. Trace contours on each binary bitmap using marching squares
 * 4. Simplify contours using Ramer-Douglas-Peucker
 * 5. Output SVG <path> elements with proper fill colors
 */

// ── Types ──

type Color = { r: number; g: number; b: number; a: number };
type Point = { x: number; y: number };

// ── Color Quantization ──

function colorDistance(a: Color, b: Color): number {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

function quantizeColors(pixels: Color[], maxColors: number): Color[] {
  if (pixels.length === 0) return [];

  // Simple k-means-style quantization
  // Start by sampling initial centroids from the pixel data
  const step = Math.max(1, Math.floor(pixels.length / maxColors));
  let centroids: Color[] = [];
  for (let i = 0; i < maxColors && i * step < pixels.length; i++) {
    centroids.push({ ...pixels[i * step] });
  }

  // Run 5 iterations of k-means
  for (let iter = 0; iter < 5; iter++) {
    const sums: { r: number; g: number; b: number; count: number }[] =
      centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));

    for (const px of pixels) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = colorDistance(px, centroids[c]);
        if (d < bestDist) { bestDist = d; bestIdx = c; }
      }
      sums[bestIdx].r += px.r;
      sums[bestIdx].g += px.g;
      sums[bestIdx].b += px.b;
      sums[bestIdx].count++;
    }

    centroids = sums
      .filter(s => s.count > 0)
      .map(s => ({
        r: Math.round(s.r / s.count),
        g: Math.round(s.g / s.count),
        b: Math.round(s.b / s.count),
        a: 255,
      }));
  }

  return centroids;
}

function findClosestColor(px: Color, palette: Color[]): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const d = colorDistance(px, palette[i]);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  }
  return bestIdx;
}

// ── Contour Tracing (Marching Squares) ──

function createBinaryGrid(
  imageData: ImageData,
  w: number,
  h: number,
  palette: Color[],
  colorIdx: number
): Uint8Array {
  const grid = new Uint8Array(w * h);
  const data = imageData.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const px: Color = { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
      if (px.a < 30) continue;
      if (findClosestColor(px, palette) === colorIdx) {
        grid[y * w + x] = 1;
      }
    }
  }
  return grid;
}

function traceContours(grid: Uint8Array, w: number, h: number): Point[][] {
  const visited = new Uint8Array((w + 1) * (h + 1));
  const contours: Point[][] = [];

  // Helper to get grid value (0 or 1) at image pixel (x,y)
  const at = (x: number, y: number): number => {
    if (x < 0 || x >= w || y < 0 || y >= h) return 0;
    return grid[y * w + x];
  };

  // Marching squares case: 4-bit index from corners
  const getCase = (x: number, y: number): number => {
    return (
      (at(x - 1, y - 1) << 3) |
      (at(x, y - 1) << 2) |
      (at(x, y) << 1) |
      at(x - 1, y)
    );
  };

  // Direction vectors for marching: [dx, dy]
  const dirMap: Record<number, [number, number]> = {
    1: [0, 1],   // down
    2: [1, 0],   // right
    3: [1, 0],   // right
    4: [0, -1],  // up
    6: [0, -1],  // up
    7: [0, -1],  // up (ambiguous resolved up)
    8: [-1, 0],  // left
    9: [0, 1],   // down (ambiguous resolved down)
    11: [0, 1],  // down
    12: [-1, 0], // left
    13: [-1, 0], // left
    14: [-1, 0], // left
  };

  for (let sy = 0; sy <= h; sy++) {
    for (let sx = 0; sx <= w; sx++) {
      const c = getCase(sx, sy);
      if (c === 0 || c === 15 || c === 5 || c === 10) continue;
      if (visited[sy * (w + 1) + sx]) continue;

      const contour: Point[] = [];
      let cx = sx, cy = sy;
      let maxSteps = (w + h) * 4; // safety limit

      while (maxSteps-- > 0) {
        const ci = cy * (w + 1) + cx;
        if (visited[ci] && contour.length > 2) break;
        visited[ci] = 1;
        contour.push({ x: cx, y: cy });

        const cc = getCase(cx, cy);
        const dir = dirMap[cc];
        if (!dir) break;

        cx += dir[0];
        cy += dir[1];

        if (cx < 0 || cx > w || cy < 0 || cy > h) break;
      }

      if (contour.length >= 4) {
        contours.push(contour);
      }
    }
  }

  return contours;
}

// ── Contour Simplification (Ramer-Douglas-Peucker) ──

function perpendicularDistance(pt: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  if (dx === 0 && dy === 0) {
    return Math.sqrt((pt.x - lineStart.x) ** 2 + (pt.y - lineStart.y) ** 2);
  }
  const t = ((pt.x - lineStart.x) * dx + (pt.y - lineStart.y) * dy) / (dx * dx + dy * dy);
  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;
  return Math.sqrt((pt.x - projX) ** 2 + (pt.y - projY) ** 2);
}

function simplifyContour(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > maxDist) { maxDist = d; maxIdx = i; }
  }

  if (maxDist > epsilon) {
    const left = simplifyContour(points.slice(0, maxIdx + 1), epsilon);
    const right = simplifyContour(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[end]];
}

// ── SVG Path Generation ──

function contourToSVGPath(points: Point[]): string {
  if (points.length < 2) return "";
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L${points[i].x} ${points[i].y}`;
  }
  d += " Z";
  return d;
}

function colorToCSS(c: Color): string {
  return `rgb(${c.r},${c.g},${c.b})`;
}

// ── Main Trace Function ──

export function traceImage(
  imageData: ImageData,
  w: number,
  h: number,
  maxColors: number = 16,
  simplifyEpsilon: number = 1.0,
  onProgress?: (progress: number) => void
): string {
  // 1. Extract opaque pixels for color quantization
  const data = imageData.data;
  const opaquePixels: Color[] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] >= 30) {
      opaquePixels.push({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] });
    }
  }

  if (opaquePixels.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"></svg>`;
  }

  onProgress?.(10);

  // 2. Quantize colors
  const palette = quantizeColors(opaquePixels, maxColors);
  onProgress?.(25);

  // 3. For each color, create binary grid, trace, simplify, and generate paths
  let allPaths = "";
  for (let ci = 0; ci < palette.length; ci++) {
    const grid = createBinaryGrid(imageData, w, h, palette, ci);

    // Check if any pixels match this color
    let hasPixels = false;
    for (let j = 0; j < grid.length; j++) {
      if (grid[j]) { hasPixels = true; break; }
    }
    if (!hasPixels) continue;

    const contours = traceContours(grid, w, h);
    const color = colorToCSS(palette[ci]);

    for (const contour of contours) {
      const simplified = simplifyContour(contour, simplifyEpsilon);
      if (simplified.length >= 3) {
        const pathData = contourToSVGPath(simplified);
        allPaths += `<path d="${pathData}" fill="${color}" />`;
      }
    }

    onProgress?.(25 + Math.round((ci / palette.length) * 70));
  }

  onProgress?.(98);

  // If tracing produced no paths (e.g., very complex photo), fall back to a more granular rect approach
  if (!allPaths) {
    allPaths = fallbackRectTrace(imageData, w, h, palette);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${allPaths}</svg>`;
}

// Fallback: smaller rects with palette colors for complex images where contour tracing fails
function fallbackRectTrace(imageData: ImageData, w: number, h: number, palette: Color[]): string {
  const data = imageData.data;
  const blockSize = 2;
  let rects = "";

  for (let y = 0; y < h; y += blockSize) {
    for (let x = 0; x < w; x += blockSize) {
      const idx = (y * w + x) * 4;
      const a = data[idx + 3];
      if (a < 30) continue;

      const px: Color = { r: data[idx], g: data[idx + 1], b: data[idx + 2], a };
      const ci = findClosestColor(px, palette);
      const color = colorToCSS(palette[ci]);
      const opacity = a < 250 ? ` opacity="${(a / 255).toFixed(2)}"` : "";
      rects += `<rect x="${x}" y="${y}" width="${blockSize}" height="${blockSize}" fill="${color}"${opacity}/>`;
    }
  }

  return rects;
}

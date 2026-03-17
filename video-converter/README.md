# Media Converter

A fully in-browser media converter — no server uploads, no backend. Video conversion is powered by [ffmpeg.wasm](https://ffmpegwasm.netlify.app/), and image conversion uses the native Canvas API and [SVGO](https://svgo.dev).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (strict) |
| Bundler | Vite 8 |
| Styling | Tailwind CSS (utility classes only) |
| State | Zustand |
| UI primitives | Radix UI (tabs, slider, progress, select) |
| Video engine | ffmpeg.wasm (WebAssembly) |
| Image engine | Canvas API (`toBlob`) + SVGO |

## Getting Started

```bash
cd video-converter
npm install
npm run dev        # http://localhost:5173
```

### Other Scripts

```bash
npm run build      # tsc -b && vite build → dist/
npm run preview    # serve dist/ locally
npm run lint       # eslint
```

## How It Works

### Video Conversion

1. User drops a video file (MP4, WebM, MOV, AVI, MKV — up to 4 GB)
2. Configures output format, compression (CRF or bitrate), trim range, and audio settings
3. Clicks **Convert** — ffmpeg.wasm loads (~31 MB, first run only) and runs entirely in a Web Worker
4. Output is downloaded directly from the browser

### Image Conversion

- **Raster images** (PNG, JPG, WebP, GIF) → converted to WebP or AVIF via the Canvas API at a configurable quality level
- **SVG files** → optimised with SVGO (removes metadata, comments, redundant attributes)

### SharedArrayBuffer

ffmpeg.wasm requires `SharedArrayBuffer`, which needs these HTTP headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These are set automatically by `vite.config.ts` (dev/preview) and `public/_headers` (Netlify/Cloudflare Pages).

## Architecture

```
src/
├── App.tsx                        # Root — tabbed layout (Video | Image)
├── main.tsx                       # ReactDOM entry point
├── index.css                      # Tailwind directives
│
├── types/
│   └── converter.ts               # Shared TypeScript interfaces
│
├── store/
│   ├── converterStore.ts          # Video conversion state (Zustand)
│   └── imageConverterStore.ts     # Image conversion state (Zustand)
│
├── hooks/
│   ├── useFFmpeg.ts               # ffmpeg.wasm lifecycle (load/exec/read/write)
│   ├── useConversion.ts           # Video conversion pipeline orchestration
│   └── useVideoMetadata.ts        # Extract duration/dimensions from <video>
│
├── lib/
│   ├── formatDefinitions.ts       # Output format metadata (codecs, MIME types)
│   ├── ffmpegCommands.ts          # Pure ffmpeg argument builders
│   ├── rasterConvert.ts           # Canvas API image conversion
│   ├── svgoOptimize.ts            # SVG optimisation via SVGO
│   └── utils.ts                   # cn() helper (clsx + tailwind-merge)
│
├── components/
│   ├── ui/                        # Radix-based primitives (button, slider, etc.)
│   ├── dropzone/DropZone.tsx      # Video file drag-and-drop input
│   ├── controls/                  # Format, compression, trim, audio controls
│   ├── conversion/                # Progress panel + download result card
│   └── image/                     # Image dropzone, format controls, result card
│
public/
├── ffmpeg/
│   ├── ffmpeg-core.js             # ffmpeg.wasm JS loader
│   └── ffmpeg-core.wasm           # ffmpeg.wasm binary (~31 MB)
└── _headers                       # COOP/COEP for static hosting
```

### State Management

Each tab has its own Zustand store — switching tabs preserves state in both.

- **`converterStore`** — input file, output format, compression/trim/audio config, conversion status, progress, logs, output blob
- **`imageConverterStore`** — input file, SVG detection, output format, quality, result blob

### Data Flow (Video)

```
DropZone → converterStore.setInputFile()
               ↓
FormatSelector / CompressionControls / TrimControls / AudioControls
               ↓ (update store slices)
ConversionPanel → useConversion.convert()
               ↓
useFFmpeg.load() → writeFile() → exec(buildArgs()) → readFile()
               ↓
converterStore.setOutput(blob) → DownloadResult
```

### Data Flow (Image)

```
ImageDropZone → imageConverterStore.setFile()
               ↓
ImageFormatControls (quality, format) — or SVGO info card for SVGs
               ↓
convert() button → rasterConvert() or optimizeSvg()
               ↓
imageConverterStore.result → ImageResultCard (download)
```

## Deployment

Build produces a static `dist/` folder — deploy to any static host:

```bash
npm run build
# deploy dist/ to Netlify, Cloudflare Pages, Vercel, etc.
```

The `public/_headers` file ensures COOP/COEP headers are set on Netlify and Cloudflare Pages. For other hosts, configure these headers manually.

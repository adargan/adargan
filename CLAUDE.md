# CLAUDE.md

This file provides guidance to AI assistants (Claude and others) working in this repository.

## Repository Overview

**Repository:** adargan/adargan
**Project:** `video-converter/` — a fully in-browser video converter powered by ffmpeg.wasm

## Current State

The `video-converter/` app is complete and production-ready. It converts video files entirely in the browser — no server upload required.

## Git Workflow

### Branch Naming
- Feature/AI branches must follow: `claude/<description>-<session-id>`
- Example: `claude/add-claude-documentation-OyrWl`

### Commit Style
- Use concise, imperative-mood commit messages (e.g., "Add authentication module")
- Reference issue numbers when applicable: `Fix login bug (#42)`
- Keep commits focused — one logical change per commit

### Push Protocol
Always push with tracking:
```bash
git push -u origin <branch-name>
```

If push fails due to network issues, retry with exponential backoff: 2s, 4s, 8s, 16s.

**Never push to `main`/`master` directly without explicit permission.**

## Development Setup

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS + ffmpeg.wasm + Zustand

```bash
cd video-converter
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve dist/ locally
```

**Required browser flags (already handled by vite.config.ts):**

The dev server and `vite preview` both set:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

These are required for `SharedArrayBuffer` (used by ffmpeg.wasm). `public/_headers` sets them for Netlify/Cloudflare Pages deployments.

## Testing

No automated test suite yet. Before committing, verify manually:
1. `npm run build` must succeed with zero TypeScript errors
2. Drop a video file → configure → convert → download and verify the output plays

## Build & CI

```bash
npm run build   # tsc -b && vite build
```

Output goes to `video-converter/dist/`. The `dist/` directory is gitignored.

## Code Conventions

- **Language:** TypeScript strict mode
- **Style:** Tailwind utility classes only (no custom CSS except `index.css` for Tailwind directives)
- **Components:** Functional components + React hooks; no class components
- **State:** Zustand store at `src/store/converterStore.ts`; no Redux/Context for app state
- **Imports:** Use `@/` alias for `src/` (configured in `tsconfig.json` and `vite.config.ts`)

## Key Directories

| Path | Purpose |
|------|---------|
| `video-converter/src/types/converter.ts` | All shared TypeScript types |
| `video-converter/src/lib/formatDefinitions.ts` | Output format metadata (codecs, MIME types) |
| `video-converter/src/lib/ffmpegCommands.ts` | Pure ffmpeg arg builders |
| `video-converter/src/store/converterStore.ts` | Zustand store — single source of truth |
| `video-converter/src/hooks/useFFmpeg.ts` | ffmpeg.wasm lifecycle (load/exec/read/write) |
| `video-converter/src/hooks/useConversion.ts` | Full conversion pipeline orchestration |
| `video-converter/src/hooks/useVideoMetadata.ts` | Reads duration/dimensions from `<video>` |
| `video-converter/src/components/dropzone/` | File drag-and-drop input |
| `video-converter/src/components/controls/` | Format, compression, trim, audio controls |
| `video-converter/src/components/conversion/` | Progress panel + download result card |
| `video-converter/src/components/ui/` | Radix-based primitives (Button, Slider, etc.) |
| `video-converter/public/ffmpeg/` | ffmpeg-core.js + ffmpeg-core.wasm (static assets) |

## AI Assistant Instructions

1. **Read this file first** before starting any task in this repository.
2. **Update this file** when you make significant structural changes (new directories, new tooling, dependency changes).
3. **Keep secrets out of commits** — use environment variables or secret managers.
4. **Follow the branch rules** above — always work on the designated `claude/` branch.
5. **Prefer small, focused commits** over large atomic changes when possible.
6. **Run `npm run build` before committing** — zero TypeScript errors required.
7. **Ask before destructive operations** (force-push, branch deletion, database drops, etc.).

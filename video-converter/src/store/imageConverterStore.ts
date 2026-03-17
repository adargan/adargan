import { create } from 'zustand'
import type { RasterOutputFormat } from '@/lib/rasterConvert'
import { convertRaster } from '@/lib/rasterConvert'
import { optimizeSvg } from '@/lib/svgoOptimize'

export type ImageConversionStatus = 'idle' | 'converting' | 'done' | 'error'

export interface ImageConversionResult {
  blob: Blob
  url: string
  filename: string
  outputSize: number
}

export interface ImageQueueItem {
  id: string
  file: File
  isSvg: boolean
  previewUrl: string
  status: ImageConversionStatus
  result: ImageConversionResult | null
  error: string | null
}

interface ImageConverterState {
  files: Map<string, ImageQueueItem>
  outputFormat: RasterOutputFormat
  quality: number
  batchStatus: 'idle' | 'converting' | 'done'

  addFiles: (files: File[]) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  setOutputFormat: (fmt: RasterOutputFormat) => void
  setQuality: (q: number) => void
  convertAll: () => Promise<void>
  reset: () => void
}

const MAX_FILES = 50

function isSvgFile(file: File): boolean {
  return file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
}

function outputFilename(original: string, isSvg: boolean, format: RasterOutputFormat): string {
  const base = original.replace(/\.[^.]+$/, '')
  return isSvg ? `${base}.optimized.svg` : `${base}.${format}`
}

function revokeAll(files: Map<string, ImageQueueItem>) {
  for (const item of files.values()) {
    URL.revokeObjectURL(item.previewUrl)
    if (item.result?.url) URL.revokeObjectURL(item.result.url)
  }
}

export const useImageConverterStore = create<ImageConverterState>((set, get) => ({
  files: new Map(),
  outputFormat: 'webp',
  quality: 82,
  batchStatus: 'idle',

  addFiles: (newFiles) => {
    const current = new Map(get().files)
    for (const file of newFiles) {
      if (current.size >= MAX_FILES) break
      const id = crypto.randomUUID()
      current.set(id, {
        id,
        file,
        isSvg: isSvgFile(file),
        previewUrl: URL.createObjectURL(file),
        status: 'idle',
        result: null,
        error: null,
      })
    }
    set({ files: current, batchStatus: 'idle' })
  },

  removeFile: (id) => {
    const current = new Map(get().files)
    const item = current.get(id)
    if (item) {
      URL.revokeObjectURL(item.previewUrl)
      if (item.result?.url) URL.revokeObjectURL(item.result.url)
    }
    current.delete(id)
    set({ files: current, batchStatus: current.size === 0 ? 'idle' : get().batchStatus })
  },

  clearFiles: () => {
    revokeAll(get().files)
    set({ files: new Map(), batchStatus: 'idle' })
  },

  setOutputFormat: (fmt) => set({ outputFormat: fmt }),
  setQuality: (q) => set({ quality: q }),

  convertAll: async () => {
    const { files, outputFormat, quality } = get()
    if (files.size === 0) return

    set({ batchStatus: 'converting' })

    const CONCURRENCY = 3
    const pending = Array.from(files.values()).filter((f) => f.status !== 'done')

    for (let i = 0; i < pending.length; i += CONCURRENCY) {
      const chunk = pending.slice(i, i + CONCURRENCY)

      await Promise.all(
        chunk.map(async (item) => {
          // Mark converting
          const current = new Map(get().files)
          const entry = current.get(item.id)
          if (!entry) return
          entry.status = 'converting'
          set({ files: current })

          try {
            let blob: Blob
            if (item.isSvg) {
              const text = await item.file.text()
              const optimized = optimizeSvg(text)
              blob = new Blob([optimized], { type: 'image/svg+xml' })
            } else {
              blob = await convertRaster(item.file, outputFormat, quality)
            }

            const url = URL.createObjectURL(blob)
            const filename = outputFilename(item.file.name, item.isSvg, outputFormat)

            const updated = new Map(get().files)
            const e = updated.get(item.id)
            if (e) {
              e.status = 'done'
              e.result = { blob, url, filename, outputSize: blob.size }
              set({ files: updated })
            }
          } catch (err) {
            const updated = new Map(get().files)
            const e = updated.get(item.id)
            if (e) {
              e.status = 'error'
              e.error = err instanceof Error ? err.message : 'Conversion failed'
              set({ files: updated })
            }
          }
        }),
      )
    }

    set({ batchStatus: 'done' })
  },

  reset: () => {
    revokeAll(get().files)
    set({ files: new Map(), batchStatus: 'idle' })
  },
}))

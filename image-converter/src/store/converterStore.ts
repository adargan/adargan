import { create } from 'zustand'
import type { ConverterState, RasterOutputFormat } from '@/types/converter'
import { convertRaster } from '@/lib/rasterConvert'
import { optimizeSvg } from '@/lib/svgoOptimize'

function outputFilename(original: string, isSvg: boolean, format: RasterOutputFormat): string {
  const base = original.replace(/\.[^.]+$/, '')
  return isSvg ? `${base}.optimized.svg` : `${base}.${format}`
}

export const useConverterStore = create<ConverterState>((set, get) => ({
  file: null,
  isSvg: false,
  outputFormat: 'webp',
  quality: 82,
  status: 'idle',
  result: null,
  error: null,

  setFile: (file) => {
    const prev = get().result?.url
    if (prev) URL.revokeObjectURL(prev)
    if (!file) {
      set({ file: null, isSvg: false, status: 'idle', result: null, error: null })
      return
    }
    set({
      file,
      isSvg: file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg'),
      status: 'idle',
      result: null,
      error: null,
    })
  },

  setOutputFormat: (fmt: RasterOutputFormat) => set({ outputFormat: fmt }),

  setQuality: (q) => set({ quality: q }),

  convert: async () => {
    const { file, isSvg, outputFormat, quality } = get()
    if (!file) return

    set({ status: 'converting', result: null, error: null })

    try {
      let blob: Blob

      if (isSvg) {
        const text = await file.text()
        const optimized = optimizeSvg(text)
        blob = new Blob([optimized], { type: 'image/svg+xml' })
      } else {
        blob = await convertRaster(file, outputFormat, quality)
      }

      const prev = get().result?.url
      if (prev) URL.revokeObjectURL(prev)
      const url = URL.createObjectURL(blob)
      const filename = outputFilename(file.name, isSvg, outputFormat)

      set({
        status: 'done',
        result: { blob, url, filename, outputSize: blob.size },
      })
    } catch (err) {
      set({
        status: 'error',
        error: err instanceof Error ? err.message : 'Conversion failed',
      })
    }
  },

  reset: () => {
    const prev = get().result?.url
    if (prev) URL.revokeObjectURL(prev)
    set({ file: null, isSvg: false, status: 'idle', result: null, error: null })
  },
}))

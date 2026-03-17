import { create } from 'zustand'
import { optimizePdf, type PdfOptimizeOptions } from '@/lib/pdfOptimize'

export type PdfStatus = 'idle' | 'optimizing' | 'done' | 'error'

export interface PdfResult {
  blob: Blob
  url: string
  filename: string
  outputSize: number
}

interface PdfState {
  file: File | null
  status: PdfStatus
  result: PdfResult | null
  error: string | null
  options: PdfOptimizeOptions

  setFile: (file: File) => void
  clearFile: () => void
  setOption: <K extends keyof PdfOptimizeOptions>(key: K, value: PdfOptimizeOptions[K]) => void
  optimize: () => Promise<void>
  reset: () => void
}

export const usePdfStore = create<PdfState>((set, get) => ({
  file: null,
  status: 'idle',
  result: null,
  error: null,
  options: {
    removeMetadata: true,
    removeJavaScript: true,
  },

  setFile: (file) => {
    const prev = get().result
    if (prev?.url) URL.revokeObjectURL(prev.url)
    set({ file, status: 'idle', result: null, error: null })
  },

  clearFile: () => {
    const prev = get().result
    if (prev?.url) URL.revokeObjectURL(prev.url)
    set({ file: null, status: 'idle', result: null, error: null })
  },

  setOption: (key, value) =>
    set((s) => ({ options: { ...s.options, [key]: value } })),

  optimize: async () => {
    const { file, options } = get()
    if (!file) return
    set({ status: 'optimizing', error: null })
    try {
      const bytes = await optimizePdf(file, options)
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const filename = file.name.replace(/\.pdf$/i, '.optimized.pdf')
      set({ status: 'done', result: { blob, url, filename, outputSize: blob.size } })
    } catch (err) {
      set({
        status: 'error',
        error: err instanceof Error ? err.message : 'Optimisation failed',
      })
    }
  },

  reset: () => {
    const prev = get().result
    if (prev?.url) URL.revokeObjectURL(prev.url)
    set({ file: null, status: 'idle', result: null, error: null })
  },
}))

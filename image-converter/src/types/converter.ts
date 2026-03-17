export type RasterOutputFormat = 'webp' | 'avif'

export type ConversionStatus = 'idle' | 'converting' | 'done' | 'error'

export interface ConversionResult {
  blob: Blob
  url: string
  filename: string
  outputSize: number
}

export interface ConverterState {
  // Input
  file: File | null
  isSvg: boolean

  // Settings (only used for raster)
  outputFormat: RasterOutputFormat
  quality: number // 1–100

  // Runtime
  status: ConversionStatus
  result: ConversionResult | null
  error: string | null

  // Actions
  setFile: (file: File | null) => void
  setOutputFormat: (fmt: RasterOutputFormat) => void
  setQuality: (q: number) => void
  convert: () => Promise<void>
  reset: () => void
}

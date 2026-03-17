import { create } from 'zustand'
import type {
  VideoMetadata,
  OutputFormat,
  CompressionConfig,
  TrimConfig,
  AudioConfig,
  ConversionStatus,
} from '@/types/converter'

interface ConverterState {
  // ── Input ──────────────────────────────────────────────────────────────────
  inputFile: File | null
  inputObjectUrl: string | null
  videoMetadata: VideoMetadata | null

  // ── Configuration ──────────────────────────────────────────────────────────
  outputFormat: OutputFormat
  compression: CompressionConfig
  trim: TrimConfig
  audio: AudioConfig

  // ── Conversion runtime ─────────────────────────────────────────────────────
  status: ConversionStatus
  progress: number          // 0–100
  processingTime: number    // seconds of output processed so far
  logs: string[]
  errorMessage: string | null

  // ── Output ─────────────────────────────────────────────────────────────────
  outputBlob: Blob | null
  outputObjectUrl: string | null
  outputFilename: string | null
  outputSize: number | null

  // ── Actions ────────────────────────────────────────────────────────────────
  setInputFile: (file: File, objectUrl: string) => void
  setVideoMetadata: (metadata: VideoMetadata) => void
  setOutputFormat: (format: OutputFormat) => void
  updateCompression: (patch: Partial<CompressionConfig>) => void
  updateTrim: (patch: Partial<TrimConfig>) => void
  updateAudio: (patch: Partial<AudioConfig>) => void
  setStatus: (status: ConversionStatus) => void
  setProgress: (progress: number, processingTime: number) => void
  appendLog: (message: string) => void
  setError: (message: string) => void
  setOutput: (blob: Blob, objectUrl: string, filename: string) => void
  reset: () => void
}

const DEFAULT_COMPRESSION: CompressionConfig = {
  mode: 'crf',
  crf: 23,
  videoBitrate: '2000k',
  audioBitrate: '128k',
  preset: 'medium',
  videoCodec: 'copy',
}

const DEFAULT_TRIM: TrimConfig = {
  enabled: false,
  startTime: 0,
  endTime: 0,
  accurateTrim: false,
}

const DEFAULT_AUDIO: AudioConfig = {
  extractOnly: false,
  stripAudio: false,
  codec: 'copy',
  bitrate: '128k',
}

export const useConverterStore = create<ConverterState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  inputFile: null,
  inputObjectUrl: null,
  videoMetadata: null,

  outputFormat: 'mp4',
  compression: DEFAULT_COMPRESSION,
  trim: DEFAULT_TRIM,
  audio: DEFAULT_AUDIO,

  status: 'idle',
  progress: 0,
  processingTime: 0,
  logs: [],
  errorMessage: null,

  outputBlob: null,
  outputObjectUrl: null,
  outputFilename: null,
  outputSize: null,

  // ── Actions ────────────────────────────────────────────────────────────────
  setInputFile: (file, objectUrl) => {
    const prev = get().inputObjectUrl
    if (prev) URL.revokeObjectURL(prev)
    set({
      inputFile: file,
      inputObjectUrl: objectUrl,
      videoMetadata: null,
      status: 'idle',
      progress: 0,
      processingTime: 0,
      logs: [],
      errorMessage: null,
      outputBlob: null,
      outputObjectUrl: null,
      outputFilename: null,
      outputSize: null,
    })
  },

  setVideoMetadata: (metadata) => set({ videoMetadata: metadata }),

  setOutputFormat: (format) => set({ outputFormat: format }),

  updateCompression: (patch) =>
    set((s) => ({ compression: { ...s.compression, ...patch } })),

  updateTrim: (patch) =>
    set((s) => ({ trim: { ...s.trim, ...patch } })),

  updateAudio: (patch) =>
    set((s) => ({ audio: { ...s.audio, ...patch } })),

  setStatus: (status) => set({ status }),

  setProgress: (progress, processingTime) => set({ progress, processingTime }),

  appendLog: (message) =>
    set((s) => ({ logs: [...s.logs.slice(-199), message] })),  // keep last 200 lines

  setError: (message) => set({ status: 'error', errorMessage: message }),

  setOutput: (blob, objectUrl, filename) => {
    const prev = get().outputObjectUrl
    if (prev) URL.revokeObjectURL(prev)
    set({
      status: 'done',
      outputBlob: blob,
      outputObjectUrl: objectUrl,
      outputFilename: filename,
      outputSize: blob.size,
    })
  },

  reset: () => {
    const { inputObjectUrl, outputObjectUrl } = get()
    if (inputObjectUrl) URL.revokeObjectURL(inputObjectUrl)
    if (outputObjectUrl) URL.revokeObjectURL(outputObjectUrl)
    set({
      inputFile: null,
      inputObjectUrl: null,
      videoMetadata: null,
      status: 'idle',
      progress: 0,
      processingTime: 0,
      logs: [],
      errorMessage: null,
      outputBlob: null,
      outputObjectUrl: null,
      outputFilename: null,
      outputSize: null,
      trim: DEFAULT_TRIM,
      audio: DEFAULT_AUDIO,
    })
  },
}))

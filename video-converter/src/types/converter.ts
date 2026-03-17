// ─── Video Metadata ───────────────────────────────────────────────────────────

export interface VideoMetadata {
  duration: number       // seconds
  width: number
  height: number
  fileSize: number       // bytes
  fileName: string
  mimeType: string
}

// ─── Output Formats ───────────────────────────────────────────────────────────

export type OutputFormat =
  | 'mp4'
  | 'webm'
  | 'mov'
  | 'avi'
  | 'mkv'
  | 'gif'
  | 'mp3'
  | 'aac'
  | 'wav'

export type VideoCodec = 'libx264' | 'libx265' | 'libvpx-vp9' | 'libaom-av1' | 'copy'
export type AudioCodec = 'aac' | 'libmp3lame' | 'opus' | 'pcm_s16le' | 'copy'

// ─── Compression Config ───────────────────────────────────────────────────────

export type CompressionMode = 'crf' | 'bitrate'
export type EncoderPreset = 'ultrafast' | 'fast' | 'medium' | 'slow' | 'veryslow'

export interface CompressionConfig {
  mode: CompressionMode
  crf: number            // 0–51
  videoBitrate: string   // e.g. "2000k"
  audioBitrate: string   // e.g. "128k"
  preset: EncoderPreset
  videoCodec: VideoCodec
}

// ─── Trim Config ──────────────────────────────────────────────────────────────

export interface TrimConfig {
  enabled: boolean
  startTime: number      // seconds
  endTime: number        // seconds
  accurateTrim: boolean  // -ss after -i (slow but frame-accurate)
}

// ─── Audio Config ─────────────────────────────────────────────────────────────

export interface AudioConfig {
  extractOnly: boolean   // audio-only output
  stripAudio: boolean    // mute output video
  codec: AudioCodec
  bitrate: string        // e.g. "192k"
}

// ─── Conversion Status ────────────────────────────────────────────────────────

export type ConversionStatus =
  | 'idle'
  | 'loading-ffmpeg'
  | 'converting'
  | 'done'
  | 'error'

// ─── Format Definition (for formatDefinitions.ts) ────────────────────────────

export interface FormatDefinition {
  value: OutputFormat
  label: string
  extension: string
  mimeType: string
  isAudioOnly: boolean
  defaultVideoCodec: VideoCodec
  defaultAudioCodec: AudioCodec
  supportsTransparency: boolean
}

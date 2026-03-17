import type { CompressionConfig, TrimConfig, AudioConfig, OutputFormat } from '@/types/converter'
import { FORMAT_MAP } from '@/lib/formatDefinitions'

interface BuildArgsOptions {
  inputExt: string
  outputFormat: OutputFormat
  compression: CompressionConfig
  trim: TrimConfig
  audio: AudioConfig
}

/**
 * Builds the ffmpeg argument array for a conversion.
 * Input file is always named "input.<ext>" and output "output.<ext>" in the virtual FS.
 */
export function buildArgs(options: BuildArgsOptions): string[] {
  const { inputExt, outputFormat, compression, trim, audio } = options
  const format = FORMAT_MAP[outputFormat]
  const outputExt = format?.extension ?? outputFormat
  const args: string[] = []

  // ── Trim: fast seek (before -i) ───────────────────────────────────────────
  if (trim.enabled && !trim.accurateTrim) {
    args.push('-ss', String(trim.startTime))
    if (trim.endTime > 0) {
      args.push('-to', String(trim.endTime))
    }
  }

  args.push('-i', `input.${inputExt}`)

  // ── Trim: accurate seek (after -i) ────────────────────────────────────────
  if (trim.enabled && trim.accurateTrim) {
    args.push('-ss', String(trim.startTime))
    if (trim.endTime > 0) {
      args.push('-to', String(trim.endTime))
    }
  }

  // ── Audio-only extraction ─────────────────────────────────────────────────
  if (audio.extractOnly || format?.isAudioOnly) {
    args.push('-vn')
    args.push('-c:a', audio.codec)
    if (audio.bitrate) args.push('-b:a', audio.bitrate)
    args.push(`output.${outputExt}`)
    return args
  }

  // ── Strip audio ───────────────────────────────────────────────────────────
  if (audio.stripAudio) {
    args.push('-an')
  }

  // ── GIF: special palette pipeline ────────────────────────────────────────
  if (outputFormat === 'gif') {
    args.push('-vf', 'fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse')
    args.push('-loop', '0')
    args.push(`output.${outputExt}`)
    return args
  }

  // ── Video codec ───────────────────────────────────────────────────────────
  const videoCodec = compression.videoCodec !== 'copy'
    ? compression.videoCodec
    : (format?.defaultVideoCodec ?? 'libx264')

  args.push('-c:v', videoCodec)

  // CRF or bitrate
  if (compression.mode === 'crf') {
    if (videoCodec === 'libx264' || videoCodec === 'libx265') {
      args.push('-crf', String(compression.crf))
      args.push('-preset', compression.preset)
    } else if (videoCodec === 'libvpx-vp9') {
      args.push('-crf', String(compression.crf))
      args.push('-b:v', '0')  // required for VP9 CRF mode
    } else if (videoCodec === 'libaom-av1') {
      args.push('-crf', String(compression.crf))
      args.push('-b:v', '0')
    }
  } else {
    args.push('-b:v', compression.videoBitrate)
  }

  // ── Audio codec ───────────────────────────────────────────────────────────
  if (!audio.stripAudio) {
    const audioCodec = audio.codec !== 'copy'
      ? audio.codec
      : (format?.defaultAudioCodec ?? 'aac')
    args.push('-c:a', audioCodec)
    if (audio.bitrate) args.push('-b:a', audio.bitrate)
  }

  args.push(`output.${outputExt}`)
  return args
}

/** Returns the input file extension from a File object */
export function getInputExtension(file: File): string {
  const parts = file.name.split('.')
  return parts.length > 1 ? (parts.pop() ?? 'mp4').toLowerCase() : 'mp4'
}

/** Builds the suggested output filename */
export function buildOutputFilename(inputName: string, outputFormat: OutputFormat): string {
  const format = FORMAT_MAP[outputFormat]
  const ext = format?.extension ?? outputFormat
  const base = inputName.replace(/\.[^/.]+$/, '')
  return `${base}_converted.${ext}`
}

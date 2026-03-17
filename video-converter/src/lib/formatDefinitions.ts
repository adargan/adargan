import type { FormatDefinition } from '@/types/converter'

export const FORMAT_DEFINITIONS: FormatDefinition[] = [
  {
    value: 'mp4',
    label: 'MP4 (H.264)',
    extension: 'mp4',
    mimeType: 'video/mp4',
    isAudioOnly: false,
    defaultVideoCodec: 'libx264',
    defaultAudioCodec: 'aac',
    supportsTransparency: false,
  },
  {
    value: 'webm',
    label: 'WebM (VP9)',
    extension: 'webm',
    mimeType: 'video/webm',
    isAudioOnly: false,
    defaultVideoCodec: 'libvpx-vp9',
    defaultAudioCodec: 'opus',
    supportsTransparency: true,
  },
  {
    value: 'mov',
    label: 'MOV (H.264)',
    extension: 'mov',
    mimeType: 'video/quicktime',
    isAudioOnly: false,
    defaultVideoCodec: 'libx264',
    defaultAudioCodec: 'aac',
    supportsTransparency: false,
  },
  {
    value: 'avi',
    label: 'AVI',
    extension: 'avi',
    mimeType: 'video/x-msvideo',
    isAudioOnly: false,
    defaultVideoCodec: 'libx264',
    defaultAudioCodec: 'aac',
    supportsTransparency: false,
  },
  {
    value: 'mkv',
    label: 'MKV (H.264)',
    extension: 'mkv',
    mimeType: 'video/x-matroska',
    isAudioOnly: false,
    defaultVideoCodec: 'libx264',
    defaultAudioCodec: 'aac',
    supportsTransparency: false,
  },
  {
    value: 'gif',
    label: 'GIF (animated)',
    extension: 'gif',
    mimeType: 'image/gif',
    isAudioOnly: false,
    defaultVideoCodec: 'copy',
    defaultAudioCodec: 'copy',
    supportsTransparency: true,
  },
  {
    value: 'mp3',
    label: 'MP3 (audio only)',
    extension: 'mp3',
    mimeType: 'audio/mpeg',
    isAudioOnly: true,
    defaultVideoCodec: 'copy',
    defaultAudioCodec: 'libmp3lame',
    supportsTransparency: false,
  },
  {
    value: 'aac',
    label: 'AAC (audio only)',
    extension: 'aac',
    mimeType: 'audio/aac',
    isAudioOnly: true,
    defaultVideoCodec: 'copy',
    defaultAudioCodec: 'aac',
    supportsTransparency: false,
  },
  {
    value: 'wav',
    label: 'WAV (audio only)',
    extension: 'wav',
    mimeType: 'audio/wav',
    isAudioOnly: true,
    defaultVideoCodec: 'copy',
    defaultAudioCodec: 'pcm_s16le',
    supportsTransparency: false,
  },
]

export const FORMAT_MAP = Object.fromEntries(
  FORMAT_DEFINITIONS.map((f) => [f.value, f])
) as Record<string, FormatDefinition>

export function getFormatByValue(value: string): FormatDefinition | undefined {
  return FORMAT_MAP[value]
}

import { useConverterStore } from '@/store/converterStore'
import type { AudioCodec } from '@/types/converter'

const AUDIO_CODECS: { value: AudioCodec; label: string }[] = [
  { value: 'copy', label: 'Same as input' },
  { value: 'aac', label: 'AAC' },
  { value: 'libmp3lame', label: 'MP3' },
  { value: 'opus', label: 'Opus' },
  { value: 'pcm_s16le', label: 'PCM 16-bit (WAV)' },
]

const BITRATES = ['64k', '96k', '128k', '192k', '256k', '320k']

export function AudioControls() {
  const audio = useConverterStore((s) => s.audio)
  const update = useConverterStore((s) => s.updateAudio)
  const outputFormat = useConverterStore((s) => s.outputFormat)

  const isVideoFormat = !['mp3', 'aac', 'wav'].includes(outputFormat)

  return (
    <div className="space-y-4">
      {/* Strip audio (video only) */}
      {isVideoFormat && !audio.extractOnly && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={audio.stripAudio}
            onChange={(e) => update({ stripAudio: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Remove audio</span>
            <p className="text-xs text-gray-400 mt-0.5">Output video will be muted</p>
          </div>
        </label>
      )}

      {/* Extract audio only (video → audio) */}
      {isVideoFormat && !audio.stripAudio && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={audio.extractOnly}
            onChange={(e) => update({ extractOnly: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">Extract audio only</span>
            <p className="text-xs text-gray-400 mt-0.5">Output will be audio — ignores output format</p>
          </div>
        </label>
      )}

      {/* Audio codec */}
      {!audio.stripAudio && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Audio codec</label>
          <select
            value={audio.codec}
            onChange={(e) => update({ codec: e.target.value as AudioCodec })}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AUDIO_CODECS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Audio bitrate */}
      {!audio.stripAudio && audio.codec !== 'copy' && audio.codec !== 'pcm_s16le' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Audio bitrate</label>
          <div className="flex flex-wrap gap-2">
            {BITRATES.map((br) => (
              <button
                key={br}
                type="button"
                onClick={() => update({ bitrate: br })}
                className={[
                  'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                  audio.bitrate === br
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300',
                ].join(' ')}
              >
                {br}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

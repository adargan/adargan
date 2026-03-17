import { useConverterStore } from '@/store/converterStore'
import { Slider } from '@/components/ui/slider'
import type { VideoCodec, EncoderPreset, CompressionMode } from '@/types/converter'

const VIDEO_CODECS: { value: VideoCodec; label: string }[] = [
  { value: 'copy', label: 'Same as input' },
  { value: 'libx264', label: 'H.264' },
  { value: 'libx265', label: 'H.265 / HEVC' },
  { value: 'libvpx-vp9', label: 'VP9' },
  { value: 'libaom-av1', label: 'AV1 (slow)' },
]

const PRESETS: { value: EncoderPreset; label: string }[] = [
  { value: 'ultrafast', label: 'Ultrafast' },
  { value: 'fast', label: 'Fast' },
  { value: 'medium', label: 'Medium' },
  { value: 'slow', label: 'Slow' },
  { value: 'veryslow', label: 'Very slow' },
]

export function CompressionControls() {
  const compression = useConverterStore((s) => s.compression)
  const update = useConverterStore((s) => s.updateCompression)
  const outputFormat = useConverterStore((s) => s.outputFormat)

  // GIF/audio-only formats don't need compression controls
  if (outputFormat === 'gif') {
    return (
      <p className="text-sm text-gray-500 italic">
        GIF output uses automatic 15fps, 480px-wide palette generation.
      </p>
    )
  }

  const isAudioOnly = ['mp3', 'aac', 'wav'].includes(outputFormat)
  if (isAudioOnly) {
    return (
      <p className="text-sm text-gray-500 italic">
        Audio-only output — no video codec settings needed.
      </p>
    )
  }

  const crfSupported =
    compression.videoCodec === 'libx264' ||
    compression.videoCodec === 'libx265' ||
    compression.videoCodec === 'libvpx-vp9' ||
    compression.videoCodec === 'libaom-av1'

  return (
    <div className="space-y-4">
      {/* Video codec */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Video codec</label>
        <select
          value={compression.videoCodec}
          onChange={(e) => update({ videoCodec: e.target.value as VideoCodec })}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {VIDEO_CODECS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Mode toggle */}
      {crfSupported && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quality mode</label>
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            {(['crf', 'bitrate'] as CompressionMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => update({ mode })}
                className={[
                  'flex-1 py-2 text-sm font-medium transition-colors',
                  compression.mode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                {mode === 'crf' ? 'CRF (quality)' : 'Bitrate'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CRF slider */}
      {crfSupported && compression.mode === 'crf' && (
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Quality (CRF)</label>
            <span className="text-sm font-mono text-gray-600">
              {compression.crf} {compression.crf <= 18 ? '· High' : compression.crf >= 32 ? '· Low' : '· Medium'}
            </span>
          </div>
          <Slider
            min={0}
            max={51}
            step={1}
            value={[compression.crf]}
            onValueChange={([val]) => update({ crf: val })}
          />
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>Best quality (large)</span>
            <span>Smallest (low quality)</span>
          </div>
        </div>
      )}

      {/* Bitrate input */}
      {(!crfSupported || compression.mode === 'bitrate') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video bitrate (e.g. 2000k, 4M)
          </label>
          <input
            type="text"
            value={compression.videoBitrate}
            onChange={(e) => update({ videoBitrate: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2000k"
          />
        </div>
      )}

      {/* Encoder preset */}
      {(compression.videoCodec === 'libx264' || compression.videoCodec === 'libx265') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Encoder preset</label>
          <select
            value={compression.preset}
            onChange={(e) => update({ preset: e.target.value as EncoderPreset })}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">Slower = better compression at same quality</p>
        </div>
      )}
    </div>
  )
}

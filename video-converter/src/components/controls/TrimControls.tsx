import { useConverterStore } from '@/store/converterStore'
import { Slider } from '@/components/ui/slider'

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = (seconds % 60).toFixed(1)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${s.padStart(4, '0')}`
  return `${String(m).padStart(2, '0')}:${s.padStart(4, '0')}`
}

export function TrimControls() {
  const trim = useConverterStore((s) => s.trim)
  const update = useConverterStore((s) => s.updateTrim)
  const duration = useConverterStore((s) => s.videoMetadata?.duration ?? 0)

  const isAudioOnly = useConverterStore((s) =>
    ['mp3', 'aac', 'wav'].includes(s.outputFormat)
  )

  if (!duration) {
    return <p className="text-sm text-gray-500 italic">Load a video to enable trimming.</p>
  }

  return (
    <div className="space-y-4">
      {/* Enable toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          role="switch"
          aria-checked={trim.enabled}
          onClick={() => update({ enabled: !trim.enabled })}
          className={[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            trim.enabled ? 'bg-blue-600' : 'bg-gray-700',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
              trim.enabled ? 'translate-x-6' : 'translate-x-1',
            ].join(' ')}
          />
        </div>
        <span className="text-sm font-medium text-gray-300">Enable trim</span>
      </label>

      {trim.enabled && (
        <>
          {/* Range slider (dual thumb) */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-mono text-gray-400">{formatTime(trim.startTime)}</span>
              <span className="text-xs text-gray-500">
                clip length: {formatTime(trim.endTime - trim.startTime)}
              </span>
              <span className="text-xs font-mono text-gray-400">{formatTime(trim.endTime)}</span>
            </div>
            <Slider
              min={0}
              max={duration}
              step={0.1}
              value={[trim.startTime, trim.endTime]}
              onValueChange={([start, end]) => {
                update({ startTime: start, endTime: end })
              }}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0:00</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Manual inputs */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1">Start (s)</label>
              <input
                type="number"
                min={0}
                max={trim.endTime - 0.1}
                step={0.1}
                value={trim.startTime.toFixed(1)}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(parseFloat(e.target.value), trim.endTime - 0.1))
                  update({ startTime: isNaN(v) ? 0 : v })
                }}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-400 mb-1">End (s)</label>
              <input
                type="number"
                min={trim.startTime + 0.1}
                max={duration}
                step={0.1}
                value={trim.endTime.toFixed(1)}
                onChange={(e) => {
                  const v = Math.min(duration, Math.max(parseFloat(e.target.value), trim.startTime + 0.1))
                  update({ endTime: isNaN(v) ? duration : v })
                }}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Accurate trim */}
          {!isAudioOnly && (
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trim.accurateTrim}
                onChange={(e) => update({ accurateTrim: e.target.checked })}
                className="mt-0.5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-300">Frame-accurate trim</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Slower but precise to the exact frame. Default seeks to the nearest keyframe.
                </p>
              </div>
            </label>
          )}
        </>
      )}
    </div>
  )
}

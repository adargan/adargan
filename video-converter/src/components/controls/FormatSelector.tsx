import { useConverterStore } from '@/store/converterStore'
import { FORMAT_DEFINITIONS } from '@/lib/formatDefinitions'
import type { OutputFormat } from '@/types/converter'

const VIDEO_FORMATS = FORMAT_DEFINITIONS.filter((f) => !f.isAudioOnly)
const AUDIO_FORMATS = FORMAT_DEFINITIONS.filter((f) => f.isAudioOnly)

interface FormatButtonProps {
  label: string
  value: OutputFormat
  selected: boolean
  onClick: (v: OutputFormat) => void
}

function FormatButton({ label, value, selected, onClick }: FormatButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={[
        'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

export function FormatSelector() {
  const outputFormat = useConverterStore((s) => s.outputFormat)
  const setOutputFormat = useConverterStore((s) => s.setOutputFormat)
  const updateAudio = useConverterStore((s) => s.updateAudio)

  const handleSelect = (format: OutputFormat) => {
    setOutputFormat(format)
    const def = FORMAT_DEFINITIONS.find((f) => f.value === format)
    if (def?.isAudioOnly) {
      updateAudio({ extractOnly: true })
    } else {
      updateAudio({ extractOnly: false })
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Video</p>
        <div className="flex flex-wrap gap-2">
          {VIDEO_FORMATS.map((f) => (
            <FormatButton
              key={f.value}
              label={f.label}
              value={f.value}
              selected={outputFormat === f.value}
              onClick={handleSelect}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Audio only</p>
        <div className="flex flex-wrap gap-2">
          {AUDIO_FORMATS.map((f) => (
            <FormatButton
              key={f.value}
              label={f.label}
              value={f.value}
              selected={outputFormat === f.value}
              onClick={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

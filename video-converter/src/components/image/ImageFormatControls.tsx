import { useEffect, useState } from 'react'
import { useImageConverterStore } from '@/store/imageConverterStore'
import { supportsFormat } from '@/lib/rasterConvert'
import type { RasterOutputFormat } from '@/lib/rasterConvert'

const FORMATS: { value: RasterOutputFormat; label: string; description: string }[] = [
  { value: 'webp', label: 'WebP', description: 'Excellent compression, wide support (Chrome, Firefox, Safari 14+)' },
  { value: 'avif', label: 'AVIF', description: 'Best compression, modern browsers only (Chrome 94+, Firefox 113+, Safari 16.4+)' },
]

export function ImageFormatControls() {
  const { outputFormat, quality, setOutputFormat, setQuality } = useImageConverterStore()
  const [avifSupported, setAvifSupported] = useState<boolean | null>(null)

  useEffect(() => {
    supportsFormat('avif').then(setAvifSupported)
  }, [])

  return (
    <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-4">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Output format</p>
        <div className="grid grid-cols-2 gap-2">
          {FORMATS.map((fmt) => {
            const disabled = fmt.value === 'avif' && avifSupported === false
            const selected = outputFormat === fmt.value
            return (
              <button
                key={fmt.value}
                disabled={disabled}
                onClick={() => setOutputFormat(fmt.value)}
                title={disabled ? 'Your browser does not support AVIF encoding' : fmt.description}
                className={[
                  'rounded-lg border px-4 py-2.5 text-left transition-colors text-sm',
                  selected
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : disabled
                      ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/40',
                ].join(' ')}
              >
                <span className="font-semibold">{fmt.label}</span>
                {disabled && <span className="ml-2 text-xs text-gray-400">(unsupported)</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Quality</p>
          <span className="text-sm font-semibold text-gray-900">{quality}</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>Smaller file</span>
          <span>Better quality</span>
        </div>
      </div>
    </div>
  )
}

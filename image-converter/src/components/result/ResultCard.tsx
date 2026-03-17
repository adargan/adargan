import { useConverterStore } from '@/store/converterStore'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function savingsBadge(original: number, output: number) {
  const pct = ((original - output) / original) * 100
  if (pct > 0) return { label: `${pct.toFixed(1)}% smaller`, color: 'text-green-700 bg-green-50 border-green-200' }
  if (pct < 0) return { label: `${Math.abs(pct).toFixed(1)}% larger`, color: 'text-orange-700 bg-orange-50 border-orange-200' }
  return { label: 'No change', color: 'text-gray-600 bg-gray-50 border-gray-200' }
}

export function ResultCard() {
  const { file, status, result, error } = useConverterStore()

  if (status === 'error' && error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">Conversion failed</p>
        <p className="mt-1 text-xs text-red-600">{error}</p>
      </div>
    )
  }

  if (status !== 'done' || !result || !file) return null

  const badge = savingsBadge(file.size, result.outputSize)

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-green-800">Done!</p>
        <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex gap-4 text-xs text-gray-600">
        <div>
          <span className="text-gray-400">Original</span>
          <p className="font-semibold text-gray-800 mt-0.5">{formatBytes(file.size)}</p>
        </div>
        <div className="text-gray-300">→</div>
        <div>
          <span className="text-gray-400">Output</span>
          <p className="font-semibold text-gray-800 mt-0.5">{formatBytes(result.outputSize)}</p>
        </div>
      </div>

      <a
        href={result.url}
        download={result.filename}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download {result.filename}
      </a>
    </div>
  )
}

import { useImageConverterStore } from '@/store/imageConverterStore'
import type { ImageQueueItem } from '@/store/imageConverterStore'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function savingsBadge(original: number, output: number) {
  const pct = ((original - output) / original) * 100
  if (pct > 0) return { label: `${pct.toFixed(1)}% smaller`, color: 'text-green-400 bg-green-950 border-green-700' }
  if (pct < 0) return { label: `${Math.abs(pct).toFixed(1)}% larger`, color: 'text-orange-400 bg-orange-950 border-orange-700' }
  return { label: 'No change', color: 'text-gray-400 bg-gray-800 border-gray-700' }
}

function SingleResult({ item }: { item: ImageQueueItem }) {
  if (!item.result) return null
  const badge = savingsBadge(item.file.size, item.result.outputSize)

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center gap-3">
        <img
          src={item.result.url}
          alt="Converted"
          className="flex-shrink-0 w-12 h-12 rounded-lg object-cover bg-gray-800 border border-gray-700"
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-300 truncate">{item.result.filename}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatBytes(item.file.size)} → {formatBytes(item.result.outputSize)}
            <span className={`ml-2 text-xs font-semibold border rounded-full px-1.5 py-0.5 ${badge.color}`}>
              {badge.label}
            </span>
          </p>
        </div>
        <a
          href={item.result.url}
          download={item.result.filename}
          className="flex-shrink-0 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition-colors"
        >
          Download
        </a>
      </div>
    </div>
  )
}

export function ImageResultCard() {
  const { files, batchStatus, clearFiles } = useImageConverterStore()
  const fileList = Array.from(files.values())
  const doneItems = fileList.filter((f) => f.status === 'done')
  const errorItems = fileList.filter((f) => f.status === 'error')

  if (doneItems.length === 0 && errorItems.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Errors */}
      {errorItems.length > 0 && (
        <div className="rounded-xl border border-red-700 bg-red-950/40 p-4 space-y-1">
          <p className="text-sm font-medium text-red-400">
            {errorItems.length} file{errorItems.length > 1 ? 's' : ''} failed
          </p>
          {errorItems.map((item) => (
            <p key={item.id} className="text-xs text-red-500">
              {item.file.name}: {item.error}
            </p>
          ))}
        </div>
      )}

      {/* Successes */}
      {doneItems.length > 0 && (
        <div className="rounded-xl border border-green-700 bg-green-950/30 space-y-0 divide-y divide-green-900">
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-green-300">
              {doneItems.length} file{doneItems.length > 1 ? 's' : ''} converted
            </p>
            {batchStatus === 'done' && (
              <button
                onClick={clearFiles}
                className="text-xs text-green-500 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          {doneItems.map((item) => (
            <SingleResult key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

import { useConverterStore } from '@/store/converterStore'
import { buttonVariants } from '@/components/ui/button'

function formatBytes(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function DownloadResult() {
  const status = useConverterStore((s) => s.status)
  const outputObjectUrl = useConverterStore((s) => s.outputObjectUrl)
  const outputFilename = useConverterStore((s) => s.outputFilename)
  const outputSize = useConverterStore((s) => s.outputSize)
  const inputSize = useConverterStore((s) => s.inputFile?.size ?? null)

  if (status !== 'done' || !outputObjectUrl || !outputFilename) return null

  const savings =
    inputSize && outputSize
      ? Math.round((1 - outputSize / inputSize) * 100)
      : null

  return (
    <div className="rounded-xl border border-green-700 bg-green-950/40 p-4 flex items-center gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-900 flex items-center justify-center">
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-100 truncate">{outputFilename}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatBytes(outputSize)}
          {savings !== null && savings > 0 && (
            <span className="ml-1 text-green-400 font-medium">· {savings}% smaller</span>
          )}
          {savings !== null && savings < 0 && (
            <span className="ml-1 text-orange-400 font-medium">· {Math.abs(savings)}% larger</span>
          )}
        </p>
      </div>
      <a
        href={outputObjectUrl}
        download={outputFilename}
        className={buttonVariants({ size: 'sm' })}
      >
        Download
      </a>
    </div>
  )
}

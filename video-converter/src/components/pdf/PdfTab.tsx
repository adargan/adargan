import { useCallback, useRef, useState } from 'react'
import { usePdfStore } from '@/store/pdfStore'

const MAX_BYTES = 200 * 1024 * 1024 // 200 MB

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function savingsBadge(original: number, output: number) {
  const pct = ((original - output) / original) * 100
  if (pct > 0) return { label: `${pct.toFixed(1)}% smaller`, color: 'text-green-400 bg-green-950 border-green-700' }
  if (pct < 0) return { label: `${Math.abs(pct).toFixed(1)}% larger`, color: 'text-orange-400 bg-orange-950 border-orange-700' }
  return { label: 'No change', color: 'text-gray-400 bg-gray-800 border-gray-700' }
}

export function PdfTab() {
  const { file, status, result, error, options, setFile, setOption, optimize, reset } = usePdfStore()
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (f: File) => {
      setValidationError(null)
      const ext = f.name.split('.').pop()?.toLowerCase()
      if (f.type !== 'application/pdf' && ext !== 'pdf') {
        setValidationError('Please select a PDF file.')
        return
      }
      if (f.size > MAX_BYTES) {
        setValidationError(`File too large (${formatBytes(f.size)}). Max 200 MB.`)
        return
      }
      setFile(f)
    },
    [setFile],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) handleFile(f)
    },
    [handleFile],
  )

  const isOptimizing = status === 'optimizing'

  return (
    <div className="space-y-8">
      {/* Drop zone / file display */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">1. Input file</h2>
        {file ? (
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-950 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
            </div>
            {!isOptimizing && (
              <button onClick={reset} className="flex-shrink-0 text-xs text-gray-500 hover:text-red-400 transition-colors">
                Remove
              </button>
            )}
          </div>
        ) : (
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={[
              'cursor-pointer rounded-xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors',
              isDragging
                ? 'border-red-500 bg-red-950/30'
                : 'border-gray-700 bg-gray-900 hover:border-red-500 hover:bg-red-950/20',
            ].join(' ')}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = '' }}
            />
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-950">
              <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-300">Tap to select a PDF, or drop it here</p>
            <p className="mt-1 text-xs text-gray-500">Up to 200 MB</p>
            {validationError && (
              <p className="mt-3 text-xs text-red-400 font-medium">{validationError}</p>
            )}
          </div>
        )}
      </div>

      {/* Options */}
      {file && status !== 'done' && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">2. Options</h2>
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.removeMetadata}
                onChange={(e) => setOption('removeMetadata', e.target.checked)}
                className="mt-0.5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-300">Remove metadata</span>
                <p className="text-xs text-gray-500 mt-0.5">Strips title, author, keywords, and producer info</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.removeJavaScript}
                onChange={(e) => setOption('removeJavaScript', e.target.checked)}
                className="mt-0.5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-300">Remove JavaScript</span>
                <p className="text-xs text-gray-500 mt-0.5">Removes embedded JS actions from the Names catalog</p>
              </div>
            </label>
            <p className="text-xs text-gray-600 pt-1 border-t border-gray-800">
              The PDF is always re-serialised with object streams enabled, which often reduces file size.
            </p>
          </div>
        </div>
      )}

      {/* Optimise button */}
      {file && status !== 'done' && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">3. Optimise</h2>
          <button
            onClick={() => void optimize()}
            disabled={isOptimizing}
            className={[
              'w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors',
              isOptimizing ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500',
            ].join(' ')}
          >
            {isOptimizing ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Optimising…
              </span>
            ) : (
              'Optimise PDF'
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {status === 'error' && error && (
        <div className="rounded-lg border border-red-700 bg-red-950/50 px-4 py-3">
          <p className="text-sm font-medium text-red-400">{error}</p>
          <button onClick={reset} className="mt-1 text-xs text-red-400 hover:underline">
            Try again
          </button>
        </div>
      )}

      {/* Result */}
      {status === 'done' && result && file && (
        <div className="rounded-xl border border-green-700 bg-green-950/30 p-4 flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-900 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-100 truncate">{result.filename}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatBytes(file.size)} → {formatBytes(result.outputSize)}
              {(() => {
                const b = savingsBadge(file.size, result.outputSize)
                return (
                  <span className={`ml-2 text-xs font-semibold border rounded-full px-1.5 py-0.5 ${b.color}`}>
                    {b.label}
                  </span>
                )
              })()}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <a
              href={result.url}
              download={result.filename}
              className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition-colors"
            >
              Download
            </a>
            <button
              onClick={reset}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-gray-700 transition-colors"
            >
              New file
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

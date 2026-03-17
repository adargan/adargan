import { useCallback, useRef, useState } from 'react'
import { useConverterStore } from '@/store/converterStore'

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]
const ACCEPTED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
const MAX_BYTES = 50 * 1024 * 1024 // 50 MB

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function DropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { file, isSvg, setFile, reset } = useConverterStore()

  const handleFile = useCallback(
    (f: File) => {
      setValidationError(null)
      const ext = '.' + (f.name.split('.').pop()?.toLowerCase() ?? '')
      const typeOk = ACCEPTED_TYPES.includes(f.type) || ACCEPTED_EXTS.includes(ext)
      if (!typeOk) {
        setValidationError(`Unsupported file type: ${f.type || ext}`)
        return
      }
      if (f.size > MAX_BYTES) {
        setValidationError(`File too large (${formatBytes(f.size)}). Maximum 50 MB.`)
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

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    e.target.value = ''
  }

  if (file) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          {isSvg ? (
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">
            {formatBytes(file.size)} &middot; {isSvg ? 'SVG' : file.type.split('/')[1].toUpperCase()}
          </p>
        </div>
        <button
          onClick={() => { reset(); inputRef.current?.click() }}
          className="flex-shrink-0 text-xs text-blue-600 hover:underline"
        >
          Change
        </button>
        <input ref={inputRef} type="file" className="hidden" accept={ACCEPTED_EXTS.join(',')} onChange={onInputChange} />
      </div>
    )
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      className={[
        'cursor-pointer rounded-xl border-2 border-dashed p-6 sm:p-10 text-center transition-colors',
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40',
      ].join(' ')}
    >
      <input ref={inputRef} type="file" className="hidden" accept={ACCEPTED_EXTS.join(',')} onChange={onInputChange} />
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700">Tap to select an image, or drop one here</p>
      <p className="mt-1 text-xs text-gray-400">
        JPEG, PNG, WebP, GIF &rarr; WebP / AVIF &middot; SVG &rarr; optimized SVG &middot; up to 50 MB
      </p>
      {validationError && (
        <p className="mt-3 text-xs text-red-600 font-medium">{validationError}</p>
      )}
    </div>
  )
}

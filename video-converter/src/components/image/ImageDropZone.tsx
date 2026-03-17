import { useCallback, useRef, useState } from 'react'
import { useImageConverterStore } from '@/store/imageConverterStore'

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
]
const ACCEPTED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
const MAX_BYTES = 50 * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function isAccepted(f: File): boolean {
  const ext = '.' + (f.name.split('.').pop()?.toLowerCase() ?? '')
  return (ACCEPTED_TYPES.includes(f.type) || ACCEPTED_EXTS.includes(ext)) && f.size <= MAX_BYTES
}

export function ImageDropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { files, addFiles, removeFile, batchStatus } = useImageConverterStore()

  const handleFiles = useCallback(
    (fileList: FileList) => {
      setValidationError(null)
      const valid: File[] = []
      const rejected: string[] = []

      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i]
        if (isAccepted(f)) {
          valid.push(f)
        } else {
          rejected.push(f.name)
        }
      }

      if (rejected.length > 0) {
        setValidationError(`Skipped ${rejected.length} unsupported/too-large file${rejected.length > 1 ? 's' : ''}: ${rejected.slice(0, 3).join(', ')}${rejected.length > 3 ? '…' : ''}`)
      }
      if (valid.length > 0) addFiles(valid)
    },
    [addFiles],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files)
    e.target.value = ''
  }

  const fileList = Array.from(files.values())
  const isConverting = batchStatus === 'converting'

  return (
    <div className="space-y-3">
      {/* File list */}
      {fileList.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 max-h-64 overflow-y-auto">
          {fileList.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                {item.isSvg ? (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatBytes(item.file.size)}
                  {item.status === 'converting' && <span className="ml-2 text-blue-600">Converting…</span>}
                  {item.status === 'done' && <span className="ml-2 text-green-600">Done</span>}
                  {item.status === 'error' && <span className="ml-2 text-red-600">Failed</span>}
                </p>
              </div>
              {!isConverting && (
                <button
                  onClick={() => removeFile(item.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone — always visible so user can add more */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={[
          'cursor-pointer rounded-xl border-2 border-dashed text-center transition-colors',
          fileList.length > 0 ? 'p-4' : 'p-6 sm:p-10',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40',
          isConverting ? 'pointer-events-none opacity-50' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept={ACCEPTED_EXTS.join(',')}
          onChange={onInputChange}
        />
        {fileList.length === 0 ? (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Tap to select images, or drop them here</p>
            <p className="mt-1 text-xs text-gray-400">
              JPEG, PNG, WebP, GIF &rarr; WebP / AVIF &middot; SVG &rarr; optimised SVG &middot; up to 50 MB each
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">Drop more images or click to add</p>
        )}
        {validationError && (
          <p className="mt-3 text-xs text-red-600 font-medium">{validationError}</p>
        )}
      </div>
    </div>
  )
}

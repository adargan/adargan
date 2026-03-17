import { useCallback, useState, useRef } from 'react'
import { useConverterStore } from '@/store/converterStore'
import { useVideoMetadata } from '@/hooks/useVideoMetadata'

const ACCEPTED_TYPES = [
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'video/x-msvideo', 'video/x-matroska', 'video/mpeg', 'video/3gpp',
]
const ACCEPTED_EXTS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogv', '.mpeg', '.3gp', '.ts', '.m4v']
const MAX_BYTES = 4 * 1024 * 1024 * 1024  // 4 GB

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function DropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { setInputFile, inputFile, videoMetadata } = useConverterStore()
  const { extractMetadata } = useVideoMetadata()

  const handleFile = useCallback(async (file: File) => {
    setValidationError(null)

    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    const typeOk = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTS.includes(ext)
    if (!typeOk) {
      setValidationError(`Unsupported file type: ${file.type || ext}. Use a video file.`)
      return
    }
    if (file.size > MAX_BYTES) {
      setValidationError(`File is too large (${formatBytes(file.size)}). Maximum 4 GB.`)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setInputFile(file, objectUrl)

    try {
      await extractMetadata(file, objectUrl)
    } catch {
      // Non-fatal — metadata will just be null
    }
  }, [setInputFile, extractMetadata])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  if (inputFile && videoMetadata) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 10l4.553-2.069A1 1 0 0121 8.88v6.24a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{inputFile.name}</p>
          <p className="text-xs text-gray-500">
            {videoMetadata.width}&times;{videoMetadata.height} &middot; {formatDuration(videoMetadata.duration)} &middot; {formatBytes(inputFile.size)}
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
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
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={[
        'cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors',
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40',
      ].join(' ')}
    >
      <input ref={inputRef} type="file" className="hidden" accept={ACCEPTED_EXTS.join(',')} onChange={onInputChange} />
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700">Drop a video file here, or click to browse</p>
      <p className="mt-1 text-xs text-gray-400">MP4, WebM, MOV, AVI, MKV &middot; up to 4 GB</p>
      {validationError && (
        <p className="mt-3 text-xs text-red-600 font-medium">{validationError}</p>
      )}
    </div>
  )
}

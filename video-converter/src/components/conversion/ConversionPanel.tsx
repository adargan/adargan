import { useRef, useEffect } from 'react'
import { useConverterStore } from '@/store/converterStore'
import { useConversion } from '@/hooks/useConversion'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

function formatTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function ConversionPanel() {
  const { convert, cancel } = useConversion()
  const status = useConverterStore((s) => s.status)
  const progress = useConverterStore((s) => s.progress)
  const processingTime = useConverterStore((s) => s.processingTime)
  const logs = useConverterStore((s) => s.logs)
  const errorMessage = useConverterStore((s) => s.errorMessage)
  const inputFile = useConverterStore((s) => s.inputFile)
  const reset = useConverterStore((s) => s.reset)

  const logRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  const isActive = status === 'converting' || status === 'loading-ffmpeg'
  const canConvert = !!inputFile && !isActive && status !== 'done'

  return (
    <div className="space-y-4">
      {/* Primary action */}
      <div className="flex gap-3">
        {status !== 'done' && (
          <Button
            onClick={convert}
            disabled={!canConvert}
            className="flex-1"
            size="lg"
          >
            {status === 'loading-ffmpeg' ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Loading engine…
              </span>
            ) : status === 'converting' ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Converting… {progress}%
              </span>
            ) : (
              'Convert'
            )}
          </Button>
        )}

        {isActive && (
          <Button variant="destructive" onClick={cancel} size="lg">
            Cancel
          </Button>
        )}

        {status === 'done' && (
          <Button variant="outline" onClick={reset} size="lg" className="flex-1">
            Convert another file
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {isActive && (
        <div className="space-y-1">
          <Progress value={progress} />
          {processingTime > 0 && (
            <p className="text-xs text-gray-400 text-right">
              processed {formatTime(processingTime)}
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {status === 'error' && errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>
          <button
            onClick={reset}
            className="mt-1 text-xs text-red-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Log output */}
      {logs.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Log</p>
          <div
            ref={logRef}
            className="h-32 overflow-y-auto rounded-md bg-gray-950 px-3 py-2 font-mono text-xs text-green-400 space-y-0.5"
          >
            {logs.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
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

import { useRef, useState, useCallback } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

const CORE_URL = '/ffmpeg/ffmpeg-core.js'
const WASM_URL = '/ffmpeg/ffmpeg-core.wasm'

export interface FFmpegLogEvent {
  type: string
  message: string
}

export interface FFmpegProgressEvent {
  progress: number  // 0–1
  time: number      // microseconds processed
}

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(
    async (
      onProgress?: (e: FFmpegProgressEvent) => void,
      onLog?: (e: FFmpegLogEvent) => void
    ) => {
      if (ffmpegRef.current?.loaded) return

      setIsLoading(true)
      setLoadError(null)

      const ffmpeg = new FFmpeg()

      if (onLog) {
        ffmpeg.on('log', onLog)
      }
      if (onProgress) {
        ffmpeg.on('progress', onProgress)
      }

      try {
        const [coreURL, wasmURL] = await Promise.all([
          toBlobURL(CORE_URL, 'text/javascript'),
          toBlobURL(WASM_URL, 'application/wasm'),
        ])
        await ffmpeg.load({ coreURL, wasmURL })
        ffmpegRef.current = ffmpeg
        setIsLoaded(true)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load ffmpeg')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const exec = useCallback(async (args: string[]): Promise<number> => {
    if (!ffmpegRef.current?.loaded) throw new Error('ffmpeg is not loaded')
    return ffmpegRef.current.exec(args)
  }, [])

  const writeFile = useCallback(async (name: string, data: Uint8Array): Promise<void> => {
    if (!ffmpegRef.current?.loaded) throw new Error('ffmpeg is not loaded')
    await ffmpegRef.current.writeFile(name, data)
  }, [])

  const readFile = useCallback(async (name: string): Promise<Uint8Array> => {
    if (!ffmpegRef.current?.loaded) throw new Error('ffmpeg is not loaded')
    const data = await ffmpegRef.current.readFile(name)
    return data as Uint8Array
  }, [])

  const deleteFile = useCallback(async (name: string): Promise<void> => {
    if (!ffmpegRef.current?.loaded) throw new Error('ffmpeg is not loaded')
    try {
      await ffmpegRef.current.deleteFile(name)
    } catch {
      // File may not exist — ignore
    }
  }, [])

  const terminate = useCallback(() => {
    if (ffmpegRef.current) {
      ffmpegRef.current.terminate()
      ffmpegRef.current = null
      setIsLoaded(false)
    }
  }, [])

  return {
    isLoaded,
    isLoading,
    loadError,
    load,
    exec,
    writeFile,
    readFile,
    deleteFile,
    terminate,
  }
}

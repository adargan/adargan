import { useCallback } from 'react'
import { fetchFile } from '@ffmpeg/util'
import { useFFmpeg } from '@/hooks/useFFmpeg'
import { useConverterStore } from '@/store/converterStore'
import { buildArgs, getInputExtension, buildOutputFilename } from '@/lib/ffmpegCommands'
import { FORMAT_MAP } from '@/lib/formatDefinitions'

export function useConversion() {
  const ffmpeg = useFFmpeg()

  const {
    inputFile,
    outputFormat,
    compression,
    trim,
    audio,
    setStatus,
    setProgress,
    appendLog,
    setError,
    setOutput,
  } = useConverterStore()

  const convert = useCallback(async () => {
    if (!inputFile) return

    const inputExt = getInputExtension(inputFile)
    const format = FORMAT_MAP[outputFormat]
    const outputExt = format?.extension ?? outputFormat

    setStatus('loading-ffmpeg')

    try {
      // Load ffmpeg (no-op if already loaded)
      await ffmpeg.load(
        ({ progress, time }) => {
          setProgress(Math.round(progress * 100), time / 1_000_000)
        },
        ({ message }) => {
          appendLog(message)
        }
      )
    } catch {
      setError('Failed to load the conversion engine. Check your browser supports SharedArrayBuffer.')
      return
    }

    setStatus('converting')
    setProgress(0, 0)

    const inputFilename = `input.${inputExt}`
    const outputFilename = `output.${outputExt}`

    try {
      // Write input file into ffmpeg virtual FS
      const fileData = await fetchFile(inputFile)
      await ffmpeg.writeFile(inputFilename, fileData)

      // Build and run ffmpeg args
      const args = buildArgs({ inputExt, outputFormat, compression, trim, audio })
      const exitCode = await ffmpeg.exec(args)

      if (exitCode !== 0) {
        throw new Error(`ffmpeg exited with code ${exitCode}`)
      }

      // Read output from virtual FS
      const outputData = await ffmpeg.readFile(outputFilename)
      // Always copy into a fresh ArrayBuffer — ffmpeg may return SharedArrayBuffer
      const src = outputData instanceof Uint8Array ? outputData : new Uint8Array(outputData as ArrayBuffer)
      const plainBuffer: ArrayBuffer = src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength) as ArrayBuffer
      const blob = new Blob([plainBuffer], { type: format?.mimeType ?? 'video/mp4' })
      const objectUrl = URL.createObjectURL(blob)
      const suggestedName = buildOutputFilename(inputFile.name, outputFormat)

      setOutput(blob, objectUrl, suggestedName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
    } finally {
      // Clean up virtual FS regardless of success/failure
      await ffmpeg.deleteFile(inputFilename).catch(() => {})
      await ffmpeg.deleteFile(outputFilename).catch(() => {})
    }
  }, [inputFile, outputFormat, compression, trim, audio, ffmpeg, setStatus, setProgress, appendLog, setError, setOutput])

  const cancel = useCallback(() => {
    ffmpeg.terminate()
    setStatus('idle')
    setProgress(0, 0)
  }, [ffmpeg, setStatus, setProgress])

  return {
    convert,
    cancel,
    isLoaded: ffmpeg.isLoaded,
    isLoading: ffmpeg.isLoading,
  }
}

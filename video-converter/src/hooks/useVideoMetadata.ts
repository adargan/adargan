import { useCallback } from 'react'
import { useConverterStore } from '@/store/converterStore'
import type { VideoMetadata } from '@/types/converter'

export function useVideoMetadata() {
  const setVideoMetadata = useConverterStore((s) => s.setVideoMetadata)
  const updateTrim = useConverterStore((s) => s.updateTrim)

  const extractMetadata = useCallback(
    (file: File, objectUrl: string): Promise<VideoMetadata> => {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.muted = true

        video.onloadedmetadata = () => {
          const metadata: VideoMetadata = {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            fileSize: file.size,
            fileName: file.name,
            mimeType: file.type || 'video/mp4',
          }
          // Pre-populate trim end time to full duration
          updateTrim({ endTime: video.duration })
          setVideoMetadata(metadata)
          resolve(metadata)
          video.src = ''
        }

        video.onerror = () => {
          reject(new Error('Could not read video metadata'))
          video.src = ''
        }

        video.src = objectUrl
      })
    },
    [setVideoMetadata, updateTrim]
  )

  return { extractMetadata }
}

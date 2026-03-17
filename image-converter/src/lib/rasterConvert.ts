import type { RasterOutputFormat } from '@/types/converter'

export async function convertRaster(
  file: File,
  format: RasterOutputFormat,
  quality: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D canvas context')
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error(`Browser could not encode as ${format}. Try a different format.`))
      },
      `image/${format}`,
      quality / 100,
    )
  })
}

/** Returns true if the browser can encode to the given format via Canvas. */
export async function supportsFormat(format: RasterOutputFormat): Promise<boolean> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    canvas.toBlob((blob) => resolve(blob !== null && blob.size > 0), `image/${format}`)
  })
}

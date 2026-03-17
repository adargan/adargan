import { PDFDocument, PDFName, PDFDict } from 'pdf-lib'

export interface PdfOptimizeOptions {
  removeMetadata: boolean
  removeJavaScript: boolean
}

export async function optimizePdf(
  file: File,
  options: PdfOptimizeOptions,
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer()
  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

  if (options.removeMetadata) {
    doc.setTitle('')
    doc.setAuthor('')
    doc.setSubject('')
    doc.setKeywords([])
    doc.setProducer('')
    doc.setCreator('')
  }

  if (options.removeJavaScript) {
    try {
      const namesValue = doc.catalog.get(PDFName.of('Names'))
      if (namesValue) {
        const namesDict = doc.context.lookup(namesValue)
        if (namesDict instanceof PDFDict) {
          namesDict.delete(PDFName.of('JavaScript'))
        }
      }
    } catch {
      // Non-fatal: some PDFs don't have a Names entry
    }
  }

  return doc.save({ useObjectStreams: true })
}

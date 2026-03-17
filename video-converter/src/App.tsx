import { DropZone } from '@/components/dropzone/DropZone'
import { FormatSelector } from '@/components/controls/FormatSelector'
import { CompressionControls } from '@/components/controls/CompressionControls'
import { TrimControls } from '@/components/controls/TrimControls'
import { AudioControls } from '@/components/controls/AudioControls'
import { ConversionPanel } from '@/components/conversion/ConversionPanel'
import { DownloadResult } from '@/components/conversion/DownloadResult'
import { useConverterStore } from '@/store/converterStore'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {children}
    </div>
  )
}

export default function App() {
  const inputFile = useConverterStore((s) => s.inputFile)

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Converter</h1>
          <p className="mt-1 text-sm text-gray-500">
            100% in-browser — your files never leave your device
          </p>
        </div>

        {/* Drop zone */}
        <Section title="1. Input file">
          <DropZone />
        </Section>

        {/* Controls — only shown once a file is loaded */}
        {inputFile && (
          <>
            <Section title="2. Output format">
              <FormatSelector />
            </Section>

            <Section title="3. Compression">
              <CompressionControls />
            </Section>

            <Section title="4. Trim">
              <TrimControls />
            </Section>

            <Section title="5. Audio">
              <AudioControls />
            </Section>
          </>
        )}

        {/* Convert button + progress + logs */}
        <Section title={inputFile ? '6. Convert' : 'Convert'}>
          <ConversionPanel />
        </Section>

        {/* Download */}
        <DownloadResult />
      </div>
    </div>
  )
}

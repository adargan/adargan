import * as Tabs from '@radix-ui/react-tabs'
import { DropZone } from '@/components/dropzone/DropZone'
import { FormatSelector } from '@/components/controls/FormatSelector'
import { CompressionControls } from '@/components/controls/CompressionControls'
import { TrimControls } from '@/components/controls/TrimControls'
import { AudioControls } from '@/components/controls/AudioControls'
import { ConversionPanel } from '@/components/conversion/ConversionPanel'
import { DownloadResult } from '@/components/conversion/DownloadResult'
import { ImageDropZone } from '@/components/image/ImageDropZone'
import { ImageFormatControls } from '@/components/image/ImageFormatControls'
import { ImageResultCard } from '@/components/image/ImageResultCard'
import { PdfTab } from '@/components/pdf/PdfTab'
import { useConverterStore } from '@/store/converterStore'
import { useImageConverterStore } from '@/store/imageConverterStore'
import { InstallButton } from '@/components/ui/InstallButton'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {children}
    </div>
  )
}

function VideoTab() {
  const inputFile = useConverterStore((s) => s.inputFile)
  return (
    <div className="space-y-8">
      <Section title="1. Input file">
        <DropZone />
      </Section>

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

      <Section title={inputFile ? '6. Convert' : 'Convert'}>
        <ConversionPanel />
      </Section>

      <DownloadResult />
    </div>
  )
}

function ImageTab() {
  const { files, batchStatus, convertAll } = useImageConverterStore()
  const fileList = Array.from(files.values())
  const hasFiles = fileList.length > 0
  const hasRaster = fileList.some((f) => !f.isSvg)
  const allSvg = hasFiles && fileList.every((f) => f.isSvg)
  const isConverting = batchStatus === 'converting'
  const pendingCount = fileList.filter((f) => f.status !== 'done').length

  return (
    <div className="space-y-8">
      <Section title="1. Input files">
        <ImageDropZone />
      </Section>

      {hasRaster && (
        <Section title="2. Output format &amp; quality">
          <ImageFormatControls />
        </Section>
      )}

      {allSvg && (
        <Section title="2. Optimisation">
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
            <p className="text-sm text-gray-300">
              SVG files will be optimised with{' '}
              <a href="https://svgo.dev" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                SVGO
              </a>{' '}
              — removes comments, metadata, and redundant attributes while preserving{' '}
              <code className="text-xs bg-gray-800 px-1 py-0.5 rounded text-gray-300">viewBox</code>.
            </p>
          </div>
        </Section>
      )}

      {hasFiles && pendingCount > 0 && (
        <Section title={allSvg ? '3. Optimise' : '3. Convert'}>
          <button
            onClick={() => void convertAll()}
            disabled={isConverting}
            className={[
              'w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors',
              isConverting
                ? 'bg-blue-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500',
            ].join(' ')}
          >
            {isConverting
              ? allSvg ? 'Optimising…' : 'Converting…'
              : allSvg
                ? `Optimise ${pendingCount} SVG${pendingCount > 1 ? 's' : ''}`
                : `Convert ${pendingCount} file${pendingCount > 1 ? 's' : ''}`}
          </button>
        </Section>
      )}

      <ImageResultCard />
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 py-6 sm:py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Media Converter</h1>
            <p className="mt-1 text-sm text-gray-500">
              100% in-browser — your files never leave your device
            </p>
          </div>
          <InstallButton />
        </div>

        {/* Tabs */}
        <Tabs.Root defaultValue="video">
          <Tabs.List className="flex gap-1 rounded-xl bg-gray-800 p-1 mb-8">
            {[
              { value: 'video', label: '🎬 Video' },
              { value: 'image', label: '🖼️ Image' },
              { value: 'pdf', label: '📄 PDF' },
            ].map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all text-gray-500
                  data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100 data-[state=active]:shadow
                  hover:text-gray-300 cursor-pointer"
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="video">
            <VideoTab />
          </Tabs.Content>

          <Tabs.Content value="image">
            <ImageTab />
          </Tabs.Content>

          <Tabs.Content value="pdf">
            <PdfTab />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  )
}

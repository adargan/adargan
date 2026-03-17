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
import { useConverterStore } from '@/store/converterStore'
import { useImageConverterStore } from '@/store/imageConverterStore'

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
  const { file, isSvg, status, convert } = useImageConverterStore()
  return (
    <div className="space-y-8">
      <Section title="1. Input file">
        <ImageDropZone />
      </Section>

      {file && !isSvg && (
        <Section title="2. Output format &amp; quality">
          <ImageFormatControls />
        </Section>
      )}

      {file && isSvg && (
        <Section title="2. Optimisation">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-700">
              SVG will be optimised with{' '}
              <a href="https://svgo.dev" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                SVGO
              </a>{' '}
              — removes comments, metadata, and redundant attributes while preserving{' '}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">viewBox</code>.
            </p>
          </div>
        </Section>
      )}

      {file && (
        <Section title={isSvg ? '3. Optimise' : '3. Convert'}>
          <button
            onClick={() => void convert()}
            disabled={status === 'converting'}
            className={[
              'w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors',
              status === 'converting'
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700',
            ].join(' ')}
          >
            {status === 'converting'
              ? isSvg ? 'Optimising…' : 'Converting…'
              : isSvg ? 'Optimise SVG' : 'Convert'}
          </button>
        </Section>
      )}

      <ImageResultCard />
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Converter</h1>
          <p className="mt-1 text-sm text-gray-500">
            100% in-browser — your files never leave your device
          </p>
        </div>

        {/* Tabs */}
        <Tabs.Root defaultValue="video">
          <Tabs.List className="flex gap-1 rounded-xl bg-gray-200/60 p-1 mb-8">
            {[
              { value: 'video', label: 'Video' },
              { value: 'image', label: 'Image' },
            ].map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors text-gray-600
                  data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm
                  hover:text-gray-900"
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
        </Tabs.Root>
      </div>
    </div>
  )
}

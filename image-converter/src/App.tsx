import { DropZone } from '@/components/dropzone/DropZone'
import { FormatControls } from '@/components/controls/FormatControls'
import { ResultCard } from '@/components/result/ResultCard'
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
  const { file, isSvg, status, convert } = useConverterStore()

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Image Optimizer</h1>
          <p className="mt-1 text-sm text-gray-500">
            100% in-browser — your files never leave your device
          </p>
        </div>

        {/* Drop zone */}
        <Section title="1. Input file">
          <DropZone />
        </Section>

        {/* Format controls — raster only */}
        {file && !isSvg && (
          <Section title="2. Output format &amp; quality">
            <FormatControls />
          </Section>
        )}

        {/* SVG info */}
        {file && isSvg && (
          <Section title="2. Optimisation">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-700">
                SVG will be optimised with{' '}
                <a
                  href="https://svgo.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  SVGO
                </a>{' '}
                — removes comments, metadata, redundant attributes, and applies path
                optimisations while preserving <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">viewBox</code> for responsiveness.
              </p>
            </div>
          </Section>
        )}

        {/* Convert button */}
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

        {/* Result */}
        <ResultCard />
      </div>
    </div>
  )
}

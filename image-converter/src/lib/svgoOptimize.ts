import { optimize } from 'svgo'

export function optimizeSvg(svgString: string): string {
  const result = optimize(svgString, {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            // Keep viewBox — essential for responsive SVGs
            removeViewBox: false,
          },
        },
      },
      'removeTitle',
      'removeDesc',
    ],
  })
  return result.data
}

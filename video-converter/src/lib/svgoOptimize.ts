import { optimize } from 'svgo'

export function optimizeSvg(svgString: string): string {
  // preset-default in SVGO 3.x does not include removeViewBox, so viewBox is preserved.
  const result = optimize(svgString, {
    multipass: true,
    plugins: ['preset-default', 'removeTitle', 'removeDesc'],
  })
  return result.data
}

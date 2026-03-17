/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Inject COOP/COEP/CORP headers into every response so SharedArrayBuffer
// (required by ffmpeg.wasm) works when the app is served from SW cache.
function addIsolationHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

self.addEventListener('fetch', (event: FetchEvent) => {
  // Only handle same-origin requests
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return addIsolationHeaders(cached)
      return fetch(event.request).then((response) => {
        // Cache successful same-origin GET responses
        if (event.request.method === 'GET' && response.ok) {
          caches.open('media-converter-runtime').then((cache) => {
            cache.put(event.request, response.clone())
          })
        }
        return addIsolationHeaders(response.clone())
      })
    }),
  )
})

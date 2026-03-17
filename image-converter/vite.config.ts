import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Point svgo to the browser-compatible build (avoids Node.js built-ins)
      svgo: path.resolve(__dirname, './node_modules/svgo/lib/svgo.js'),
    },
  },
})

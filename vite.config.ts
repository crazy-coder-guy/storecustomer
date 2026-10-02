import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    // Listen on the LAN interface too (not just 127.0.0.1) so another
    // device on the same Wi-Fi — e.g. a phone — can reach the dev server.
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/@hugeicons')) {
            return 'icons'
          }
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom')
          ) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/@tanstack') || id.includes('node_modules/axios')) {
            return 'vendor-data'
          }
        },
      },
    },
  },
})

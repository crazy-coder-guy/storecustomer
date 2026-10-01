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
})

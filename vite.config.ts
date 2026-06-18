import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Clean Vite config compatible with development environment
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    // Bind to all interfaces
    host: true,
    // Allow controlled Cloudflare quick-tunnel demos without opening every host.
    allowedHosts: ['.trycloudflare.com'],
    // Pin a single dev port to avoid conflicts/SSL reuse confusion
    port: 3002,
    // Do not auto-switch ports; fail fast so we know
    strictPort: true,
  },
  preview: {
    allowedHosts: ['.trycloudflare.com'],
  },
  build: {
    // Generate source maps for debugging in production
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
})

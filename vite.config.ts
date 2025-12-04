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
    // Use the port provided by the environment, fallback to 5173
    port: Number(process.env.PORT) || 5173,
    // Allow Vite to pick an alternative port if taken
    strictPort: false,
  },
  build: {
    // Generate source maps for debugging in production
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Clean Vite config compatible with Replit development environment
export default defineConfig(() => ({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    // Bind to all interfaces so Replit can proxy
    host: true,
    // Use the port provided by the environment (Replit sets PORT), fallback to 5000
    port: Number(process.env.PORT) || 5000,
    // Allow Vite to pick an alternative port if 5000 is taken
    strictPort: false,
    // Allow all hosts (Replit uses dynamic hostnames) - `true` is the correct type
    allowedHosts: true,
  },
}))

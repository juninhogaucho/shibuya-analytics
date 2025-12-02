import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replit sometimes doesn't load TypeScript config files — provide a JS fallback
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    // Bind to all interfaces (required on Replit)
    host: true,
    // Use the Replit-provided PORT when available
    port: Number(process.env.PORT) || 5173,
    // allow the specific Replit host (exact string from the error)
    allowedHosts: ['78109730-b6b0-40f3-a5dd-e9e3c64dabe3-00-2r9qj9d8i27lx.spock.replit.dev'],
  },
})

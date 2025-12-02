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
    port: Number(process.env.PORT) || 5000,
    // Allow all hosts (accept dynamic Replit hostnames)
    allowedHosts: true,
  },
})

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
    // Allow common Replit subdomains (wildcard for dev environments)
    // include spock.replit.dev which Replit uses for some workspaces
    allowedHosts: ['.replit.dev', '.spock.replit.dev', 'localhost'],
  },
})

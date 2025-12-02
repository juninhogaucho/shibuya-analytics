import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    // Allow ALL hosts - simplest fix for Replit
    allowedHosts: 'all',
  },
})

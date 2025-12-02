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
    allowedHosts: ['78109730-b6b0-40f3-a5dd-e9e3c64dabe3-00-2r9qj9d8i27lx.spock.replit.dev'],
  },
})

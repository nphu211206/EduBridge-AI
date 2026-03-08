import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002, // Recruiter app - matches .env RECRUITER_APP_PORT
    proxy: {
      '/api': {
        target: 'http://localhost:3800',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:3800',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
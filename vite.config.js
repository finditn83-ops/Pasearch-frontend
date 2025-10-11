import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raise the warning limit from 500 KB to 2 MB
    chunkSizeWarningLimit: 2000,
  },
})

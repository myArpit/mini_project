import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['color-functions'],
        quietDeps: true
      }
    }
  },
  build: {
    outDir: 'dist', // Change this from 'dist' or 'build' to 'public'
    emptyOutDir: true
  }
})
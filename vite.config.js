import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Custom domain (surakshaone.com) is served from site root on GitHub Pages.
  base: '/',
})

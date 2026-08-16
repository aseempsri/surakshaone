import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Project Pages URL: https://aseempsri.github.io/surakshaone/
  base: command === 'build' ? '/surakshaone/' : '/',
}))

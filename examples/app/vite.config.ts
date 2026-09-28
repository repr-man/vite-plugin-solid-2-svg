import { defineConfig } from 'vite'
import solidPlugin from '@solidjs/vite-plugin'
import solidSvg from 'vite-plugin-solid-svg'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [Inspect(), solidPlugin(), solidSvg()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
})

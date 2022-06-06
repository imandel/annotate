import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    // exclude: ['@typewriter/document', '@typewriter/document/lib/index.js'],
    // include: ['@typewriter/delta','@typewriter/document','typewriter-editor/src/modules/decorations']
  },
  plugins: [crossOriginIsolation(),
            svelte()]
})

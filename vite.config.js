import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: null, // Evita divisão de código
        entryFileNames: 'script.js', // Define o nome do arquivo JS principal
        chunkFileNames: 'script.js', // Garante que não haja outro bundle gerado
        assetFileNames: 'style.[ext]', // Define o nome fixo dos assets (CSS, imagens)
        inlineDynamicImports: true, // Garante que imports dinâmicos fiquem no mesmo arquivo
      }
    },
    cssCodeSplit: false, // Junta todo o CSS em um único arquivo
    minify: 'esbuild', // Alternativa rápida ao Terser
  }
})

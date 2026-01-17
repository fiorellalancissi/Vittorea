import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/Vittore/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})

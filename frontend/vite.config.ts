import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from  "tailwindcss"
import autoprefixer from "autoprefixer"
import {resolve} from 'path'
import {vitePluginForArco} from "@arco-plugins/vite-react"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:11636/",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    // viteEslint()
    vitePluginForArco(),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss, 
        autoprefixer,
      ]
    }
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src')
    },
  },
  build: {
    rollupOptions: {
        output:{
            manualChunks(id) {
                if (id.includes('node_modules')) {
                    return id.toString().split('node_modules/')[1].split('/')[0].toString();
                }
            }
        }
    }
}
})

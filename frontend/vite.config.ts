import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const useMock = env.VITE_USE_MOCK === 'true'

  return {
    plugins: [
      vue(),
      viteMockServe({
        mockPath: 'mock',
        enable: useMock,
        logger: true,
        // 排除 vite-plugin-mock 生成的 .mjs 缓存文件，
        // 否则旧缓存中已注释的端点仍会被加载
        ignore: /_.*\.bundled_/
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 使用现代 Sass API，消除 legacy JS API 弃用警告
          api: 'modern'
        }
      }
    },
    server: {
      port: 3000,
      open: false,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8081',
          changeOrigin: true
        }
      }
    },
    build: {
      target: 'es2018',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          // 将大体积第三方依赖拆分独立 chunk，优化首屏加载与缓存
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            elementPlus: ['element-plus', '@element-plus/icons-vue'],
            echarts: ['echarts', 'vue-echarts']
          }
        }
      }
    }
  }
})

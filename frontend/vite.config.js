import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function altinProxy(apiKey) {
  return {
    '/api/altin': {
      target: 'https://altinapi.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/altin/, '/api/v1'),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          if (apiKey) proxyReq.setHeader('X-API-Key', apiKey)
        })
      },
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.ALTINAPI_KEY || ''

  return {
    plugins: [react()],
    server: {
      proxy: {
        ...altinProxy(apiKey),
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
    preview: {
      proxy: {
        ...altinProxy(apiKey),
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
  }
})

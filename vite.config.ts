import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

const commitHash = execSync('git rev-parse --short HEAD').toString().trim()

// Dynamically configure base based on environment
export default defineConfig(({ mode }) => {
  let base = '/'

  if (process.env.DEPLOY_ENV === 'github') {
    base = '/tax-vision/'
  }

  return {
    plugins: [
      react()
    ],
    base,
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    assetsInclude: ['**/*.png', '**/*.jpeg', '**/*.svg'],
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
      sourcemap: mode === 'development',
      minify: 'esbuild',
      cssMinify: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    define: {
      __COMMIT_HASH__: JSON.stringify(commitHash),
    },
  }
})
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
<<<<<<< HEAD
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'cloud-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api')) {
              try {
                const { cloudRouter } = await import('./src/server/cloudApi.ts');
                const express = (await import('express')).default;
                const apiApp = express();
                apiApp.use(express.json());
                apiApp.use('/api', cloudRouter);
                apiApp.get('/api/health', (r, s) => s.json({ status: 'ok' }));
                return apiApp(req, res, next);
              } catch (err) {
                console.error('API middleware error:', err);
                return next(err);
              }
            }
            next();
          });
        }
      }
    ],
=======
    plugins: [react(), tailwindcss()],
>>>>>>> origin/main
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          hub: path.resolve(__dirname, 'hub/index.html'),
          japan: path.resolve(__dirname, 'japan/index.html'),
<<<<<<< HEAD
          japanMobile: path.resolve(__dirname, 'japan/mobile/index.html'),
          components: path.resolve(__dirname, 'components/index.html'),
          aniwatch: path.resolve(__dirname, 'aniwatch/index.html'),
          aniwatchWatch: path.resolve(__dirname, 'aniwatch/watch/index.html'),
          cloud: path.resolve(__dirname, 'cloud/index.html'),
          cloudMobile: path.resolve(__dirname, 'cloud/mobile/index.html')
=======
          japanMobile: path.resolve(__dirname, 'japan/mobile/index.html')
>>>>>>> origin/main
        }
      }
    }
  };
});

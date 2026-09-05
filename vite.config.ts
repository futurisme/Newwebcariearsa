import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'cloud-api-middleware',
        async configureServer(server: any) {
          try {
            const express = (await import('express')).default;
            const { cloudRouter } = await import('./src/server/cloudApi.ts');
            const { noteRouter } = await import('./src/server/noteApi.ts');
            const apiApp = express();
            apiApp.use(express.json());
            apiApp.use('/api', cloudRouter);
            apiApp.use('/api/note', noteRouter);
            apiApp.get('/api/health', (_r: any, s: any) => s.json({ status: 'ok', time: new Date().toISOString() }));

            server.middlewares.use((req: any, res: any, next: any) => {
              if (req.url && req.url.startsWith('/api')) {
                return apiApp(req, res, next);
              }
              next();
            });
          } catch (err) {
            console.error('Failed to initialize API middleware:', err);
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          hub: path.resolve(__dirname, 'hub/index.html'),
          japan: path.resolve(__dirname, 'japan/index.html'),
          japanMobile: path.resolve(__dirname, 'japan/mobile/index.html'),
          components: path.resolve(__dirname, 'components/index.html'),
          aniwatch: path.resolve(__dirname, 'aniwatch/index.html'),
          aniwatchWatch: path.resolve(__dirname, 'aniwatch/watch/index.html'),
          cloud: path.resolve(__dirname, 'cloud/index.html'),
          cloudMobile: path.resolve(__dirname, 'cloud/mobile/index.html'),
          note: path.resolve(__dirname, 'note/index.html'),
          introlab: path.resolve(__dirname, 'introlab/index.html')
        }
      }
    }
  };
});

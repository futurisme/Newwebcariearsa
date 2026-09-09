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
            const { cloudRouter } = await import('./src/server/cloudApi.js');
            const { noteRouter } = await import('./src/server/noteApi.js');
            const apiApp = express();
            apiApp.use(express.json());
            apiApp.use('/api', cloudRouter);
            apiApp.use('/api/note', noteRouter);
            apiApp.get('/api/health', (_r: any, s: any) => s.json({ status: 'ok', time: new Date().toISOString() }));

            server.middlewares.use((req: any, res: any, next: any) => {
              if (req.url && req.url.startsWith('/public/')) {
                req.url = req.url.replace(/^\/public/, '');
              }
              if (req.url && req.url.startsWith('/api')) {
                return apiApp(req, res, next);
              }
              if (req.url === '/mobile') {
                res.writeHead(302, { Location: '/mobile/' });
                return res.end();
              }
              if (req.url === '/intro') {
                res.writeHead(302, { Location: '/intro/' });
                return res.end();
              }
              if (req.url === '/fadhil') {
                res.writeHead(302, { Location: '/fadhil/' });
                return res.end();
              }
              // Server-side mobile detection for dev
              if (req.url === '/' || req.url === '/index.html') {
                const ua = req.headers['user-agent'] || '';
                const chMobile = req.headers['sec-ch-ua-mobile'];
                const isMobileUA = chMobile === '?1' || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Silk|Kindle|PlayBook|Nexus|SM-|Pixel|XiaoMi|Oppo|Vivo|Realme|HarmonyOS|Huawei/i.test(ua);
                if (isMobileUA) {
                  res.writeHead(302, { Location: '/mobile/' });
                  return res.end();
                }
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
      target: 'es2022',
      cssCodeSplit: true,
      modulePreload: { polyfill: false },
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          intro: path.resolve(__dirname, 'intro/index.html'),
          mobile: path.resolve(__dirname, 'mobile/index.html'),
          hub: path.resolve(__dirname, 'hub/index.html'),
          japan: path.resolve(__dirname, 'japan/index.html'),
          japanMobile: path.resolve(__dirname, 'japan/mobile/index.html'),
          components: path.resolve(__dirname, 'components/index.html'),
          aniwatch: path.resolve(__dirname, 'aniwatch/index.html'),
          aniwatchWatch: path.resolve(__dirname, 'aniwatch/watch/index.html'),
          cloud: path.resolve(__dirname, 'cloud/index.html'),
          cloudMobile: path.resolve(__dirname, 'cloud/mobile/index.html'),
          note: path.resolve(__dirname, 'note/index.html'),
          introlab: path.resolve(__dirname, 'introlab/index.html'),
          c360: path.resolve(__dirname, '360/index.html'),
          fadhil: path.resolve(__dirname, 'fadhil/index.html')
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('node_modules/lucide')) {
              return 'vendor-lucide';
            }
          }
        }
      }
    }
  };
});

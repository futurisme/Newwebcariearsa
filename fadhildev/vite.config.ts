import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

const MIME_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function fadhilRouterPlugin(): Plugin {
  return {
    name: 'fadhil-router-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const urlObj = new URL(req.url, 'http://localhost:3000');
        const pathname = urlObj.pathname;
        const search = urlObj.search;

        if (pathname === '/fadhil/mobile' || pathname === '/fadhil/mobile/') {
          res.writeHead(301, { Location: `/mobile/${search}` });
          res.end();
          return;
        }

        if (pathname === '/fadhil' || pathname === '/fadhil/') {
          res.writeHead(301, { Location: `/${search}` });
          res.end();
          return;
        }

        if (pathname === '/mobile') {
          res.writeHead(301, { Location: `/mobile/${search}` });
          res.end();
          return;
        }

        const cleanPath = (pathname.startsWith('/fadhil/')
          ? pathname.slice('/fadhil'.length)
          : pathname).replace(/^\//, '');

        const ext = path.extname(cleanPath).toLowerCase();
        if (ext && MIME_TYPES[ext]) {
          const candidatePaths = [
            path.resolve(__dirname, cleanPath),
            path.resolve(__dirname, 'public', cleanPath),
            path.resolve(__dirname, 'public/fadhil', cleanPath),
          ];

          for (const cand of candidatePaths) {
            if (fs.existsSync(cand)) {
              try {
                const stat = fs.statSync(cand);
                if (stat.isFile()) {
                  res.setHeader('Content-Type', MIME_TYPES[ext]);
                  res.setHeader('Content-Length', stat.size);
                  res.setHeader('Cache-Control', 'no-cache');
                  fs.createReadStream(cand).pipe(res);
                  return;
                }
              } catch (_) {}
            }
          }
        }

        if (pathname.startsWith('/fadhil/')) {
          req.url = pathname.slice('/fadhil'.length) + search;
        }

        next();
      });
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        // 1. Copy root static files to dist/
        const rootFiles = [
          'apple-touch-icon.png',
          'fadhil-512x512.png',
          'fadhil.svg',
          'favicon.ico',
          'favicon.svg',
          'site.webmanifest',
          '_redirects',
          'robots.txt',
          'sitemap.xml',
        ];
        for (const file of rootFiles) {
          const srcPath = path.resolve(__dirname, file);
          const destPath = path.resolve(distDir, file);
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
          }
        }

        // 2. Unconditionally copy app/ and assets/ to dist/
        const srcApp = path.resolve(__dirname, 'app');
        const destApp = path.resolve(distDir, 'app');
        if (fs.existsSync(srcApp)) {
          fs.cpSync(srcApp, destApp, { recursive: true, force: true });
        }

        const srcAssets = path.resolve(__dirname, 'assets');
        const destAssets = path.resolve(distDir, 'assets');
        if (fs.existsSync(srcAssets)) {
          fs.cpSync(srcAssets, destAssets, { recursive: true, force: true });
        }

        // 3. Mirror everything inside dist/fadhil/ for /fadhil/* path resilience
        const distFadhil = path.resolve(distDir, 'fadhil');
        fs.mkdirSync(distFadhil, { recursive: true });

        if (fs.existsSync(srcApp)) {
          fs.cpSync(srcApp, path.resolve(distFadhil, 'app'), { recursive: true, force: true });
        }
        if (fs.existsSync(srcAssets)) {
          fs.cpSync(srcAssets, path.resolve(distFadhil, 'assets'), { recursive: true, force: true });
        }

        const distIndex = path.resolve(distDir, 'index.html');
        if (fs.existsSync(distIndex)) {
          fs.copyFileSync(distIndex, path.resolve(distFadhil, 'index.html'));
        }

        const distMobile = path.resolve(distDir, 'mobile/index.html');
        const distFadhilMobile = path.resolve(distFadhil, 'mobile');
        fs.mkdirSync(distFadhilMobile, { recursive: true });
        if (fs.existsSync(distMobile)) {
          fs.copyFileSync(distMobile, path.resolve(distFadhilMobile, 'index.html'));
        }

        for (const file of rootFiles) {
          const srcPath = path.resolve(__dirname, file);
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, path.resolve(distFadhil, file));
          }
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [fadhilRouterPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '/fadhil/app': path.resolve(__dirname, 'app'),
        '/fadhil/assets': path.resolve(__dirname, 'assets'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          mobile: path.resolve(__dirname, 'mobile/index.html'),
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

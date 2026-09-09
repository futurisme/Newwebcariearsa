import express from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { cloudRouter } from './src/server/cloudApi.js';
import { noteRouter } from './src/server/noteApi.js';

const getDirname = () => {
  if (typeof __dirname !== 'undefined') return __dirname;
  return process.cwd();
};
const appDir = getDirname();

try {
  if (typeof (process as any).loadEnvFile === 'function') {
    (process as any).loadEnvFile();
  }
} catch (_) {
  // Ignored if .env file is not present
}

const app = express();
const PORT = 3000;

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const isSupabaseKeyValid = typeof supabaseKey === 'string' && (supabaseKey.startsWith('sb_') || supabaseKey.startsWith('eyJ') || supabaseKey.length > 20);
const supabase = isSupabaseKeyValid ? createClient(supabaseUrl, supabaseKey) : null;
const BUCKET_NAME = 'vault_files';

async function initBucket() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
    if (!data || error) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });
      if (!createError) {
        console.log(`Successfully created public bucket: ${BUCKET_NAME}`);
      } else {
        await supabase.storage.updateBucket(BUCKET_NAME, { public: true });
      }
    } else {
      console.log(`Bucket verified: ${BUCKET_NAME}`);
      await supabase.storage.updateBucket(BUCKET_NAME, { public: true });
    }
  } catch (_) {
    // Silent fallback to local storage
  }
}

function isMobileClient(req: express.Request): boolean {
  const chMobile = req.headers['sec-ch-ua-mobile'];
  if (chMobile === '?1') return true;
  const ua = (req.headers['user-agent'] as string) || '';
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Silk|Kindle|PlayBook|Nexus|SM-|Pixel|XiaoMi|Oppo|Vivo|Realme|HarmonyOS|Huawei/i.test(ua);
}

async function startServer() {
  await initBucket();

  app.use(express.json());

  // Service Worker endpoint with scope header
  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(appDir, 'public/sw.js'));
  });

  // Permanent caching for intro visual & media assets
  app.use(['/assets', '/public/assets'], express.static(path.join(appDir, 'public/assets'), {
    maxAge: '1y',
    immutable: true
  }));

  app.use('/public', express.static(path.join(appDir, 'public'), {
    maxAge: '7d'
  }));

  // Security & Performance response headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Robots.txt & Sitemap.xml SEO handlers
  app.get('/robots.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.join(appDir, 'public/robots.txt'));
  });

  app.get('/sitemap.xml', (_req, res) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.join(appDir, 'public/sitemap.xml'));
  });

  // Mobile redirect handler
  app.get('/mobile', (req, res) => {
    res.redirect(302, '/mobile/');
  });

  // Secret isolated intro subdirectory redirect handler
  app.get('/intro', (req, res) => {
    res.redirect(302, '/intro/');
  });

  // Fadhil portfolio subdirectory redirect handler
  app.get('/fadhil', (req, res) => {
    res.redirect(302, '/fadhil/');
  });

  app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/index.html') {
      if (isMobileClient(req)) {
        const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        return res.redirect(302, `/mobile/${qs}`);
      }
    }
    next();
  });

  // Mount Cloud Storage API routes
  app.use('/api', cloudRouter);
  app.use('/api/note', noteRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Direct alias for CARIEARSA360 (/360 -> /introlab/)
  app.get(['/360', '/360/'], (req, res) => {
    res.redirect('/introlab/');
  });

  // Vite Middleware for Dev / Static Files for Prod
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(appDir, 'dist');
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true
    }));
    app.use('/public', express.static(path.join(appDir, 'public'), {
      maxAge: '7d'
    }));
    app.use(express.static(distPath, {
      maxAge: '1h'
    }));
    app.get(['/intro', '/intro/'], (req, res) => {
      res.sendFile(path.join(distPath, 'intro/index.html'));
    });
    app.get(['/mobile', '/mobile/'], (req, res) => {
      res.sendFile(path.join(distPath, 'mobile/index.html'));
    });
    app.get(['/introlab', '/introlab/', '/360', '/360/'], (req, res) => {
      res.sendFile(path.join(distPath, 'introlab/index.html'));
    });
    app.get(['/hub', '/hub/'], (req, res) => {
      res.sendFile(path.join(distPath, 'hub/index.html'));
    });
    app.get(['/japan', '/japan/'], (req, res) => {
      res.sendFile(path.join(distPath, 'japan/index.html'));
    });
    app.get(['/japan/mobile', '/japan/mobile/'], (req, res) => {
      res.sendFile(path.join(distPath, 'japan/mobile/index.html'));
    });
    app.get(['/aniwatch', '/aniwatch/'], (req, res) => {
      res.sendFile(path.join(distPath, 'aniwatch/index.html'));
    });
    app.get(['/aniwatch/watch', '/aniwatch/watch/'], (req, res) => {
      res.sendFile(path.join(distPath, 'aniwatch/watch/index.html'));
    });
    app.get(['/cloud', '/cloud/'], (req, res) => {
      res.sendFile(path.join(distPath, 'cloud/index.html'));
    });
    app.get(['/cloud/mobile', '/cloud/mobile/'], (req, res) => {
      res.sendFile(path.join(distPath, 'cloud/mobile/index.html'));
    });
    app.get(['/note', '/note/'], (req, res) => {
      res.sendFile(path.join(distPath, 'note/index.html'));
    });
    app.get(['/fadhil', '/fadhil/'], (req, res) => {
      res.sendFile(path.join(distPath, 'fadhil/index.html'));
    });
    app.get(['/components', '/components/'], (req, res) => {
      res.sendFile(path.join(distPath, 'components/index.html'));
    });
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CARIEARSA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

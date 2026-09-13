import { Router } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const upload = multer({ storage: multer.memoryStorage() });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const BUCKET_NAME = 'vault_files';

// Key is valid if it starts with 'sb_', 'eyJ', or has valid key length
const isSupabaseKeyValid = typeof supabaseKey === 'string' && (supabaseKey.startsWith('sb_') || supabaseKey.startsWith('eyJ') || supabaseKey.length > 20);
const supabase = isSupabaseKeyValid ? createClient(supabaseUrl, supabaseKey) : null;

// Persistent server fallback storage
const VAULT_DIR = path.join(process.cwd(), '.vault_storage');
const VAULT_FILES_DIR = path.join(VAULT_DIR, 'files');
const VAULT_META_FILE = path.join(VAULT_DIR, 'files_meta.json');

try {
  if (!fs.existsSync(VAULT_FILES_DIR)) {
    fs.mkdirSync(VAULT_FILES_DIR, { recursive: true });
  }
} catch (err) {
  console.error('Failed to create vault storage directories:', err);
}

function getLocalMetaList() {
  try {
    if (fs.existsSync(VAULT_META_FILE)) {
      const data = fs.readFileSync(VAULT_META_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.error('Error reading vault metadata:', err);
  }
  return [];
}

function saveLocalMetaList(list) {
  try {
    if (!fs.existsSync(VAULT_DIR)) {
      fs.mkdirSync(VAULT_DIR, { recursive: true });
    }
    fs.writeFileSync(VAULT_META_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving vault metadata:', err);
  }
}

export const cloudRouter = Router();

// CORS header for API routes
cloudRouter.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// GET file list handler
async function handleListFiles(req, res) {
  // 1. Try Supabase if available
  if (supabase) {
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (!error && data) {
        const files = data.filter((f) => f.name !== '.emptyFolderPlaceholder');
        const filesWithUrls = files.map((file) => {
          const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name);
          return {
            ...file,
            publicUrl: urlData.publicUrl,
          };
        });
        return res.json({ files: filesWithUrls, source: 'supabase' });
      }
    } catch (err) {
      console.warn('Supabase list error, falling back to vault storage:', err?.message);
    }
  }

  // 2. Resilient fallback to server vault storage
  const localList = getLocalMetaList();
  return res.json({ files: localList, source: 'vault' });
}

// Register both /files and /cloud/files
cloudRouter.get('/files', handleListFiles);
cloudRouter.get('/cloud/files', handleListFiles);

// POST upload handler
async function handleUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const rawName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}_${rawName}`;
    const mimetype = req.file.mimetype || 'application/octet-stream';
    const size = req.file.size || req.file.buffer.length;

    // 1. Try Supabase if available
    if (supabase) {
      try {
        let uploadResult = await supabase.storage.from(BUCKET_NAME).upload(fileName, req.file.buffer, {
          contentType: mimetype,
          upsert: true,
        });

        if (uploadResult.error && uploadResult.error?.message?.toLowerCase().includes('bucket not found')) {
          await supabase.storage.createBucket(BUCKET_NAME, { public: true, fileSizeLimit: 52428800 });
          uploadResult = await supabase.storage.from(BUCKET_NAME).upload(fileName, req.file.buffer, {
            contentType: mimetype,
            upsert: true,
          });
        }

        if (!uploadResult.error) {
          const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
          return res.json({
            success: true,
            file: { name: fileName, publicUrl: urlData.publicUrl, data: uploadResult.data },
            source: 'supabase'
          });
        }
      } catch (err) {
        console.warn('Supabase upload failed, storing locally in vault:', err?.message);
      }
    }

    // 2. Save file to server disk vault
    const localFilePath = path.join(VAULT_FILES_DIR, fileName);
    fs.writeFileSync(localFilePath, req.file.buffer);

    const publicUrl = `/api/files/download?name=${encodeURIComponent(fileName)}`;
    const nowIso = new Date().toISOString();
    const meta = {
      name: fileName,
      id: fileName,
      created_at: nowIso,
      updated_at: nowIso,
      last_accessed_at: nowIso,
      metadata: { size, mimetype },
      publicUrl,
    };

    const currentList = getLocalMetaList().filter((f) => f.name !== fileName);
    currentList.unshift(meta);
    saveLocalMetaList(currentList);

    return res.json({ success: true, file: meta, source: 'vault' });
  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}

cloudRouter.post('/upload', upload.single('file'), handleUpload);
cloudRouter.post('/cloud/upload', upload.single('file'), handleUpload);

// POST delete handler
async function handleDelete(req, res) {
  try {
    const { filenames, filename, names } = req.body || {};
    const targetFiles = Array.isArray(filenames)
      ? filenames.filter(Boolean)
      : Array.isArray(names)
        ? names.filter(Boolean)
        : filename
          ? [filename]
          : [];

    if (targetFiles.length === 0) {
      return res.status(400).json({ error: 'No files specified for deletion' });
    }

    let supabaseDeleted = false;
    if (supabase) {
      try {
        const { error } = await supabase.storage.from(BUCKET_NAME).remove(targetFiles);
        if (!error) supabaseDeleted = true;
      } catch (err) {
        console.warn('Supabase delete error:', err?.message);
      }
    }

    let currentList = getLocalMetaList();
    const targetSet = new Set(targetFiles);
    currentList = currentList.filter(f => !targetSet.has(f.name));
    saveLocalMetaList(currentList);

    for (const fn of targetFiles) {
      const p = path.join(VAULT_FILES_DIR, fn);
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (_) {}
      }
    }

    return res.json({ success: true, deleted: targetFiles, supabase: supabaseDeleted });
  } catch (err) {
    console.error('Delete handler error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}

cloudRouter.post('/files/delete', handleDelete);
cloudRouter.post('/cloud/files/delete', handleDelete);

// POST rename handler
async function handleRename(req, res) {
  try {
    const { oldFilename, newFilename, oldName, newName } = req.body || {};
    const src = oldFilename || oldName;
    const dest = newFilename || newName;

    if (!src || !dest) {
      return res.status(400).json({ error: 'Source and target filenames required' });
    }

    let supabaseMoved = false;
    if (supabase) {
      try {
        const { error } = await supabase.storage.from(BUCKET_NAME).move(src, dest);
        if (!error) supabaseMoved = true;
      } catch (err) {
        console.warn('Supabase rename error:', err?.message);
      }
    }

    const currentList = getLocalMetaList();
    const item = currentList.find(f => f.name === src);
    if (item) {
      item.name = dest;
      item.id = dest;
      item.updated_at = new Date().toISOString();
      item.publicUrl = `/api/files/download?name=${encodeURIComponent(dest)}`;
      saveLocalMetaList(currentList);

      const oldPath = path.join(VAULT_FILES_DIR, src);
      const newPath = path.join(VAULT_FILES_DIR, dest);
      if (fs.existsSync(oldPath)) {
        try { fs.renameSync(oldPath, newPath); } catch (_) {}
      }
    }

    return res.json({ success: true, oldName: src, newName: dest, supabase: supabaseMoved });
  } catch (err) {
    console.error('Rename handler error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}

cloudRouter.post('/files/rename', handleRename);
cloudRouter.post('/cloud/files/rename', handleRename);

// GET download handler
cloudRouter.get('/files/download', (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).send('File name required');

  const filePath = path.join(VAULT_FILES_DIR, name);
  if (fs.existsSync(filePath)) {
    return res.download(filePath, name);
  }

  if (supabase) {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(name);
    if (data?.publicUrl) {
      return res.redirect(data.publicUrl);
    }
  }

  return res.status(404).send('File not found');
});

import { Router } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const upload = multer({ storage: multer.memoryStorage() });

const supabaseUrl = process.env.SUPABASE_URL || 'https://gnhkhnmvggltqszbhfev.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const BUCKET_NAME = 'vault_files';

// A key is only a valid Supabase JWT if it starts with 'eyJ'
const isSupabaseJwtValid = typeof supabaseKey === 'string' && supabaseKey.startsWith('eyJ');
const supabase = isSupabaseJwtValid ? createClient(supabaseUrl, supabaseKey) : null;

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

interface LocalFileMeta {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype?: string;
  };
  publicUrl: string;
}

function getLocalMetaList(): LocalFileMeta[] {
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

function saveLocalMetaList(list: LocalFileMeta[]) {
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
async function handleListFiles(req: any, res: any) {
  // 1. Try Supabase if valid JWT
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
      console.warn('Supabase list error, falling back to vault storage:', (err as any)?.message);
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
async function handleUpload(req: any, res: any) {
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
        const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, req.file.buffer, {
          contentType: mimetype,
          upsert: true,
        });

        if (!error) {
          const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
          return res.json({
            success: true,
            file: { name: fileName, publicUrl: urlData.publicUrl, data },
            source: 'supabase'
          });
        }
      } catch (err) {
        console.warn('Supabase upload failed, storing locally in vault:', (err as any)?.message);
      }
    }

    // 2. Save file to server disk vault
    const localFilePath = path.join(VAULT_FILES_DIR, fileName);
    fs.writeFileSync(localFilePath, req.file.buffer);

    const publicUrl = `/api/files/download?name=${encodeURIComponent(fileName)}`;
    const nowIso = new Date().toISOString();
    const meta: LocalFileMeta = {
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
  } catch (err: any) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}

cloudRouter.post('/upload', upload.single('file') as any, handleUpload);
cloudRouter.post('/cloud/upload', upload.single('file') as any, handleUpload);

// POST delete handler
async function handleDelete(req: any, res: any) {
  try {
    const { filenames, filename, names } = req.body || {};
    const targetFiles: string[] = Array.isArray(filenames)
      ? filenames.filter(Boolean)
      : Array.isArray(names)
        ? names.filter(Boolean)
        : filename
          ? [filename]
          : [];

    if (targetFiles.length === 0) {
      return res.status(400).json({ error: 'No files specified for deletion' });
    }

    // 1. Try Supabase
    if (supabase) {
      try {
        await supabase.storage.from(BUCKET_NAME).remove(targetFiles);
      } catch (_) {}
    }

    // 2. Delete from local server vault
    for (const name of targetFiles) {
      try {
        const filePath = path.join(VAULT_FILES_DIR, name);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (_) {}
    }

    const currentList = getLocalMetaList().filter((f) => !targetFiles.includes(f.name));
    saveLocalMetaList(currentList);

    return res.json({ success: true, deleted: targetFiles });
  } catch (err: any) {
    console.error('Delete handler error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}

cloudRouter.post('/files/delete', handleDelete);
cloudRouter.post('/cloud/delete', handleDelete);

// DELETE /api/files/:filename
cloudRouter.delete('/files/:filename(*)', async (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  req.body = { filename };
  return handleDelete(req, res);
});
cloudRouter.delete('/cloud/:filename(*)', async (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  req.body = { filename };
  return handleDelete(req, res);
});

// POST rename handler
async function handleRename(req: any, res: any) {
  try {
    const oldFilename = req.body?.oldFilename || req.body?.oldName;
    const newFilename = req.body?.newFilename || req.body?.newName;
    if (!oldFilename || !newFilename) {
      return res.status(400).json({ error: 'Both oldFilename and newFilename are required' });
    }

    if (oldFilename === newFilename) {
      return res.json({ success: true, filename: newFilename });
    }

    let publicUrl = `/api/files/download?name=${encodeURIComponent(newFilename)}`;

    // 1. Try Supabase
    if (supabase) {
      try {
        const { error } = await supabase.storage.from(BUCKET_NAME).move(oldFilename, newFilename);
        if (!error) {
          const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newFilename);
          publicUrl = urlData.publicUrl;
        }
      } catch (_) {}
    }

    // 2. Rename in local server vault
    try {
      const oldPath = path.join(VAULT_FILES_DIR, oldFilename);
      const newPath = path.join(VAULT_FILES_DIR, newFilename);
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }
    } catch (_) {}

    const currentList = getLocalMetaList();
    const item = currentList.find((f) => f.name === oldFilename);
    if (item) {
      item.name = newFilename;
      item.id = newFilename;
      item.updated_at = new Date().toISOString();
      item.publicUrl = publicUrl;
      saveLocalMetaList(currentList);
    }

    return res.json({ success: true, oldFilename, newFilename, publicUrl });
  } catch (err: any) {
    console.error('Rename handler error:', err);
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}

cloudRouter.post('/files/rename', handleRename);
cloudRouter.post('/cloud/rename', handleRename);

// GET download handler
async function handleDownload(req: any, res: any) {
  try {
    const filename = (req.query.name || req.query.filename) as string;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // 1. Check local server vault first
    const localFilePath = path.join(VAULT_FILES_DIR, filename);
    if (fs.existsSync(localFilePath)) {
      const cleanName = filename.replace(/^\d+_/, '') || filename;
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanName)}"`);
      return res.sendFile(localFilePath);
    }

    // 2. Try Supabase if available
    if (supabase) {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).download(filename);
      if (!error && data) {
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const cleanName = filename.replace(/^\d+_/, '') || filename;
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanName)}"`);
        res.setHeader('Content-Type', data.type || 'application/octet-stream');
        return res.send(buffer);
      }
    }

    return res.status(404).json({ error: 'File not found' });
  } catch (err: any) {
    console.error('Download handler error:', err);
    res.status(500).json({ error: err?.message || 'Failed to download file' });
  }
}

cloudRouter.get('/files/download', handleDownload);
cloudRouter.get('/cloud/download', handleDownload);

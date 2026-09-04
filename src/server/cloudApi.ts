import { Router } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

const upload = multer({ storage: multer.memoryStorage() });

const supabaseUrl = process.env.SUPABASE_URL || 'https://gnhkhnmvggltqszbhfev.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_E7C1i2kfhrHHBdbrCbIfZA_5I12RT6C';
const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'vault_files';

export const cloudRouter = Router();

// GET /api/files
cloudRouter.get('/files', async (req, res) => {
  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const files = data?.filter((f) => f.name !== '.emptyFolderPlaceholder') || [];
    const filesWithUrls = files.map((file) => {
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name);
      return {
        ...file,
        publicUrl: urlData.publicUrl,
      };
    });

    res.json({ files: filesWithUrls });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

// POST /api/upload
cloudRouter.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype || 'application/octet-stream',
      upsert: true,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    res.json({ success: true, file: { name: fileName, publicUrl: urlData.publicUrl, data } });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

// POST /api/files/delete
cloudRouter.post('/files/delete', async (req, res) => {
  try {
    const { filenames, filename } = req.body || {};
    const targetFiles: string[] = Array.isArray(filenames)
      ? filenames.filter(Boolean)
      : filename
        ? [filename]
        : [];

    if (targetFiles.length === 0) {
      return res.status(400).json({ error: 'No files specified for deletion' });
    }

    const { data, error } = await supabase.storage.from(BUCKET_NAME).remove(targetFiles);
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, deleted: targetFiles, data });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

// DELETE /api/files/:filename
cloudRouter.delete('/files/:filename(*)', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const { data, error } = await supabase.storage.from(BUCKET_NAME).remove([filename]);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

// POST /api/files/rename
cloudRouter.post('/files/rename', async (req, res) => {
  try {
    const { oldFilename, newFilename } = req.body || {};
    if (!oldFilename || !newFilename) {
      return res.status(400).json({ error: 'Both oldFilename and newFilename are required' });
    }

    if (oldFilename === newFilename) {
      return res.json({ success: true, filename: newFilename });
    }

    const { data, error } = await supabase.storage.from(BUCKET_NAME).move(oldFilename, newFilename);
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newFilename);
    res.json({ success: true, oldFilename, newFilename, publicUrl: urlData.publicUrl, data });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

// GET /api/files/download
cloudRouter.get('/files/download', async (req, res) => {
  try {
    const filename = req.query.name as string;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(filename);
    if (error || !data) {
      return res.status(404).json({ error: 'File not found' });
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const cleanName = filename.replace(/^\d+_/, '') || filename;

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanName)}"`);
    res.setHeader('Content-Type', data.type || 'application/octet-stream');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to download file' });
  }
});

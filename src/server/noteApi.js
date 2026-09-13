import { Router } from 'express';
import fs from 'fs';
import path from 'path';

export const noteRouter = Router();

// Storage directory for notes
const NOTES_DIR = path.join(process.cwd(), '.vault_storage', 'notes');
try {
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
  }
} catch (e) {
  console.error('Failed to create NOTES_DIR:', e);
}

function normalizeDocKey(raw) {
  const clean = String(raw || 'main')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return clean || 'main';
}

function getNotePath(docKey) {
  return path.join(NOTES_DIR, `${docKey}.json`);
}

function readNote(docKey) {
  const filePath = getNotePath(docKey);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        return {
          docKey,
          note: {
            title: String(parsed.note?.title || ''),
            body: String(parsed.note?.body || '')
          },
          version: Number(parsed.version || 1),
          updatedAt: Number(parsed.updatedAt || Date.now()),
          clientId: parsed.clientId
        };
      }
    } catch (err) {
      console.error(`Error reading note for ${docKey}:`, err);
    }
  }

  // Default empty note
  return {
    docKey,
    note: {
      title: '',
      body: ''
    },
    version: 0,
    updatedAt: Date.now()
  };
}

function writeNote(docKey, noteData, expectedVersion, clientId) {
  const current = readNote(docKey);
  const nextVersion = (current.version || 0) + 1;

  const stored = {
    docKey,
    note: {
      title: String(noteData?.title || '').slice(0, 120),
      body: String(noteData?.body || '')
    },
    version: nextVersion,
    updatedAt: Date.now(),
    clientId: clientId || current.clientId
  };

  try {
    if (!fs.existsSync(NOTES_DIR)) {
      fs.mkdirSync(NOTES_DIR, { recursive: true });
    }
    fs.writeFileSync(getNotePath(docKey), JSON.stringify(stored, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing note ${docKey}:`, err);
  }

  return stored;
}

// Enable CORS
noteRouter.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// GET /api/note?doc=<docKey>
noteRouter.get('/', (req, res) => {
  try {
    const docKey = normalizeDocKey(req.query.doc);
    const stored = readNote(docKey);
    res.json({
      ok: true,
      doc: docKey,
      note: stored.note,
      version: stored.version,
      updatedAt: stored.updatedAt
    });
  } catch (err) {
    console.error('Note GET error:', err);
    res.json({
      ok: true,
      doc: normalizeDocKey(req.query.doc),
      note: { title: '', body: '' },
      version: 0
    });
  }
});

// PUT /api/note?doc=<docKey>
noteRouter.put('/', (req, res) => {
  try {
    const docKey = normalizeDocKey(req.query.doc || req.body?.doc);
    const notePayload = req.body?.note || { title: req.body?.title, body: req.body?.body };
    const expectedVersion = req.body?.expectedVersion;
    const clientId = req.body?.clientId;

    const stored = writeNote(docKey, notePayload, expectedVersion, clientId);
    res.json({
      ok: true,
      doc: docKey,
      note: stored.note,
      version: stored.version,
      updatedAt: stored.updatedAt
    });
  } catch (err) {
    console.error('Note PUT error:', err);
    res.status(500).json({ ok: false, error: err?.message || 'Failed to save note' });
  }
});

// POST /api/note?doc=<docKey> (alias for PUT)
noteRouter.post('/', (req, res) => {
  try {
    const docKey = normalizeDocKey(req.query.doc || req.body?.doc);
    const notePayload = req.body?.note || { title: req.body?.title, body: req.body?.body };
    const expectedVersion = req.body?.expectedVersion;
    const clientId = req.body?.clientId;

    const stored = writeNote(docKey, notePayload, expectedVersion, clientId);
    res.json({
      ok: true,
      doc: docKey,
      note: stored.note,
      version: stored.version,
      updatedAt: stored.updatedAt
    });
  } catch (err) {
    console.error('Note POST error:', err);
    res.status(500).json({ ok: false, error: err?.message || 'Failed to save note' });
  }
});

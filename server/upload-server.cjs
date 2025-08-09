// Minimal upload server for cross-device photo uploads
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const QRCode = require('qrcode');
const os = require('os');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.UPLOAD_PORT || 8787;

app.use(cors());

// Disk persistence: files under server/uploads, tracked per patient in memory
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR, { fallthrough: true }));

// In-memory index of filenames per patientId
const store = Object.create(null);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = String(file.originalname).replace(/[^a-zA-Z0-9_.-]+/g, '_');
    const name = `${Date.now()}_${Math.random().toString(36).slice(2)}_${safe}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

app.get('/origin', (req, res) => {
  const origin = `${req.protocol}://${req.get('host')}`;
  res.json({ origin });
});

app.get('/addresses', (req, res) => {
  const nets = os.networkInterfaces();
  const addrs = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        addrs.push(`http://${net.address}:${PORT}`);
      }
    }
  }
  res.json({ addresses: addrs });
});

app.get('/qr', async (req, res) => {
  const { text } = req.query;
  if (!text) return res.status(400).send('Missing text');
  try {
    res.setHeader('Content-Type', 'image/png');
    const stream = await QRCode.toFileStream(res, String(text), { margin: 1, width: 240 });
    stream.on('error', () => res.end());
  } catch (e) {
    res.status(500).send('QR error');
  }
});

app.get('/photos', (req, res) => {
  const { patientId } = req.query;
  if (!patientId) return res.status(400).json({ error: 'patientId required' });
  const origin = `${req.protocol}://${req.get('host')}`;
  const files = store[patientId] || [];
  const urls = files.map((f) => `${origin}/uploads/${encodeURIComponent(f)}`);
  res.json({ photos: urls });
});

app.post('/upload', upload.array('files'), async (req, res) => {
  const { patientId } = req.query;
  if (!patientId) return res.status(400).json({ error: 'patientId required' });
  const files = req.files || [];
  if (files.length === 0) return res.status(400).json({ error: 'no files' });
  const names = files.map((f) => f.filename);
  store[patientId] = [...(store[patientId] || []), ...names];
  res.json({ uploaded: names.length });
});

app.get('/quick-upload', (req, res) => {
  const { patientId } = req.query;
  if (!patientId) return res.status(400).send('patientId is required');
  res.setHeader('Content-Type', 'text/html');
  res.end(`<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Upload Photos</title>
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;padding:20px;max-width:560px;margin:auto}button,input{font-size:16px} .ok{color:#0a0} .err{color:#a00}</style>
  </head>
<body>
  <h2>Upload Photos</h2>
  <p>Patient ID: ${String(patientId)}</p>
  <form id="f" enctype="multipart/form-data" method="post" action="/upload?patientId=${encodeURIComponent(String(patientId))}">
    <input type="file" name="files" accept="image/*" capture="environment" multiple required />
    <div style="margin-top:12px">
      <button type="submit">Upload</button>
    </div>
  </form>
  <p id="msg"></p>
  <script>
    const form = document.getElementById('f');
    const msg = document.getElementById('msg');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      msg.textContent = 'Uploading...';
      try {
        const res = await fetch(form.action, { method: 'POST', body: fd });
        const json = await res.json();
        if (res.ok) {
          msg.textContent = 'Uploaded ' + json.uploaded + ' photo(s). You can close this page.';
          msg.className = 'ok';
          form.reset();
        } else {
          msg.textContent = json.error || 'Upload failed';
          msg.className = 'err';
        }
      } catch (err) {
        msg.textContent = 'Network error';
        msg.className = 'err';
      }
    });
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`[upload-server] listening on http://localhost:${PORT}`);
});



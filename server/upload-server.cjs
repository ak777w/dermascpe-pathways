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
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Disk persistence: files under server/uploads, tracked per patient in memory
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR, { fallthrough: true }));

// In-memory index of filenames per patientId
const store = Object.create(null);

// Patients persistence (JSON file on disk)
const DATA_DIR = __dirname;
const PATIENTS_FILE = path.join(DATA_DIR, 'patients.json');
const APPTS_FILE = path.join(DATA_DIR, 'appointments.json');
const FORMULARY_FILE = path.join(DATA_DIR, 'formulary.json');
const INTERACTIONS_FILE = path.join(DATA_DIR, 'interactions.json');

function readPatientsFromDisk() {
  try {
    if (!fs.existsSync(PATIENTS_FILE)) {
      fs.writeFileSync(PATIENTS_FILE, JSON.stringify([] , null, 2));
      return [];
    }
    const raw = fs.readFileSync(PATIENTS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePatientsToDisk(patients) {
  fs.writeFileSync(PATIENTS_FILE, JSON.stringify(patients, null, 2));
}

function getNextPatientId(patients) {
  const ids = patients.map((p) => Number(p.id) || 0);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function readAppointments() {
  try {
    if (!fs.existsSync(APPTS_FILE)) {
      fs.writeFileSync(APPTS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    return JSON.parse(fs.readFileSync(APPTS_FILE, 'utf8')) || [];
  } catch { return []; }
}
function writeAppointments(appts) {
  fs.writeFileSync(APPTS_FILE, JSON.stringify(appts, null, 2));
}
function nextApptId(appts) {
  const ids = appts.map((a) => Number(a.id) || 0);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

// --- Formulary & interactions helpers ---
function readFormulary() {
  try {
    const raw = fs.readFileSync(FORMULARY_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function readInteractions() {
  try {
    const raw = fs.readFileSync(INTERACTIONS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

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
    const png = await QRCode.toBuffer(String(text), { type: 'png', margin: 1, width: 240 });
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (e) {
    // Avoid sending headers after write; just end
    try { res.status(500).end(); } catch {}
  }
});

// ---------------- Formulary & Interactions API ----------------
// Search formulary by name substring
app.get('/formulary', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const data = readFormulary();
  const results = q ? data.filter((d) => d.name.toLowerCase().includes(q) || d.id.includes(q)) : data;
  res.json({ drugs: results.slice(0, 50) });
});

// Basic interaction check for a set of drug ids
app.post('/interactions/check', (req, res) => {
  const drugIds = Array.isArray(req.body?.drugIds) ? req.body.drugIds.map(String) : [];
  if (drugIds.length < 2) return res.json({ interactions: [] });
  const pairs = new Set();
  for (let i = 0; i < drugIds.length; i++) {
    for (let j = i + 1; j < drugIds.length; j++) {
      const a = drugIds[i];
      const b = drugIds[j];
      pairs.add([a, b].sort().join('::'));
    }
  }
  const db = readInteractions();
  const out = [];
  for (const key of pairs) {
    const [a, b] = key.split('::');
    const hit = db.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    if (hit) out.push({ a, b, severity: hit.severity, summary: hit.summary });
  }
  res.json({ interactions: out });
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

// ---------------- Patients API ----------------

// Get all patients
app.get('/patients', (req, res) => {
  const patients = readPatientsFromDisk();
  res.json({ patients });
});

// Get single patient
app.get('/patients/:id', (req, res) => {
  const id = Number(req.params.id);
  const patients = readPatientsFromDisk();
  const found = patients.find((p) => Number(p.id) === id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  res.json(found);
});

// Create patient
app.post('/patients', (req, res) => {
  const body = req.body || {};
  const patients = readPatientsFromDisk();
  const id = getNextPatientId(patients);
  const newPatient = {
    id,
    name: String(body.name || '').trim(),
    age: Number(body.age) || 0,
    gender: body.gender || 'Other',
    phone: String(body.phone || ''),
    email: String(body.email || ''),
    medicare: String(body.medicare || ''),
    lastVisit: body.lastVisit || 'New',
    nextAppointment: body.nextAppointment || 'Not scheduled',
    riskLevel: body.riskLevel || 'Low',
    totalLesions: Number(body.totalLesions || 0),
    newLesions: Number(body.newLesions || 0),
    status: body.status || 'Active',
    skinType: body.skinType || 'Unknown',
    familyHistory: body.familyHistory || 'Unknown',
    photos: Array.isArray(body.photos) ? body.photos : undefined,
  };
  patients.unshift(newPatient);
  writePatientsToDisk(patients);
  res.status(201).json(newPatient);
});

// Update/replace patient
app.put('/patients/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const patients = readPatientsFromDisk();
  const idx = patients.findIndex((p) => Number(p.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...body, id };
  patients[idx] = updated;
  writePatientsToDisk(patients);
  res.json(updated);
});

// Partial update
app.patch('/patients/:id', (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};
  const patients = readPatientsFromDisk();
  const idx = patients.findIndex((p) => Number(p.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...patients[idx], ...body, id };
  patients[idx] = updated;
  writePatientsToDisk(patients);
  res.json(updated);
});

// ---------------- Appointments API ----------------
app.get('/appointments', (req, res) => {
  res.json({ appointments: readAppointments() });
});
app.post('/appointments', (req, res) => {
  const appts = readAppointments();
  const id = nextApptId(appts);
  const body = req.body || {};
  const appt = { id, ...body };
  appts.push(appt);
  writeAppointments(appts);
  res.status(201).json(appt);
});
app.patch('/appointments/:id', (req, res) => {
  const id = Number(req.params.id);
  const appts = readAppointments();
  const idx = appts.findIndex(a => Number(a.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  appts[idx] = { ...appts[idx], ...(req.body || {}), id };
  writeAppointments(appts);
  res.json(appts[idx]);
});
app.delete('/appointments/:id', (req, res) => {
  const id = Number(req.params.id);
  const appts = readAppointments();
  const next = appts.filter(a => Number(a.id) !== id);
  writeAppointments(next);
  res.json({ ok: true });
});

// Notification stub
app.post('/appointments/:id/notify', (req, res) => {
  // In a real system, integrate with SMS/email providers
  res.json({ ok: true, sent: ['sms', 'email'] });
});

app.listen(PORT, () => {
  console.log(`[upload-server] listening on http://localhost:${PORT}`);
});



// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ========== ROUTE DE VÉRIFICATION ADMIN ==========
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '@@Mpombo21262578@@@@19';

app.post('/api/verify-admin', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

// Routes de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ROUTES STAFF LOGIN (PERSONNEL) ==========
// Placé AVANT la route /api/staff des médecins pour éviter le conflit
app.use('/api/staff', require('./routes/staff-login'));

// ========== ROUTES PRINCIPALES (MÉDECINS) ==========
app.use('/api/staff', require('./routes/staff'));

app.use('/api/actualites', require('./routes/actualites'));
app.use('/api/events', require('./routes/events'));
app.use('/api/etablissement', require('./routes/etablissement'));
app.use('/api/partenaires', require('./routes/partenaires'));
app.use('/api/tarifs', require('./routes/tarifs'));
app.use('/api/site-content', require('./routes/site-content'));
app.use('/api/specialties', require('./routes/specialties'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/paiement', require('./routes/paiement'));
app.use('/api/paiements', require('./routes/paiement'));
app.use('/api/newsletter', require('./routes/newsletter'));

// ========== ROUTES CHECKUP ==========
app.use('/api/checkup-requests', require('./routes/checkup'));

// ========== ROUTES AVAILABILITY ==========
app.use('/api/availability', require('./routes/availability'));

// ========== ROUTES SALLES DE RÉUNION ==========
app.use('/api/meeting-rooms', require('./routes/meeting-rooms'));

// ========== ROUTES ADMIN : PERSONNEL ==========
app.use('/api/admin/staff', require('./routes/admin/staff'));

// ========== ROUTE UPLOAD ==========
app.use('/api/upload', require('./routes/upload'));

// ========== ROUTES ADMIN ==========
app.use('/api', require('./routes/admin/dashboard'));
app.use('/api/admin/patients', require('./routes/admin/patients'));
app.use('/api/admin/jobs', require('./routes/admin/jobs'));
app.use('/api/admin/results', require('./routes/admin/results'));
app.use('/api/admin/applications', require('./routes/admin/applications'));
app.use('/api/admin/appointments', require('./routes/admin/appointments'));

// ✅ Alias pour que le frontend utilise /api/availabilities
app.use('/api/availabilities', require('./routes/availability'));

// ========== ROUTES MESSAGES ==========
app.use('/api/messages', require('./routes/messages'));

// ========== ROUTES PATIENTS ==========
app.use('/api/patient', require('./routes/patients'));

// ========== ROUTES DOCTORS ==========
app.use('/api/doctor', require('./routes/doctors'));

// ========== ROUTES APPLICATIONS (PUBLIQUES) ==========
app.use('/api/applications', require('./routes/applications'));

// ========== ROUTE PUBLIQUE POUR LES OFFRES ==========
app.get('/api/public-jobs', async (req, res) => {
  console.log('🔥 /api/public-jobs appelée');
  try {
    const result = await pool.query('SELECT * FROM jobs WHERE active = true ORDER BY id DESC');
    console.log(`📦 ${result.rows.length} offres trouvées`);
    res.json(result.rows);
  } catch (err) {
    console.error('💥 ERREUR SQL :', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== SERVIR LE FRONTEND EN PRODUCTION ==========
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(frontendBuildPath));

  // ✅ Correction pour Express 5 – wildcard nommé (sans accolades)
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Middleware d'erreur (à garder à la fin)
app.use((err, req, res, next) => {
  console.error('💥 ERREUR:', err.stack);
  res.status(500).json({ error: err.message });
});

// Démarrage
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 Test DB : http://localhost:${PORT}/api/test-db`);
  console.log(`📋 Routes disponibles : /api/staff, /api/actualites, /api/events, /api/etablissement, /api/partenaires, /api/tarifs, /api/site-content, /api/specialties, /api/appointments, /api/paiement, /api/newsletter, /api/availability, /api/upload, /api/availabilities, /api/admin/applications, /api/admin/appointments, /api/messages, /api/patient, /api/doctor, /api/public-jobs, /api/applications`);
});
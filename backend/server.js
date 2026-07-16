require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 8080;

// ========== MIDDLEWARES ==========
app.use(cors());
app.use(express.json());

// Servir les fichiers uploadés
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

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

// ========== ROUTES PRINCIPALES ==========
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
app.use('/api/availability', require('./routes/availability'));

// ========== ROUTE UPLOAD ==========
app.use('/api/upload', require('./routes/upload'));

// ========== ROUTES ADMIN ==========
app.use('/api', require('./routes/admin/dashboard'));
app.use('/api/admin/patients', require('./routes/admin/patients'));
app.use('/api/admin/jobs', require('./routes/admin/jobs'));
app.use('/api/admin/results', require('./routes/admin/results'));
app.use('/api/admin/applications', require('./routes/admin/applications'));
app.use('/api/admin/appointments', require('./routes/admin/appointments'));

// ✅ Alias pour /api/availabilities
app.use('/api/availabilities', require('./routes/availability'));

// ========== ROUTES MESSAGES ==========
app.use('/api/messages', require('./routes/messages'));

// ========== ROUTES PATIENTS ==========
app.use('/api/patient', require('./routes/patients'));

// ========== ROUTES DOCTORS ==========
app.use('/api/doctor', require('./routes/doctors'));

// ========== ROUTES APPLICATIONS ==========
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

  // ✅ Correction : utiliser app.use au lieu de app.get pour éviter l'erreur path-to-regexp
  app.use('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Middleware d'erreur
app.use((err, req, res, next) => {
  console.error('💥 ERREUR:', err.stack);
  res.status(500).json({ error: err.message });
});

// Démarrage
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📊 Test DB : http://localhost:${PORT}/api/test-db`);
});
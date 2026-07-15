// routes/doctors.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper : convertir la valeur en booléen PostgreSQL
const toBoolean = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return value === '1' || value === 'true' || value === 'on' || value === 'yes';
  }
  return false;
};

// POST /api/doctor/login – Connexion médecin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🐞 LOGS DE DÉBOGAGE
    console.log('📩 Tentative de connexion avec :', { email, password: '****' });

    const result = await pool.query('SELECT * FROM staff WHERE email = $1', [email]);
    console.log('🔍 Requête SQL exécutée, nombre de résultats :', result.rows.length);

    if (result.rows.length === 0) {
      console.log('❌ Aucun utilisateur trouvé pour cet email');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const doctor = result.rows[0];
    console.log('👤 Médecin trouvé :', { id: doctor.id, full_name: doctor.full_name, email: doctor.email });

    if (!doctor.password) {
      console.log('⚠️ Mot de passe manquant dans la base pour cet utilisateur');
      return res.status(401).json({ error: 'Compte non activé (mot de passe manquant)' });
    }

    console.log('🔑 Hash stocké dans la base :', doctor.password);
    const validPassword = await bcrypt.compare(password, doctor.password);
    console.log('✅ Comparaison bcrypt :', validPassword ? 'VALIDE' : 'INVALIDE');

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: doctor.id, name: doctor.full_name, email: doctor.email, specialty: doctor.specialty },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    console.log('✅ Connexion réussie pour', doctor.full_name);

    res.json({
      token,
      doctor: {
        id: doctor.id,
        name: doctor.full_name,
        email: doctor.email,
        specialty: doctor.specialty
      }
    });
  } catch (err) {
    console.error('❌ Erreur login médecin:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doctor/appointments – Récupérer les rendez-vous du médecin
router.get('/appointments', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const result = await pool.query(
      `SELECT a.*, 
              COALESCE(p.first_name || ' ' || p.last_name, a.fullname) as patient_name
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = $1
       ORDER BY a.date DESC`,
      [decoded.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Erreur doctor/appointments:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doctor/profile – Récupérer les informations du médecin connecté
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const result = await pool.query(
      'SELECT id, full_name, email, specialty, department, phone, photo_url FROM staff WHERE id = $1',
      [decoded.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Médecin non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Erreur doctor/profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/doctor/register – Créer un compte médecin (pour l'admin)
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, specialty, department, phone, profession } = req.body;

    // Vérifier si l'email existe déjà
    const existing = await pool.query('SELECT id FROM staff WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Correction : active = true (booléen) au lieu de 1 (entier)
    const result = await pool.query(
      `INSERT INTO staff (full_name, email, password, specialty, department, phone, profession, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, full_name, email, specialty, department`,
      [full_name, email, hashedPassword, specialty, department, phone, profession || 'Médecin', true] // ← true au lieu de 1
    );

    res.status(201).json({
      message: 'Médecin créé avec succès',
      doctor: result.rows[0]
    });
  } catch (err) {
    console.error('❌ Erreur register médecin:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
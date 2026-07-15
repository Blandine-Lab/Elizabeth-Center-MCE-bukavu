const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

// POST /api/patient/login – Connexion patient
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const result = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    const patient = result.rows[0];

    const valid = await bcrypt.compare(password, patient.password);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: patient.id, name: patient.first_name + ' ' + patient.last_name, email: patient.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.json({
      token,
      patient: {
        id: patient.id,
        name: patient.first_name + ' ' + patient.last_name,
        email: patient.email
      }
    });
  } catch (err) {
    console.error('❌ POST /api/patient/login', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patient/appointments – Récupérer les rendez-vous du patient (CORRIGÉ)
router.get('/appointments', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token mal formé' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const patientId = decoded.id;

    // Récupérer l'email du patient
    const patientResult = await pool.query('SELECT email FROM patients WHERE id = $1', [patientId]);
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patient non trouvé' });
    }
    const patientEmail = patientResult.rows[0].email;

    // Requête : on lie par email
    const query = `
      SELECT a.*, s.full_name as doctor_name, s.specialty, a.teleconsultation_validated
      FROM appointments a
      LEFT JOIN staff s ON a.doctor_id = s.id
      WHERE a.email = $1
      ORDER BY a.date DESC
    `;
    const result = await pool.query(query, [patientEmail]);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ GET /api/patient/appointments', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patient/profile – Récupérer le profil du patient connecté
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, phone, is_active FROM patients WHERE id = $1',
      [decoded.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient non trouvé' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ GET /api/patient/profile', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patient/register – Inscription patient
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    const existing = await pool.query('SELECT id FROM patients WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO patients (first_name, last_name, email, password, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, first_name, last_name, email`,
      [first_name, last_name, email, hashed, phone || null, true]
    );
    res.status(201).json({ message: 'Compte créé avec succès', patient: result.rows[0] });
  } catch (err) {
    console.error('❌ POST /api/patient/register', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
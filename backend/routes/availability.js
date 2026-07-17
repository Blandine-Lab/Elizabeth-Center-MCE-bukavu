const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ========== GET /doctor/:doctorId – Récupérer les disponibilités d’un médecin ==========
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    if (isNaN(doctorId)) {
      return res.status(400).json({ error: 'ID médecin invalide' });
    }

    const result = await pool.query(
      'SELECT * FROM availabilities WHERE doctor_id = $1 ORDER BY date ASC, time_slot ASC',
      [doctorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ GET /availability/doctor/:id', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== GET /:doctorId/:date – Créneaux disponibles pour un médecin et une date ==========
router.get('/:doctorId/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const booked = await pool.query(
      `SELECT time FROM appointments 
       WHERE doctor_id = $1 AND date = $2 AND status != 'cancelled'`,
      [doctorId, date]
    );
    const bookedTimes = booked.rows.map(r => r.time);
    const slots = [];
    for (let h = 9; h < 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        if (!bookedTimes.includes(time)) slots.push(time);
      }
    }
    res.json(slots);
  } catch (err) {
    console.error('GET /availability/:doctorId/:date error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== GET /calendar – Calendrier global avec noms des médecins ==========
router.get('/calendar', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, s.full_name as doctor_name
       FROM availabilities a
       LEFT JOIN staff s ON a.doctor_id = s.id
       ORDER BY a.date ASC, a.time_slot ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /availability/calendar error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== POST / – Ajouter un créneau ==========
router.post('/', async (req, res) => {
  try {
    const { doctor_id, date, time_slot } = req.body;
    console.log('📥 POST /availability reçu :', { doctor_id, date, time_slot });

    if (!doctor_id || !date || !time_slot) {
      return res.status(400).json({ error: 'doctor_id, date et time_slot sont requis' });
    }

    // Vérifier que le médecin existe
    const doctorCheck = await pool.query('SELECT id FROM staff WHERE id = $1', [doctor_id]);
    if (doctorCheck.rows.length === 0) {
      return res.status(400).json({ error: `Le médecin avec l'ID ${doctor_id} n'existe pas` });
    }

    // Vérifier les doublons
    const existing = await pool.query(
      'SELECT * FROM availabilities WHERE doctor_id = $1 AND date = $2 AND time_slot = $3',
      [doctor_id, date, time_slot]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ce créneau existe déjà' });
    }

    // Insertion (is_booked en booléen)
    const result = await pool.query(
      `INSERT INTO availabilities (doctor_id, date, time_slot, is_booked)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [doctor_id, date, time_slot, false]
    );

    console.log('✅ Créneau ajouté :', result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('💥 ERREUR POST /availability :');
    console.error('  Message :', err.message);
    console.error('  Détail :', err.detail);
    console.error('  Code :', err.code);
    console.error('  Stack :', err.stack);

    let userMessage = 'Erreur serveur.';
    if (err.code === '23505') {
      userMessage = 'Ce créneau existe déjà.';
    } else if (err.code === '23503') {
      userMessage = 'Le médecin sélectionné est invalide.';
    } else if (err.message) {
      userMessage = err.message;
    }

    res.status(500).json({
      error: userMessage,
      detail: err.detail || null,
      code: err.code || null
    });
  }
});

// ========== DELETE /:id – Supprimer un créneau ==========
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM availabilities WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Créneau non trouvé' });
    }
    res.json({ message: 'Créneau supprimé', deleted: result.rows[0] });
  } catch (err) {
    console.error('DELETE /availability/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
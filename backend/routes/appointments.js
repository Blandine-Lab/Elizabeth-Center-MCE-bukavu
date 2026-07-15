const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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

// GET /api/appointments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, s.full_name as doctor_name
       FROM appointments a
       LEFT JOIN staff s ON a.doctor_id = s.id
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET /appointments :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT a.*, s.full_name as doctor_name
       FROM appointments a
       LEFT JOIN staff s ON a.doctor_id = s.id
       WHERE a.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur GET /appointments/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/appointments
router.post('/', async (req, res) => {
  try {
    // On récupère toutes les données, mais on n'utilise pas `message` pour l'instant
    const { fullname, email, phone, date, time, doctorId, specialty } = req.body;
    
    // Vérifier si le créneau est déjà pris
    const existing = await pool.query(
      `SELECT * FROM appointments 
       WHERE doctor_id = $1 AND date = $2 AND time = $3 AND status != 'cancelled'`,
      [doctorId, date, time]
    );
    
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ce créneau est déjà réservé' });
    }
    
    // Insertion sans la colonne `message` (qui n'existe pas dans certaines bases)
    const result = await pool.query(
      `INSERT INTO appointments (fullname, email, phone, date, time, doctor_id, specialty)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [fullname, email, phone, date, time, doctorId, specialty]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /appointments :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/appointments/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let { status, admin_viewed, doctor_viewed } = req.body;
    
    // Convertir les booléens si présents
    admin_viewed = admin_viewed !== undefined ? toBoolean(admin_viewed) : undefined;
    doctor_viewed = doctor_viewed !== undefined ? toBoolean(doctor_viewed) : undefined;
    
    const result = await pool.query(
      `UPDATE appointments
       SET status = COALESCE($1, status),
           admin_viewed = COALESCE($2, admin_viewed),
           doctor_viewed = COALESCE($3, doctor_viewed)
       WHERE id = $4
       RETURNING *`,
      [status, admin_viewed, doctor_viewed, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT /appointments/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }
    res.json({ message: 'Rendez-vous supprimé', deleted: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE /appointments/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
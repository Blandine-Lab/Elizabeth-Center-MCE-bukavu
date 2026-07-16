const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/checkup-requests
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone, checkup_type, message, preferred_date } = req.body;

    // Validation minimale
    if (!full_name || !email) {
      return res.status(400).json({ error: 'Nom et email sont requis' });
    }

    const result = await pool.query(
      `INSERT INTO checkup_requests 
       (full_name, email, phone, checkup_type, message, preferred_date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [full_name, email, phone || null, checkup_type || null, message || null, preferred_date || null]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Demande de checkup enregistrée',
      id: result.rows[0].id
    });
  } catch (err) {
    console.error('❌ Erreur checkup-requests:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
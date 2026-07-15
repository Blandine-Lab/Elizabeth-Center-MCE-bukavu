const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM applications ORDER BY applied_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET /admin/applications :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
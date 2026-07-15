const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

router.get('/pending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM laboratoire_results WHERE statut = 'pending' ORDER BY created_at DESC`
    ).catch(() => ({ rows: [] }));
    res.json(result.rows);
  } catch (err) {
    res.json([]);
  }
});

module.exports = router;
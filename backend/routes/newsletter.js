const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    const result = await pool.query(
      `INSERT INTO newsletter_subscribers (email, created_at)
       VALUES ($1, NOW())
       ON CONFLICT (email) DO NOTHING
       RETURNING *`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Email déjà inscrit' });
    }
    
    res.status(201).json({ message: 'Inscription réussie', subscriber: result.rows[0] });
  } catch (err) {
    console.error('Erreur /newsletter/subscribe :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/newsletter/count
router.get('/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM newsletter_subscribers');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('Erreur /newsletter/count :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/newsletter/list (admin)
router.get('/list', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM newsletter_subscribers ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /newsletter/list :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
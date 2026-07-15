// routes/events.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events ORDER BY start_date DESC, id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET /events :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur GET /events/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events – Ajouter un événement
router.post('/', async (req, res) => {
  try {
    const { title, description, start_date, end_date, active } = req.body;
    if (!title || !start_date) {
      return res.status(400).json({ error: 'Le titre et la date de début sont requis' });
    }
    const result = await pool.query(
      `INSERT INTO events (title, description, start_date, end_date, active, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [title, description, start_date, end_date || null, active ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /events :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id – Modifier un événement
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, active } = req.body;
    const result = await pool.query(
      `UPDATE events
       SET title = $1, description = $2, start_date = $3, end_date = $4, active = $5
       WHERE id = $6
       RETURNING *`,
      [title, description, start_date, end_date, active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT /events/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    res.json({ message: 'Événement supprimé', deleted: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE /events/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
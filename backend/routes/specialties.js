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

// GET /api/specialties – Récupérer toutes les spécialités actives
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM specialties WHERE active = true ORDER BY name ASC'  // ← true
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /specialties :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/specialties/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM specialties WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Spécialité non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur /specialties/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/specialties – Ajouter une spécialité (admin)
router.post('/', async (req, res) => {
  try {
    const { name, description, active } = req.body;
    const activeBool = toBoolean(active);
    const result = await pool.query(
      `INSERT INTO specialties (name, description, active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, activeBool]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /specialties :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/specialties/:id – Modifier une spécialité
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;
    const activeBool = toBoolean(active);
    const result = await pool.query(
      `UPDATE specialties
       SET name = $1, description = $2, active = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, activeBool, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Spécialité non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT /specialties/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/specialties/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM specialties WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Spécialité non trouvée' });
    }
    res.json({ message: 'Spécialité supprimée', deleted: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE /specialties/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
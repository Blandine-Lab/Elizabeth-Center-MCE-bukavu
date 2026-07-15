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

// GET /api/etablissement – Récupérer toutes les photos actives
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM etablissement WHERE active = true ORDER BY ordre ASC, id ASC'  // ← true au lieu de 1
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /etablissement :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/etablissement/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM etablissement WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur /etablissement/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/etablissement – Ajouter une photo
router.post('/', async (req, res) => {
  try {
    const { titre, description, image_url, active, ordre } = req.body;
    const activeBool = toBoolean(active); // conversion
    const result = await pool.query(
      `INSERT INTO etablissement (titre, description, image_url, active, ordre)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [titre, description, image_url, activeBool, ordre || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /etablissement :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/etablissement/:id – Modifier une photo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, image_url, active, ordre } = req.body;
    const activeBool = toBoolean(active); // conversion
    const result = await pool.query(
      `UPDATE etablissement
       SET titre = $1, description = $2, image_url = $3,
           active = $4, ordre = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [titre, description, image_url, activeBool, ordre, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT /etablissement/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/etablissement/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM etablissement WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }
    res.json({ message: 'Photo supprimée', deleted: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE /etablissement/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Helper : convertir la valeur reçue (1/0, true/false, string) en booléen PostgreSQL
const toBoolean = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return value === '1' || value === 'true' || value === 'on' || value === 'yes';
  }
  return false;
};

// GET /api/actualites – Récupérer toutes les actualités actives
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM actualites WHERE active = true ORDER BY ordre ASC, id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /actualites :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/actualites/:id – Récupérer une actualité par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM actualites WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actualité non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur /actualites/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/actualites – Ajouter une actualité (admin)
router.post('/', async (req, res) => {
  try {
    const { titre, description, image_url, active, ordre } = req.body;
    const activeBool = toBoolean(active);
    const result = await pool.query(
      `INSERT INTO actualites (titre, description, image_url, active, ordre)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [titre, description, image_url, activeBool, ordre || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /actualites :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/actualites/:id – Modifier une actualité
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, image_url, active, ordre } = req.body;
    const activeBool = toBoolean(active);
    const result = await pool.query(
      `UPDATE actualites
       SET titre = $1, description = $2, image_url = $3,
           active = $4, ordre = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [titre, description, image_url, activeBool, ordre, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actualité non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT /actualites/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/actualites/:id – Supprimer une actualité
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM actualites WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actualité non trouvée' });
    }
    res.json({ message: 'Actualité supprimée', deleted: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE /actualites/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
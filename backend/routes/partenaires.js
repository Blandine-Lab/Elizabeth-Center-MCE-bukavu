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

// GET /api/partenaires – Récupérer tous les partenaires actifs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM partenaires WHERE active = true ORDER BY ordre ASC, id ASC'  // ← true au lieu de 1
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /partenaires :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/partenaires/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM partenaires WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partenaire non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur /partenaires/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/partenaires – Ajouter un partenaire
router.post('/', async (req, res) => {
  try {
    const { nom, description, commentaire, image_url, active, ordre } = req.body;
    const activeBool = toBoolean(active); // conversion
    const result = await pool.query(
      `INSERT INTO partenaires (nom, description, commentaire, image_url, active, ordre)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nom, description, commentaire, image_url, activeBool, ordre || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /partenaires :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/partenaires/:id – Modifier un partenaire
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, commentaire, image_url, active, ordre } = req.body;
    const activeBool = toBoolean(active); // conversion
    const result = await pool.query(
      `UPDATE partenaires
       SET nom = $1, description = $2, commentaire = $3,
           image_url = $4, active = $5, ordre = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [nom, description, commentaire, image_url, activeBool, ordre, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partenaire non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT /partenaires/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/partenaires/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM partenaires WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partenaire non trouvé' });
    }
    res.json({ message: 'Partenaire supprimé', deleted: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE /partenaires/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
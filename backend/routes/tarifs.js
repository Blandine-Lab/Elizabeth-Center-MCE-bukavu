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

// GET /api/tarifs – Récupérer tous les tarifs actifs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tarifs WHERE active = true ORDER BY service ASC, ordre ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /tarifs :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tarifs/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tarifs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarif non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur /tarifs/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tarifs – Ajouter un tarif
router.post('/', async (req, res) => {
  try {
    const { service, prestation, prix, description, active, ordre } = req.body;
    const activeBool = toBoolean(active);
    const result = await pool.query(
      `INSERT INTO tarifs (service, prestation, prix, description, active, ordre)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [service, prestation, prix, description, activeBool, ordre || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /tarifs :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tarifs/:id – Modifier un tarif
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { service, prestation, prix, description, active, ordre } = req.body;
    const activeBool = toBoolean(active);
    const result = await pool.query(
      `UPDATE tarifs
       SET service = $1, prestation = $2, prix = $3,
           description = $4, active = $5, ordre = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [service, prestation, prix, description, activeBool, ordre, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarif non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT /tarifs/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tarifs/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tarifs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarif non trouvé' });
    }
    res.json({ message: 'Tarif supprimé', deleted: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE /tarifs/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
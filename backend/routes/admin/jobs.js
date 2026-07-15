const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

// Helper : convertir en booléen
const toBoolean = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return value === '1' || value === 'true' || value === 'on' || value === 'yes';
  }
  return false;
};

// GET toutes les offres (admin)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET /admin/jobs :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST ajouter une offre
router.post('/', async (req, res) => {
  try {
    const { title, department, contract_type, location, description, requirements, salary_range, active } = req.body;
    const activeBool = toBoolean(active);
    const result = await pool.query(
      `INSERT INTO jobs (title, department, contract_type, location, description, requirements, salary_range, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, department, contract_type, location, description, requirements, salary_range, activeBool]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /admin/jobs :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT modifier une offre
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, contract_type, location, description, requirements, salary_range, active } = req.body;
    const activeBool = toBoolean(active);
    const result = await pool.query(
      `UPDATE jobs
       SET title = $1, department = $2, contract_type = $3, location = $4,
           description = $5, requirements = $6, salary_range = $7, active = $8
       WHERE id = $9
       RETURNING *`,
      [title, department, contract_type, location, description, requirements, salary_range, activeBool, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT /admin/jobs/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE supprimer une offre
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }
    res.json({ message: 'Offre supprimée', deleted: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE /admin/jobs/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
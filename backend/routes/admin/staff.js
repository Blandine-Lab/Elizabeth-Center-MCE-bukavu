const express = require('express');
const router = express.Router();
const pool = require('../../config/db'); // ⚠️ chemin relatif : on remonte deux dossiers
const bcrypt = require('bcrypt');

// GET /api/admin/staff – Liste du personnel
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM personnel ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ GET /admin/staff :', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/staff – Ajouter un membre du personnel
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO personnel (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashed, role || 'staff']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ POST /admin/staff :', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/staff/:id – Modifier un membre
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    let query = 'UPDATE personnel SET name = $1, email = $2, role = $3';
    const params = [name, email, role];
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += ', password = $4';
      params.push(hashed);
    }
    query += ' WHERE id = $' + (params.length + 1) + ' RETURNING id, name, email, role';
    params.push(id);
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personnel non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ PUT /admin/staff/:id :', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/staff/:id – Supprimer un membre
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM personnel WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personnel non trouvé' });
    }
    res.json({ message: 'Personnel supprimé', id: result.rows[0].id });
  } catch (err) {
    console.error('❌ DELETE /admin/staff/:id :', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
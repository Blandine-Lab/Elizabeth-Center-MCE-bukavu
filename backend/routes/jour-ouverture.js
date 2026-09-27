// backend/routes/jour-ouverture.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// =====================================================
// Création automatique de la table au démarrage
// =====================================================
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jour_ouverture (
        id SERIAL PRIMARY KEY,
        type VARCHAR(10) NOT NULL CHECK (type IN ('photo', 'video')),
        url TEXT NOT NULL,
        titre VARCHAR(255),
        description TEXT,
        active BOOLEAN DEFAULT true,
        ordre INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Table jour_ouverture vérifiée/créée');
  } catch (err) {
    console.error('❌ Erreur création table jour_ouverture :', err.message);
  }
})();

// =====================================================
// Helper : convertir en booléen PostgreSQL
// =====================================================
const toBoolean = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return value === '1' || value === 'true' || value === 'on' || value === 'yes';
  }
  return false;
};

// =====================================================
// GET /api/jour-ouverture
// =====================================================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jour_ouverture WHERE active = true ORDER BY ordre ASC, id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET /jour-ouverture :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// GET /api/jour-ouverture/all
// =====================================================
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jour_ouverture ORDER BY ordre ASC, id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET /jour-ouverture/all :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// GET /api/jour-ouverture/:id
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM jour_ouverture WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur GET /jour-ouverture/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// POST /api/jour-ouverture
// =====================================================
router.post('/', async (req, res) => {
  try {
    const { type, url, titre, description, active, ordre } = req.body;

    if (!type || !['photo', 'video'].includes(type)) {
      return res.status(400).json({ error: 'Le type doit être "photo" ou "video"' });
    }
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({ error: 'L\'URL du média est obligatoire' });
    }

    const activeBool = toBoolean(active);

    const result = await pool.query(
      `INSERT INTO jour_ouverture (type, url, titre, description, active, ordre)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [type, url, titre || null, description || null, activeBool, ordre || 0]
    );

    console.log(`✅ Média ajouté : ${type} #${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /jour-ouverture :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// PUT /api/jour-ouverture/:id
// =====================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, url, titre, description, active, ordre } = req.body;

    if (!type || !['photo', 'video'].includes(type)) {
      return res.status(400).json({ error: 'Le type doit être "photo" ou "video"' });
    }
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({ error: 'L\'URL du média est obligatoire' });
    }

    const activeBool = toBoolean(active);

    const result = await pool.query(
      `UPDATE jour_ouverture
       SET type = $1,
           url = $2,
           titre = $3,
           description = $4,
           active = $5,
           ordre = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [type, url, titre || null, description || null, activeBool, ordre || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }

    console.log(`✅ Média #${id} mis à jour`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT /jour-ouverture/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// DELETE /api/jour-ouverture/:id
// =====================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM jour_ouverture WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }
    console.log(`🗑️ Média #${id} supprimé`);
    res.json({ message: 'Média supprimé', deleted: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE /jour-ouverture/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
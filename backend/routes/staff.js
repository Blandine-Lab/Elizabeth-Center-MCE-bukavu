const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

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

// GET /api/staff – Récupérer tous les médecins
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM staff ORDER BY ordre ASC, id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /staff :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/staff/:id – Récupérer un médecin par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM staff WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Médecin non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur /staff/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/staff – Ajouter un médecin (admin)
router.post('/', async (req, res) => {
  try {
    const {
      full_name,
      profession,
      specialty,
      department,
      photo_url,
      active,
      ordre,
      bio,
      email,
      phone,
      password,
      telegram_chat_id
    } = req.body;

    const activeBool = toBoolean(active);
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(
      `INSERT INTO staff (
        full_name, profession, specialty, department,
        photo_url, active, ordre, bio,
        email, phone, password, telegram_chat_id,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        full_name,
        profession,
        specialty,
        department,
        photo_url,
        activeBool,
        ordre ?? 0,
        bio || null,
        email || null,
        phone || null,
        hashedPassword,
        telegram_chat_id || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /staff :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/staff/:id – Modifier un médecin (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      profession,
      specialty,
      department,
      photo_url,
      active,
      ordre,
      bio,
      email,
      phone,
      password,
      telegram_chat_id
    } = req.body;

    const activeBool = toBoolean(active);
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(
      `UPDATE staff
       SET
         full_name = $1,
         profession = $2,
         specialty = $3,
         department = $4,
         photo_url = $5,
         active = $6,
         ordre = $7,
         bio = $8,
         email = $9,
         phone = $10,
         password = COALESCE($11, password),
         telegram_chat_id = $12,
         updated_at = NOW()
       WHERE id = $13
       RETURNING *`,
      [
        full_name,
        profession,
        specialty,
        department,
        photo_url,
        activeBool,
        ordre ?? 0,
        bio || null,
        email || null,
        phone || null,
        hashedPassword,
        telegram_chat_id || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Médecin non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT /staff/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===== DELETE /api/staff/:id – Supprimer un médecin (avec nettoyage des dépendances) =====
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Démarrer une transaction
    await client.query('BEGIN');

    // 1. Supprimer les disponibilités liées
    await client.query('DELETE FROM availabilities WHERE doctor_id = $1', [id]);

    // 2. Supprimer les rendez-vous liés
    await client.query('DELETE FROM appointments WHERE doctor_id = $1', [id]);

    // 3. Supprimer le médecin lui-même
    const result = await client.query(
      'DELETE FROM staff WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Médecin non trouvé' });
    }

    // Valider la transaction
    await client.query('COMMIT');
    res.json({ message: 'Médecin et dépendances supprimés', deleted: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur DELETE /staff/:id :', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/staff/:id/password – Réinitialiser le mot de passe
router.put('/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'UPDATE staff SET password = $1 WHERE id = $2 RETURNING id, full_name, email',
      [hashed, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Médecin non trouvé' });
    }
    res.json({ message: 'Mot de passe mis à jour avec succès', doctor: result.rows[0] });
  } catch (err) {
    console.error('Erreur PUT /staff/:id/password :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
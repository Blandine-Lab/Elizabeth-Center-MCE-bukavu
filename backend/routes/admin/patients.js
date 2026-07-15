const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const bcrypt = require('bcrypt');

// GET /api/admin/patients – Liste des patients
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         p.id,
         p.first_name,
         p.last_name,
         p.email,
         p.phone,
         p.is_active,
         p.created_at,
         (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.id) as total_rdv,
         (SELECT MAX(date) FROM appointments a WHERE a.patient_id = p.id) as last_visit
       FROM patients p
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET /admin/patients :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/patients – Ajouter un patient
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Prénom, nom, email et mot de passe sont requis' });
    }

    // Vérifier si l'email existe déjà
    const existing = await pool.query('SELECT id FROM patients WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO patients (first_name, last_name, email, phone, password, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, first_name, last_name, email, phone, is_active, created_at`,
      [first_name, last_name, email, phone || null, hashedPassword, true]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /admin/patients :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/patients/:id – Modifier un patient
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, is_active, password } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID patient manquant' });
    }

    // Vérifier que le patient existe
    const check = await pool.query('SELECT id FROM patients WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Patient non trouvé' });
    }

    // Construction dynamique de la requête
    let updates = [];
    let values = [];
    let idx = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${idx++}`);
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push(`last_name = $${idx++}`);
      values.push(last_name);
    }
    if (email !== undefined) {
      updates.push(`email = $${idx++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${idx++}`);
      values.push(phone);
    }
    if (is_active !== undefined) {
      const active = (is_active === true || is_active === 1 || is_active === 'true');
      updates.push(`is_active = $${idx++}`);
      values.push(active);
    }
    if (password && password.trim().length > 0) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push(`password = $${idx++}`);
      values.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à modifier' });
    }

    values.push(id);
    const query = `
      UPDATE patients 
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING id, first_name, last_name, email, phone, is_active, created_at
    `;

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur PUT /admin/patients/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/patients/:id – Supprimer un patient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient non trouvé' });
    }
    res.json({ message: 'Patient supprimé', deleted: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE /admin/patients/:id :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
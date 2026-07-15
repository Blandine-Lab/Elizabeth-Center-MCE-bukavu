const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

// GET /api/stats – Statistiques pour le tableau de bord
router.get('/stats', async (req, res) => {
  try {
    // Total des rendez-vous
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM appointments');
    const total = parseInt(totalResult.rows[0].count);

    // Rendez-vous par jour (30 derniers jours)
    const perDayResult = await pool.query(`
      SELECT date, COUNT(*) as nb
      FROM appointments
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `);
    const perDay = perDayResult.rows.map(row => ({ date: row.date, nb: parseInt(row.nb) }));

    // Rendez-vous par médecin
    const perDoctorResult = await pool.query(`
      SELECT s.full_name as name, COUNT(a.id) as nb
      FROM appointments a
      LEFT JOIN staff s ON a.doctor_id = s.id
      GROUP BY s.full_name
      ORDER BY nb DESC
    `);
    const perDoctor = perDoctorResult.rows.map(row => ({ 
      name: row.name || 'Inconnu', 
      nb: parseInt(row.nb) 
    }));

    res.json({
      total: { total },
      perDay,
      perDoctor
    });
  } catch (err) {
    console.error('Erreur /admin/stats :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/patients – Liste des patients (à partir des rendez-vous)
router.get('/patients', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT email, fullname, phone, 
        (SELECT COUNT(*) FROM appointments a2 WHERE a2.email = a.email) as total_rdv,
        MAX(created_at) as last_visit
       FROM appointments a
       GROUP BY email, fullname, phone
       ORDER BY last_visit DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /admin/patients :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/applications – Candidatures reçues
router.get('/applications', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM applications ORDER BY applied_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /admin/applications :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/jobs – Offres d'emploi actives
router.get('/jobs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM jobs WHERE active = true ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /admin/jobs :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/results/pending – Résultats de laboratoire en attente
router.get('/results/pending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM laboratoire_results WHERE statut = 'pending' ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur /admin/results/pending :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
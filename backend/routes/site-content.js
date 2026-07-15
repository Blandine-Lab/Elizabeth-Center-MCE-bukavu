const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ========== ROUTES SPÉCIFIQUES ==========
// GET /api/site-content/footer
router.get('/footer', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT contenu FROM site_content WHERE key = 'footer'"
    );
    if (result.rows.length === 0) {
      return res.json({});
    }
    try {
      res.json(JSON.parse(result.rows[0].contenu));
    } catch {
      res.json({ raw: result.rows[0].contenu });
    }
  } catch (err) {
    console.error('Erreur /site-content/footer :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/site-content/paiement_facture
router.get('/paiement_facture', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT contenu FROM site_content WHERE key = 'paiement_facture'"
    );
    if (result.rows.length === 0) {
      return res.json({ contenu: '' });
    }
    try {
      const parsed = JSON.parse(result.rows[0].contenu);
      res.json(parsed);
    } catch {
      res.json({ contenu: result.rows[0].contenu });
    }
  } catch (err) {
    console.error('Erreur /site-content/paiement_facture :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/site-content/home
router.get('/home', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT contenu FROM site_content WHERE key = 'home'"
    );
    if (result.rows.length === 0) {
      return res.json({});
    }
    try {
      res.json(JSON.parse(result.rows[0].contenu));
    } catch {
      res.json({ raw: result.rows[0].contenu });
    }
  } catch (err) {
    console.error('Erreur /site-content/home :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ NOUVELLE ROUTE : GET /api/site-content/topbar – Numéro d'urgence
router.get('/topbar', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT contenu FROM site_content WHERE key = 'topbar'"
    );
    if (result.rows.length === 0) {
      // Valeur par défaut si la clé n'existe pas
      return res.json({ telephoneUrgence: '+33 (0)1 88 88 88 88' });
    }
    try {
      res.json(JSON.parse(result.rows[0].contenu));
    } catch {
      res.json({ telephoneUrgence: '+33 (0)1 88 88 88 88' });
    }
  } catch (err) {
    console.error('Erreur /site-content/topbar :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== ROUTE GÉNÉRIQUE ==========
// GET /api/site-content/:page
router.get('/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const result = await pool.query(
      'SELECT contenu FROM site_content WHERE key = $1',
      [page]
    );
    if (result.rows.length === 0) {
      return res.json({ contenu: '{}' });
    }
    res.json({ contenu: result.rows[0].contenu });
  } catch (err) {
    console.error('Erreur GET /site-content/:page :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/site-content – Mettre à jour ou créer un contenu
router.post('/', async (req, res) => {
  try {
    const { key, contenu } = req.body;
    const result = await pool.query(
      `INSERT INTO site_content (key, contenu, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET contenu = $2, updated_at = NOW()
       RETURNING *`,
      [key, typeof contenu === 'string' ? contenu : JSON.stringify(contenu)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /site-content :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
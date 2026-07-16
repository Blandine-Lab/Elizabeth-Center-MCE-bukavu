const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { sendBulkNewsletter } = require('../services/emailService');

// ... vos autres routes (count, subscribe, export) restent inchangées

router.post('/send', async (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ error: 'Sujet et contenu requis' });
    }

    const result = await pool.query('SELECT email FROM newsletter_subscribers WHERE active = true');
    const emails = result.rows.map(row => row.email);

    if (emails.length === 0) {
      return res.status(400).json({ error: 'Aucun abonné actif' });
    }

    const sendResult = await sendBulkNewsletter(subject, content, emails);

    if (sendResult.success) {
      res.json({ success: true, message: `✅ Newsletter envoyée à ${emails.length} abonnés` });
    } else {
      res.status(500).json({ error: sendResult.error });
    }
  } catch (err) {
    console.error('Erreur /send:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
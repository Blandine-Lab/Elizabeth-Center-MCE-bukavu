const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const nodemailer = require('nodemailer');

// Utiliser le même transporteur que précédemment
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Route pour envoyer la newsletter
router.post('/send', async (req, res) => {
  try {
    const { subject, content } = req.body;

    // Récupérer tous les abonnés actifs
    const subscribers = await pool.query('SELECT email FROM newsletter_subscribers WHERE active = true');

    if (subscribers.rows.length === 0) {
      return res.status(400).json({ error: 'Aucun abonné actif' });
    }

    const emails = subscribers.rows.map(row => row.email);

    // Envoyer à tous (en batch)
    const mailOptions = {
      from: `"Medical Center Elizabeth" <${process.env.SMTP_FROM_EMAIL}>`,
      bcc: emails.join(','), // BCC pour cacher les adresses
      subject: subject,
      html: content,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: `Newsletter envoyée à ${emails.length} abonnés` });
  } catch (err) {
    console.error('Erreur envoi newsletter :', err);
    res.status(500).json({ error: err.message });
  }
});

// Autres routes (subscribe, unsubscribe, count, export)
// ...

module.exports = router;
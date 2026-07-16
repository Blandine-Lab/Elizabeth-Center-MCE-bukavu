const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { sendCandidateConfirmation, sendAdminAlert } = require('../services/emailService');

router.post('/', async (req, res) => {
  try {
    const { jobId, jobTitle, fullName, email, phone, message, cvUrl } = req.body;

    if (!jobId || !fullName || !email || !cvUrl) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const result = await pool.query(
      `INSERT INTO applications 
       (job_id, job_title, full_name, email, phone, message, cv_url, applied_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'pending')
       RETURNING *`,
      [jobId, jobTitle, fullName, email, phone || '', message || '', cvUrl]
    );

    // Envoi des emails en arrière-plan
    Promise.allSettled([
      sendCandidateConfirmation(email, fullName, jobTitle),
      sendAdminAlert(fullName, email, jobTitle, cvUrl),
    ]);

    res.status(201).json({
      success: true,
      application: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur enregistrement candidature :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
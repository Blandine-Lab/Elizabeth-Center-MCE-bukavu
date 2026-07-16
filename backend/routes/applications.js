const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { sendCandidateConfirmation, sendAdminAlert } = require('../config/email');

router.post('/', async (req, res) => {
  try {
    const { jobId, jobTitle, fullName, email, phone, message, cvUrl } = req.body;

    if (!jobId || !fullName || !email || !cvUrl) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    // Enregistrement en base
    const result = await pool.query(
      `INSERT INTO applications 
       (job_id, job_title, full_name, email, phone, message, cv_url, applied_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'pending')
       RETURNING *`,
      [jobId, jobTitle, fullName, email, phone || '', message || '', cvUrl]
    );

    // Envoi des emails en arrière-plan (ne pas bloquer la réponse)
    // On utilise Promise.allSettled pour ne pas échouer si un email plante
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
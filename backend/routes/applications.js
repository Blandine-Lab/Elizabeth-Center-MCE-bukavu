const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { sendCandidateConfirmation, sendAdminAlert } = require('../config/email');

router.post('/', async (req, res) => {
  try {
    const { jobId, jobTitle, fullName, email, phone, message, cvUrl } = req.body;

    console.log('📝 Nouvelle candidature reçue:', { jobId, jobTitle, fullName, email });

    if (!jobId || !fullName || !email || !cvUrl) {
      console.warn('⚠️ Champs obligatoires manquants');
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

    console.log('✅ Candidature enregistrée en base, ID:', result.rows[0].id);

    // Envoi des emails en arrière-plan
    console.log('📧 Tentative d\'envoi d\'emails...');
    console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NON DÉFINI');
    console.log('📧 ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ NON DÉFINI');

    Promise.allSettled([
      sendCandidateConfirmation(email, fullName, jobTitle),
      sendAdminAlert(fullName, email, jobTitle, cvUrl),
    ]).then(results => {
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ Email ${index + 1} envoyé avec succès:`, result.value);
        } else {
          console.error(`❌ Email ${index + 1} échoué:`, result.reason);
        }
      });
    });

    res.status(201).json({
      success: true,
      application: result.rows[0]
    });
  } catch (err) {
    console.error('❌ Erreur enregistrement candidature :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
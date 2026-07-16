const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const SibApiV3Sdk = require('@sendinblue/client');

// ===== CONFIGURATION BREVO API =====
const apiKey = process.env.BREVO_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'contact@medicalcenterelizabeth.org';
const adminEmail = process.env.ADMIN_EMAIL || emailFrom;

if (!apiKey) {
  console.warn('⚠️ BREVO_API_KEY non définie – les emails ne seront pas envoyés.');
}

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);

async function sendEmailBrevo({ to, subject, html, text }) {
  if (!apiKey) {
    console.warn('❌ Clé API Brevo manquante');
    return { success: false, error: 'API key missing' };
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { email: emailFrom, name: 'Medical Center Elizabeth' };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.textContent = text || html.replace(/<[^>]*>?/gm, '');

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email envoyé à ${to} – ID: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email Brevo:', error.response?.body || error.message);
    return { success: false, error: error.message };
  }
}

async function sendCandidateConfirmation(candidateEmail, fullName, jobTitle) {
  console.log(`📧 Envoi confirmation à ${candidateEmail}...`);
  const subject = `✅ Confirmation de votre candidature – Medical Center Elizabeth`;
  const html = `...`; // Votre template HTML identique
  return sendEmailBrevo({ to: candidateEmail, subject, html });
}

async function sendAdminAlert(fullName, email, jobTitle, cvUrl, phone, message) {
  console.log(`📧 Envoi notification admin...`);
  const subject = `📩 Nouvelle candidature – ${jobTitle}`;
  const html = `...`; // Votre template HTML
  return sendEmailBrevo({ to: adminEmail, subject, html });
}

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

    console.log('✅ Candidature enregistrée, ID:', result.rows[0].id);

    const emailResults = await Promise.allSettled([
      sendCandidateConfirmation(email, fullName, jobTitle),
      sendAdminAlert(fullName, email, jobTitle, cvUrl, phone, message),
    ]);

    emailResults.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        console.log(`✅ Email ${i+1} envoyé avec succès`);
      } else {
        console.error(`❌ Email ${i+1} échoué:`, r.reason);
      }
    });

    res.status(201).json({ success: true, application: result.rows[0] });
  } catch (err) {
    console.error('❌ Erreur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
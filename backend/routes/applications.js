const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const axios = require('axios');

// ===== CONFIGURATION API BREVO =====
const {
  BREVO_API_KEY,
  EMAIL_FROM,
  ADMIN_EMAIL
} = process.env;

console.log('📧 Configuration Brevo API chargée:');
console.log('   BREVO_API_KEY:', BREVO_API_KEY ? '✅ Défini' : '❌ NON DÉFINI');
console.log('   EMAIL_FROM:', EMAIL_FROM || '❌ NON DÉFINI');

/**
 * Envoyer un email via l'API Brevo
 */
async function sendEmailBrevo({ to, subject, html, text }) {
  if (!BREVO_API_KEY) {
    console.warn('❌ Clé API Brevo non configurée');
    return { success: false, error: 'BREVO_API_KEY not configured' };
  }

  try {
    const response = await axios({
      method: 'POST',
      url: 'https://api.brevo.com/v3/smtp/email',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        sender: {
          name: 'Medical Center Elizabeth',
          email: EMAIL_FROM,
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text || html.replace(/<[^>]*>?/gm, ''),
      },
      timeout: 15000,
    });

    console.log(`✅ Email envoyé à ${to} – ID: ${response.data.messageId}`);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email via Brevo API:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// ===== FONCTIONS D'ENVOI =====
async function sendCandidateConfirmation(candidateEmail, fullName, jobTitle) {
  console.log(`📧 Envoi confirmation à ${candidateEmail}...`);
  const subject = `✅ Confirmation de votre candidature – Medical Center Elizabeth`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; padding: 20px 0; border-bottom: 3px solid #0b6e8f;">
        <h1 style="color: #0b6e8f; margin: 0;">🏥 Medical Center Elizabeth</h1>
        <p style="color: #666; margin: 5px 0 0;">Bukavu – RDC</p>
      </div>
      <div style="padding: 30px 0;">
        <h2 style="color: #0b6e8f;">Bonjour ${fullName},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Nous avons bien reçu votre candidature pour le poste de <strong>${jobTitle}</strong>.
        </p>
        <div style="background: #f0f7fc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0b6e8f;">
          <p style="margin: 0; color: #0b6e8f; font-weight: bold;">📋 Votre dossier est en cours de traitement</p>
          <p style="margin: 5px 0 0; color: #555;">Nous vous répondrons dans un délai <strong>maximum de 20 jours ouvrables</strong>.</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Nous vous remercions pour votre intérêt envers notre établissement et vous souhaitons une excellente journée.
        </p>
      </div>
      <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center; color: #999; font-size: 14px;">
        <p>Medical Center Elizabeth – Bukavu, RDC</p>
        <p style="margin: 5px 0;">📞 +243 992 952 038 &nbsp;|&nbsp; 📧 contact@medicalcenterelizabeth.org</p>
        <p style="margin: 5px 0;"><a href="https://www.medicalcenterelizabeth.org" style="color: #0b6e8f; text-decoration: none;">www.medicalcenterelizabeth.org</a></p>
      </div>
    </div>
  `;
  return sendEmailBrevo({ to: candidateEmail, subject, html });
}

async function sendAdminAlert(fullName, email, jobTitle, cvUrl, phone, message) {
  console.log(`📧 Envoi notification admin...`);
  const subject = `📩 Nouvelle candidature – ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 3px solid #0b6e8f;">
        <h1 style="color: #0b6e8f; margin: 0;">📩 Nouvelle candidature</h1>
      </div>
      <div style="padding: 25px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Candidat :</td><td style="padding: 8px 0; color: #333;">${fullName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Email :</td><td style="padding: 8px 0; color: #333;"><a href="mailto:${email}" style="color: #0b6e8f;">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Téléphone :</td><td style="padding: 8px 0; color: #333;">${phone || 'Non renseigné'}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Poste :</td><td style="padding: 8px 0; color: #333;"><strong>${jobTitle}</strong></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">CV :</td><td style="padding: 8px 0;"><a href="${cvUrl}" target="_blank" style="background: #0b6e8f; color: white; padding: 5px 12px; border-radius: 5px; text-decoration: none;">📄 Télécharger</a></td></tr>
          ${message ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Message :</td><td style="padding: 8px 0; color: #333;">${message}</td></tr>` : ''}
        </table>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #e9ecef;">
          <p style="margin: 0; color: #0b6e8f; font-weight: bold;">🔔 Action requise</p>
          <p style="margin: 5px 0 0; color: #555;">Connectez-vous au panel admin pour traiter cette candidature.</p>
          <a href="https://www.medicalcenterelizabeth.org/admin" style="display: inline-block; background: #0b6e8f; color: white; padding: 10px 25px; margin-top: 10px; border-radius: 25px; text-decoration: none; font-weight: bold;">👉 Accéder au panel admin</a>
        </div>
      </div>
      <div style="border-top: 1px solid #e0e0e0; padding-top: 15px; text-align: center; color: #999; font-size: 12px;">
        <p>Medical Center Elizabeth – Bukavu, RDC</p>
        <p>Ce message a été envoyé automatiquement par le système de candidatures.</p>
      </div>
    </div>
  `;
  return sendEmailBrevo({ to: ADMIN_EMAIL || EMAIL_FROM, subject, html });
}

// ===== ROUTE PRINCIPALE =====
router.post('/', async (req, res) => {
  try {
    const { jobId, jobTitle, fullName, email, phone, message, cvUrl } = req.body;

    console.log('📝 Nouvelle candidature reçue:', { jobId, jobTitle, fullName, email });

    if (!jobId || !fullName || !email || !cvUrl) {
      console.warn('⚠️ Champs obligatoires manquants');
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const result = await pool.query(
      `INSERT INTO applications 
       (job_id, job_title, full_name, email, phone, message, cv_url, applied_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'pending')
       RETURNING *`,
      [jobId, jobTitle, fullName, email, phone || '', message || '', cvUrl]
    );

    console.log('✅ Candidature enregistrée en base, ID:', result.rows[0].id);

    console.log('📧 Tentative d\'envoi d\'emails via Brevo API...');

    const emailResults = await Promise.allSettled([
      sendCandidateConfirmation(email, fullName, jobTitle),
      sendAdminAlert(fullName, email, jobTitle, cvUrl, phone, message),
    ]);

    emailResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Email ${index + 1} envoyé avec succès:`, result.value);
      } else {
        console.error(`❌ Email ${index + 1} échoué:`, result.reason);
      }
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
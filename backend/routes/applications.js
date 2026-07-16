const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const SibApiV3Sdk = require('@sendinblue/client');

// ============================================================
// 1. CONFIGURATION BREVO (VERSION CORRIGÉE)
// ============================================================
const apiKey = process.env.BREVO_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'contact@medicalcenterelizabeth.org';
const adminEmail = process.env.ADMIN_EMAIL || emailFrom;

if (!apiKey) {
  console.warn('⚠️  BREVO_API_KEY non définie – les emails ne seront pas envoyés.');
}

// ✅ NOUVELLE MÉTHODE D'AUTHENTIFICATION (fonctionne avec la version récente)
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  apiKey
);

// ============================================================
// 2. FONCTION D'ENVOI AVEC TIMEOUT (15 secondes max)
// ============================================================
async function sendEmailBrevo({ to, subject, html, text }) {
  if (!apiKey) {
    console.warn('❌ Clé API Brevo manquante');
    return { success: false, error: 'API key missing' };
  }

  // ✅ On utilise l'objet directement, plus besoin de SendSmtpEmail
  const emailData = {
    sender: { email: emailFrom, name: 'Medical Center Elizabeth' },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html,
    textContent: text || html.replace(/<[^>]*>?/gm, '')
  };

  try {
    // 🔥 COURSE CONTRE LA MONTRE : on force l'échec au bout de 15s
    const data = await Promise.race([
      apiInstance.sendTransacEmail(emailData),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`⏰ Timeout de 15s pour l'envoi à ${to}`)), 15000)
      )
    ]);

    console.log(`✅ Email envoyé à ${to} – ID: ${data?.messageId || 'OK'}`);
    return { success: true, messageId: data?.messageId };
  } catch (error) {
    const errorDetails = error.response?.body || error.message || error;
    console.error(`❌ ÉCHEC envoi à ${to}:`, JSON.stringify(errorDetails, null, 2));
    return { success: false, error: error.message };
  }
}

// ============================================================
// 3. TEMPLATES D'EMAILS (inchangés)
// ============================================================
async function sendCandidateConfirmation(candidateEmail, fullName, jobTitle) {
  console.log(`📧 Envoi confirmation à ${candidateEmail}...`);

  const subject = `✅ Confirmation de votre candidature – Medical Center Elizabeth`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
      <div style="background: #0a4b7a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0;">Medical Center Elizabeth</h1>
      </div>
      <div style="background: #fff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #0a4b7a;">Bonjour ${fullName || 'Candidat'},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Nous vous remercions pour l'intérêt que vous portez à notre établissement.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Nous avons bien reçu votre candidature pour le poste de <strong>${jobTitle || 'notre établissement'}</strong>.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Notre équipe RH l'examine avec attention. Nous reviendrons vers vous dans les plus brefs délais.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 14px; color: #777;">Bien cordialement,<br><strong>Medical Center Elizabeth</strong></p>
        </div>
      </div>
    </div>
  `;

  return sendEmailBrevo({ to: candidateEmail, subject, html });
}

async function sendAdminAlert(fullName, email, phone, jobTitle, message, cvUrl) {
  console.log(`📧 Envoi notification admin...`);

  const subject = `📩 Nouvelle candidature – ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
      <div style="background: #0a4b7a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0;">📩 Nouvelle candidature</h1>
      </div>
      <div style="background: #fff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <p><strong>Poste :</strong> ${jobTitle}</p>
        <p><strong>Nom complet :</strong> ${fullName}</p>
        <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
        <p><strong>Message :</strong> ${message || 'Aucun message'}</p>
        <p><strong>CV :</strong> <a href="${cvUrl}" target="_blank">Télécharger</a></p>
        <hr style="margin: 20px 0;" />
        <p style="font-size: 14px; color: #555;">Connectez-vous au dashboard pour gérer cette candidature.</p>
      </div>
    </div>
  `;

  return sendEmailBrevo({ to: adminEmail, subject, html });
}

// ============================================================
// 4. ROUTE PRINCIPALE : DÉPÔT DE CANDIDATURE (inchangée)
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { jobId, jobTitle, fullName, email, phone, message, cvUrl } = req.body;

    if (!jobId || !fullName || !email || !cvUrl) {
      return res.status(400).json({
        success: false,
        error: 'Champs obligatoires manquants (jobId, fullName, email, cvUrl)'
      });
    }

    const result = await pool.query(
      `INSERT INTO applications 
       (job_id, job_title, full_name, email, phone, message, cv_url, applied_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'pending')
       RETURNING *`,
      [jobId, jobTitle, fullName, email, phone || '', message || '', cvUrl]
    );

    const applicationId = result.rows[0].id;
    console.log(`✅ Candidature enregistrée, ID: ${applicationId}`);

    const emailResults = await Promise.allSettled([
      sendCandidateConfirmation(email, fullName, jobTitle),
      sendAdminAlert(fullName, email, phone, jobTitle, message, cvUrl)
    ]);

    emailResults.forEach((r, index) => {
      const label = index === 0 ? 'CANDIDAT' : 'ADMIN';
      if (r.status === 'fulfilled') {
        const success = r.value.success;
        if (success) {
          console.log(`✅ Email ${label} envoyé avec succès`);
        } else {
          console.error(`❌ Email ${label} échoué (API):`, r.value.error);
        }
      } else {
        console.error(`❌ Email ${label} a rejeté la promesse:`, r.reason);
      }
    });

    res.status(201).json({
      success: true,
      application: result.rows[0],
      emails: emailResults.map(r => ({
        status: r.status,
        ...(r.status === 'fulfilled' ? r.value : { error: r.reason?.message || 'Erreur inconnue' })
      }))
    });

  } catch (err) {
    console.error('❌ Erreur serveur dans /api/applications:', err);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      details: err.message
    });
  }
});

module.exports = router;
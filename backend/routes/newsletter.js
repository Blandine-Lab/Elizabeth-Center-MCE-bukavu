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

// Initialisation du client Brevo
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);

/**
 * Envoi d’un email via l’API Brevo
 * Supporte le BCC pour les newsletters
 */
async function sendEmailBrevo({ to, subject, html, text, bcc }) {
  if (!apiKey) {
    console.warn('❌ Clé API Brevo manquante');
    return { success: false, error: 'API key missing' };
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { email: emailFrom, name: 'Medical Center Elizabeth' };
  sendSmtpEmail.to = [{ email: to || adminEmail }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.textContent = text || html.replace(/<[^>]*>?/gm, '');

  if (bcc && bcc.length > 0) {
    // Brevo accepte jusqu’à 50 destinataires en BCC par requête
    sendSmtpEmail.bcc = bcc.map(email => ({ email }));
  }

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email envoyé – ID: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email Brevo:', error.response?.body || error.message);
    return { success: false, error: error.message };
  }
}

// ===== ROUTES =====

/**
 * GET /api/newsletter/count – Nombre d’abonnés
 */
router.get('/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM newsletter_subscribers WHERE active = true');
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error('❌ Erreur /count:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/newsletter/subscribe – Inscription à la newsletter
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    // Vérifier si l'email existe déjà
    const exist = await pool.query('SELECT id FROM newsletter_subscribers WHERE email = $1', [email]);
    if (exist.rows.length > 0) {
      // Réactiver si désactivé
      await pool.query('UPDATE newsletter_subscribers SET active = true WHERE email = $1', [email]);
      return res.json({ message: '✅ Vous êtes déjà inscrit(e) !' });
    }

    await pool.query(
      'INSERT INTO newsletter_subscribers (email, subscribed_at, active) VALUES ($1, NOW(), true)',
      [email]
    );
    res.json({ message: '✅ Inscription réussie !' });
  } catch (err) {
    console.error('❌ Erreur /subscribe:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/newsletter/send – Envoyer une newsletter (admin)
 * Utilise l’API Brevo avec BCC (50 destinataires max par requête)
 */
router.post('/send', async (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ error: 'Sujet et contenu requis' });
    }

    // Récupérer tous les emails actifs
    const result = await pool.query('SELECT email FROM newsletter_subscribers WHERE active = true');
    const emails = result.rows.map(row => row.email);

    if (emails.length === 0) {
      return res.status(400).json({ error: 'Aucun abonné actif' });
    }

    console.log(`📧 Envoi newsletter à ${emails.length} abonnés...`);

    // Découpage en lots de 50 (limite Brevo)
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < emails.length; i += chunkSize) {
      chunks.push(emails.slice(i, i + chunkSize));
    }

    let successCount = 0;
    for (const chunk of chunks) {
      const result = await sendEmailBrevo({
        to: adminEmail, // destinaire principal (admin)
        bcc: chunk,
        subject,
        html: content,
      });
      if (result.success) successCount += chunk.length;
      // Petite pause pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    res.json({
      success: true,
      message: `✅ Newsletter envoyée à ${successCount} abonnés sur ${emails.length}`,
    });
  } catch (err) {
    console.error('❌ Erreur /send:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/newsletter/export – Exporter les emails en CSV
 */
router.get('/export', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT email FROM newsletter_subscribers WHERE active = true ORDER BY subscribed_at DESC'
    );
    const emails = result.rows.map(row => row.email);
    res.json({ emails });
  } catch (err) {
    console.error('❌ Erreur /export:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
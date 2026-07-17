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

/**
 * Vérifie si la colonne 'active' existe dans la table newsletter_subscribers
 */
async function hasActiveColumn() {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'newsletter_subscribers' AND column_name = 'active'
    );
  `);
  return result.rows[0].exists;
}

/**
 * Envoi d’un email via l’API Brevo
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

// ============ ROUTES ============

/**
 * GET /api/newsletter/count
 */
router.get('/count', async (req, res) => {
  try {
    const activeExists = await hasActiveColumn();
    let query = 'SELECT COUNT(*) FROM newsletter_subscribers';
    if (activeExists) query += ' WHERE active = true';
    const result = await pool.query(query);
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error('❌ Erreur /count:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/newsletter/subscribe
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const exist = await pool.query('SELECT id FROM newsletter_subscribers WHERE email = $1', [email]);
    if (exist.rows.length > 0) {
      const activeExists = await hasActiveColumn();
      if (activeExists) {
        await pool.query('UPDATE newsletter_subscribers SET active = true WHERE email = $1', [email]);
      }
      return res.json({ message: '✅ Vous êtes déjà inscrit(e) !' });
    }

    const activeExists = await hasActiveColumn();
    let query, params;
    if (activeExists) {
      query = 'INSERT INTO newsletter_subscribers (email, subscribed_at, active) VALUES ($1, NOW(), true)';
      params = [email];
    } else {
      query = 'INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES ($1, NOW())';
      params = [email];
    }
    await pool.query(query, params);
    res.json({ message: '✅ Inscription réussie !' });
  } catch (err) {
    console.error('❌ Erreur /subscribe:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/newsletter/send
 */
router.post('/send', async (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ error: 'Sujet et contenu requis' });
    }

    const activeExists = await hasActiveColumn();
    let query = 'SELECT email FROM newsletter_subscribers';
    if (activeExists) query += ' WHERE active = true';
    const result = await pool.query(query);
    const emails = result.rows.map(row => row.email);

    if (emails.length === 0) {
      return res.status(400).json({ error: 'Aucun abonné trouvé' });
    }

    console.log(`📧 Envoi newsletter à ${emails.length} abonnés...`);

    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < emails.length; i += chunkSize) {
      chunks.push(emails.slice(i, i + chunkSize));
    }

    let successCount = 0;
    for (const chunk of chunks) {
      const result = await sendEmailBrevo({
        to: adminEmail,
        bcc: chunk,
        subject,
        html: content,
      });
      if (result.success) successCount += chunk.length;
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
 * GET /api/newsletter/export
 */
router.get('/export', async (req, res) => {
  try {
    const activeExists = await hasActiveColumn();
    let query = 'SELECT email FROM newsletter_subscribers ORDER BY subscribed_at DESC';
    if (activeExists) {
      query = 'SELECT email FROM newsletter_subscribers WHERE active = true ORDER BY subscribed_at DESC';
    }
    const result = await pool.query(query);
    const emails = result.rows.map(row => row.email);
    res.json({ emails });
  } catch (err) {
    console.error('❌ Erreur /export:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
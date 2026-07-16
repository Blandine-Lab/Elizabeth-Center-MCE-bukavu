// backend/services/emailService.js
const nodemailer = require('nodemailer');

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  ADMIN_EMAIL
} = process.env;

// Vérification des variables
if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
  console.warn('⚠️ Variables d\'email non configurées. Les emails ne seront pas envoyés.');
}

// Création du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT) || 587,
  secure: Number(EMAIL_PORT) === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendEmail({ to, subject, html, text, bcc }) {
  if (!transporter.options.auth.user || !transporter.options.auth.pass) {
    console.warn('❌ Email non configuré – message non envoyé');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: `"Medical Center Elizabeth" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
    };
    if (bcc) mailOptions.bcc = bcc;

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${to} – ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erreur envoi email:', error.message);
    return { success: false, error: error.message };
  }
}

async function sendCandidateConfirmation(candidateEmail, fullName, jobTitle) {
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
  return sendEmail({ to: candidateEmail, subject, html });
}

async function sendAdminAlert(fullName, email, jobTitle, cvUrl, phone, message) {
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
  return sendEmail({ to: ADMIN_EMAIL || EMAIL_FROM, subject, html });
}

async function sendBulkNewsletter(subject, htmlContent, recipients) {
  if (!recipients || recipients.length === 0) {
    console.warn('⚠️ Aucun destinataire pour la newsletter');
    return { success: false, error: 'No recipients' };
  }

  const chunkSize = 50;
  const chunks = [];
  for (let i = 0; i < recipients.length; i += chunkSize) {
    chunks.push(recipients.slice(i, i + chunkSize));
  }

  let successCount = 0;
  for (const chunk of chunks) {
    try {
      const result = await sendEmail({
        to: ADMIN_EMAIL || EMAIL_FROM,
        bcc: chunk,
        subject,
        html: htmlContent,
      });
      if (result.success) successCount += chunk.length;
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Erreur envoi lot :', err);
    }
  }
  return { success: true, sentCount: successCount };
}

module.exports = {
  sendEmail,
  sendCandidateConfirmation,
  sendAdminAlert,
  sendBulkNewsletter,
};
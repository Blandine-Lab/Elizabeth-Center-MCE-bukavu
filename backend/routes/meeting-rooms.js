const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const SibApiV3Sdk = require('@sendinblue/client');

// Configuration Brevo
const apiKey = process.env.BREVO_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'contact@medicalcenterelizabeth.org';

if (!apiKey) {
  console.warn('⚠️ BREVO_API_KEY non définie – les invitations ne seront pas envoyées.');
}

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);

// Fonction d'envoi d'email d'invitation
async function sendInvitationEmails(emails, title, date, start_time, end_time, link) {
  if (!apiKey) {
    console.warn('❌ Clé API Brevo manquante, invitation non envoyée');
    return;
  }
  const subject = `Invitation à la réunion : ${title}`;
  const html = `
    <h2>Invitation à une réunion</h2>
    <p><strong>${title}</strong></p>
    <p>Date : ${date}</p>
    <p>Heure : ${start_time} - ${end_time}</p>
    <p>Lien de visioconférence : <a href="${link}">${link}</a></p>
    <p>Cliquez sur le lien pour rejoindre la réunion.</p>
    <p>Medical Center Elizabeth</p>
  `;
  for (const email of emails) {
    try {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.sender = { email: emailFrom, name: 'Medical Center Elizabeth' };
      sendSmtpEmail.to = [{ email }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`✅ Invitation envoyée à ${email}`);
    } catch (err) {
      console.error(`❌ Échec envoi à ${email}:`, err.message);
    }
  }
}

// ===== SALLES =====

// GET /api/meeting-rooms – Liste des salles actives
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM meeting_rooms WHERE active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /meeting-rooms error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meeting-rooms – Créer une salle (admin)
router.post('/', async (req, res) => {
  console.log('📥 POST /meeting-rooms reçu :', req.body);
  try {
    const { name, capacity, equipment, has_video } = req.body;
    if (!name || !capacity) {
      return res.status(400).json({ error: 'Nom et capacité requis' });
    }
    const result = await pool.query(
      `INSERT INTO meeting_rooms (name, capacity, equipment, has_video, active)
       VALUES ($1, $2, $3, $4, true) RETURNING *`,
      [name, capacity, equipment || null, has_video || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ POST /meeting-rooms error:', err);
    console.error('  Message:', err.message);
    console.error('  Code:', err.code);
    console.error('  Detail:', err.detail);
    res.status(500).json({ error: err.message, code: err.code, detail: err.detail });
  }
});

// PUT /api/meeting-rooms/:id – Modifier une salle
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, capacity, equipment, has_video, active } = req.body;
    const result = await pool.query(
      `UPDATE meeting_rooms 
       SET name = COALESCE($1, name),
           capacity = COALESCE($2, capacity),
           equipment = COALESCE($3, equipment),
           has_video = COALESCE($4, has_video),
           active = COALESCE($5, active)
       WHERE id = $6 RETURNING *`,
      [name, capacity, equipment, has_video, active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /meeting-rooms/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/meeting-rooms/:id – Désactiver une salle
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      'UPDATE meeting_rooms SET active = false WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }
    res.json({ message: 'Salle désactivée', room: result.rows[0] });
  } catch (err) {
    console.error('DELETE /meeting-rooms/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== RÉSERVATIONS =====

// GET /api/meeting-rooms/:roomId/bookings – Réservations d'une salle
router.get('/:roomId/bookings', async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    if (isNaN(roomId)) return res.status(400).json({ error: 'ID invalide' });
    const result = await pool.query(
      `SELECT b.*, s.name as booked_by_name 
       FROM room_bookings b
       LEFT JOIN personnel s ON b.booked_by = s.id
       WHERE b.room_id = $1 AND b.status = 'confirmed'
       ORDER BY b.date ASC, b.start_time ASC`,
      [roomId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /meeting-rooms/:roomId/bookings error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/meeting-rooms/bookings/all – Toutes les réservations (admin)
router.get('/bookings/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, r.name as room_name, s.name as booked_by_name 
       FROM room_bookings b
       LEFT JOIN meeting_rooms r ON b.room_id = r.id
       LEFT JOIN personnel s ON b.booked_by = s.id
       WHERE b.status = 'confirmed'
       ORDER BY b.date DESC, b.start_time DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /bookings/all error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/meeting-rooms/bookings/user/:userId – Réservations d'un utilisateur (créateur ou invité)
router.get('/bookings/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ error: 'ID invalide' });

    // Utilisation de COALESCE pour gérer les NULL et conversion en jsonb
    const result = await pool.query(
      `SELECT b.*, r.name as room_name 
       FROM room_bookings b
       LEFT JOIN meeting_rooms r ON b.room_id = r.id
       WHERE (b.booked_by = $1 OR COALESCE(b.invited_ids::jsonb ? $1, false))
         AND b.status = 'confirmed'
       ORDER BY b.date ASC, b.start_time ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ GET /bookings/user/:userId error:', err);
    console.error('  Message:', err.message);
    console.error('  Code:', err.code);
    console.error('  Detail:', err.detail);
    res.status(500).json({ error: err.message, code: err.code, detail: err.detail });
  }
});

// POST /api/meeting-rooms/book – Créer une réservation (avec invited_ids)
router.post('/book', async (req, res) => {
  console.log('📥 POST /meeting-rooms/book reçu :', req.body);
  try {
    const {
      room_id,
      booked_by,
      booked_by_name,
      title,
      description,
      date,
      start_time,
      end_time,
      is_remote,
      invited_emails,
      invited_ids
    } = req.body;

    // Validation
    if (!booked_by || !title || !date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    if (!is_remote && !room_id) {
      return res.status(400).json({ error: 'Choisissez une salle ou activez "réunion à distance"' });
    }

    // Vérification des conflits (uniquement si salle physique)
    if (!is_remote && room_id) {
      const conflict = await pool.query(
        `SELECT * FROM room_bookings 
         WHERE room_id = $1 AND date = $2 
         AND status = 'confirmed'
         AND (start_time < $3 AND end_time > $4)
         OR (start_time < $4 AND end_time > $3)`,
        [room_id, date, start_time, end_time]
      );
      if (conflict.rows.length > 0) {
        return res.status(409).json({ error: 'Cette salle est déjà réservée sur ce créneau' });
      }
    }

    // Génération du lien Jitsi (pour réunion à distance)
    let meeting_link = null;
    if (is_remote) {
      const roomName = `mce-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      meeting_link = `https://meet.jit.si/${roomName}`;
    }

    // Si invited_ids est undefined ou null, on utilise un tableau vide
    const invitedIdsJson = invited_ids ? invited_ids : [];

    // Insertion avec invited_ids (JSONB)
    const result = await pool.query(
      `INSERT INTO room_bookings 
       (room_id, booked_by, booked_by_name, title, description, date, start_time, end_time, is_remote, meeting_link, invited_emails, invited_ids)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        room_id || null,
        booked_by,
        booked_by_name || null,
        title,
        description || null,
        date,
        start_time,
        end_time,
        is_remote || false,
        meeting_link,
        invited_emails || null,
        invitedIdsJson
      ]
    );

    // Envoi des invitations par email (si des emails sont fournis)
    if (invited_emails) {
      const emails = invited_emails.split(',').map(e => e.trim()).filter(e => e);
      if (emails.length > 0 && meeting_link) {
        await sendInvitationEmails(emails, title, date, start_time, end_time, meeting_link);
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ POST /book error:', err);
    console.error('  Message:', err.message);
    console.error('  Code:', err.code);
    console.error('  Detail:', err.detail);
    res.status(500).json({ error: err.message, code: err.code, detail: err.detail });
  }
});

// DELETE /api/meeting-rooms/booking/:id – Annuler une réservation
router.delete('/booking/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      'UPDATE room_bookings SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    res.json({ message: 'Réservation annulée', booking: result.rows[0] });
  } catch (err) {
    console.error('DELETE /booking/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
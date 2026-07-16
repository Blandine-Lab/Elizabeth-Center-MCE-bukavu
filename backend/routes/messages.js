const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// ========== MIDDLEWARE DE VÉRIFICATION TOKEN ==========
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('Token manquant');
  const token = authHeader.split(' ')[1];
  if (!token) throw new Error('Token mal formé');
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (err) {
    throw new Error('Token invalide');
  }
};

// ========== GET /api/messages – Tous les messages (admin) ==========
router.get('/', async (req, res) => {
  try {
    // Option : décommentez pour sécuriser avec un token admin
    // const decoded = verifyToken(req);
    // if (decoded.role !== 'admin') return res.status(403).json({ error: 'Accès réservé' });

    const result = await pool.query('SELECT * FROM messages ORDER BY sent_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ GET /api/messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== GET /api/messages/medecin/:id ==========
router.get('/medecin/:id', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    if (isNaN(doctorId)) return res.status(400).json({ error: 'ID invalide' });

    const decoded = verifyToken(req);
    if (decoded.id !== doctorId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const query = `
      SELECT * FROM messages
      WHERE (sender_type = 'doctor' AND sender_id = $1)
         OR (receiver_type = 'doctor' AND receiver_id = $1)
      ORDER BY sent_date DESC
    `;
    const result = await pool.query(query, [doctorId]);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ GET /api/messages/medecin/:id', err);
    if (err.message === 'Token manquant' || err.message === 'Token mal formé' || err.message === 'Token invalide') {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// ========== GET /api/messages/patient/:id ==========
router.get('/patient/:id', async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    if (isNaN(patientId)) return res.status(400).json({ error: 'ID invalide' });

    const decoded = verifyToken(req);
    if (decoded.id !== patientId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const query = `
      SELECT * FROM messages
      WHERE (sender_type = 'patient' AND sender_id = $1)
         OR (receiver_type = 'patient' AND receiver_id = $1)
      ORDER BY sent_date DESC
    `;
    const result = await pool.query(query, [patientId]);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ GET /api/messages/patient/:id', err);
    if (err.message === 'Token manquant' || err.message === 'Token mal formé' || err.message === 'Token invalide') {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// ========== POST /api/messages – ENVOI PUBLIC (visiteur) ou connecté ==========
router.post('/', async (req, res) => {
  try {
    const {
      sender_type, sender_id, sender_name,
      receiver_type, receiver_id, receiver_name,
      subject, message, attachment_url
    } = req.body;

    // Validation minimale
    if (!sender_type || !message) {
      return res.status(400).json({ error: 'Type d\'expéditeur et message sont requis' });
    }

    // ---------- CAS VISITEUR (PUBLIC) ----------
    if (sender_type === 'visitor') {
      const result = await pool.query(
        `INSERT INTO messages
         (sender_type, sender_id, sender_name, receiver_type, receiver_id, receiver_name,
          subject, message, attachment_url, sent_date, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
         RETURNING *`,
        [
          'visitor',
          0,
          sender_name || 'Visiteur',
          receiver_type || 'staff',
          receiver_id || 1,
          receiver_name || 'Administration',
          subject || 'Message du site',
          message,
          attachment_url || null,
          false // is_read
        ]
      );
      return res.status(201).json(result.rows[0]);
    }

    // ---------- CAS PATIENT / MÉDECIN (authentification requise) ----------
    const decoded = verifyToken(req);
    if (decoded.id !== sender_id) {
      return res.status(403).json({ error: 'Vous ne pouvez envoyer un message qu\'en votre nom' });
    }

    const result = await pool.query(
      `INSERT INTO messages
       (sender_type, sender_id, sender_name, receiver_type, receiver_id, receiver_name,
        subject, message, attachment_url, sent_date, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
       RETURNING *`,
      [
        sender_type, sender_id, sender_name || null,
        receiver_type, receiver_id, receiver_name || null,
        subject || null, message, attachment_url || null,
        false
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ POST /api/messages', err);
    if (err.message === 'Token manquant' || err.message === 'Token mal formé' || err.message === 'Token invalide') {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// ========== POST /api/messages/:id/reply ==========
router.post('/:id/reply', async (req, res) => {
  try {
    const parentId = parseInt(req.params.id);
    if (isNaN(parentId)) return res.status(400).json({ error: 'ID invalide' });
    const { message, sender_name, sender_id, sender_type } = req.body;
    if (!message || !sender_type || !sender_id) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const decoded = verifyToken(req);
    if (decoded.id !== sender_id) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const parent = await pool.query('SELECT * FROM messages WHERE id = $1', [parentId]);
    if (parent.rows.length === 0) {
      return res.status(404).json({ error: 'Message original introuvable' });
    }
    const original = parent.rows[0];

    let receiver_type, receiver_id, receiver_name;
    if (original.sender_type === sender_type && original.sender_id === sender_id) {
      receiver_type = original.receiver_type;
      receiver_id = original.receiver_id;
      receiver_name = original.receiver_name;
    } else {
      receiver_type = original.sender_type;
      receiver_id = original.sender_id;
      receiver_name = original.sender_name;
    }

    const result = await pool.query(
      `INSERT INTO messages
       (sender_type, sender_id, sender_name, receiver_type, receiver_id, receiver_name,
        subject, message, reply_to_id, sent_date, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
       RETURNING *`,
      [
        sender_type, sender_id, sender_name || null,
        receiver_type, receiver_id, receiver_name || null,
        `Re: ${original.subject || 'Message'}`,
        message,
        parentId,
        false
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ POST /api/messages/:id/reply', err);
    if (err.message === 'Token manquant' || err.message === 'Token mal formé' || err.message === 'Token invalide') {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// ========== PUT /api/messages/:id/read ==========
router.put('/:id/read', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

    const decoded = verifyToken(req);
    const message = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
    if (message.rows.length === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }
    const msg = message.rows[0];

    if ((decoded.role === 'doctor' && msg.receiver_type === 'doctor' && msg.receiver_id === decoded.id) ||
        (decoded.role === 'patient' && msg.receiver_type === 'patient' && msg.receiver_id === decoded.id)) {
      const result = await pool.query(
        'UPDATE messages SET is_read = true, read_date = NOW() WHERE id = $1 RETURNING *',
        [id]
      );
      res.json(result.rows[0]);
    } else {
      return res.status(403).json({ error: 'Vous n\'êtes pas le destinataire de ce message' });
    }
  } catch (err) {
    console.error('❌ PUT /api/messages/:id/read', err);
    if (err.message === 'Token manquant' || err.message === 'Token mal formé' || err.message === 'Token invalide') {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
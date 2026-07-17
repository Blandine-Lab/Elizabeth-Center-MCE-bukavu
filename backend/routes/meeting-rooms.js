const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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
    console.error('POST /meeting-rooms error:', err);
    res.status(500).json({ error: err.message });
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

// POST /api/meeting-rooms/book – Créer une réservation
router.post('/book', async (req, res) => {
  try {
    const { room_id, booked_by, booked_by_name, title, description, date, start_time, end_time, is_remote } = req.body;
    if (!booked_by || !title || !date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }
    if (!is_remote && !room_id) {
      return res.status(400).json({ error: 'Choisissez une salle ou activez "réunion à distance"' });
    }

    // Vérification des conflits pour les réunions physiques
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

    // Générer un lien Jitsi pour les réunions à distance
    let meeting_link = null;
    if (is_remote) {
      const roomName = `mce-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      meeting_link = `https://meet.jit.si/${roomName}`;
    }

    const result = await pool.query(
      `INSERT INTO room_bookings 
       (room_id, booked_by, booked_by_name, title, description, date, start_time, end_time, is_remote, meeting_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [room_id || null, booked_by, booked_by_name || null, title, description || null, date, start_time, end_time, is_remote || false, meeting_link]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /book error:', err);
    res.status(500).json({ error: err.message });
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
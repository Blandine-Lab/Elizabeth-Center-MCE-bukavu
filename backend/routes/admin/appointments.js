const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

// PUT /api/admin/appointments/:id/validate-teleconsultation
router.put('/:id/validate-teleconsultation', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE appointments SET teleconsultation_validated = true WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }
    res.json({ message: 'Téléconsultation validée', appointment: result.rows[0] });
  } catch (err) {
    console.error('Erreur PUT /admin/appointments/:id/validate-teleconsultation :', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
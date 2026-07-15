const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================================
// 0. CRÉATION DES TABLES (au démarrage)
// ============================================================
async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS paiements (
        id SERIAL PRIMARY KEY,
        montant DECIMAL(10,2) NOT NULL,
        methode VARCHAR(50) NOT NULL,
        telephone VARCHAR(50),
        email_client VARCHAR(255),
        nom_client VARCHAR(255),
        code_confirmation VARCHAR(20),
        statut VARCHAR(50) DEFAULT 'en_attente',
        facture_url TEXT,
        date_paiement TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS paiement_config (
        id SERIAL PRIMARY KEY,
        iban TEXT,
        bic TEXT,
        titulaire TEXT,
        mobile_money_info TEXT,
        carte_info TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS paiements_manuels (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255),
        email VARCHAR(255),
        telephone VARCHAR(50),
        montant DECIMAL(10,2),
        methode VARCHAR(50),
        preuve_url TEXT,
        statut VARCHAR(50) DEFAULT 'en_attente',
        commentaire TEXT,
        date_creation TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tables paiement vérifiées/créées');
  } catch (err) {
    console.error('❌ Erreur création tables paiement:', err.message);
  }
}
ensureTables();

// ============================================================
// CONFIGURATION
// ============================================================
router.get('/config', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM paiement_config LIMIT 1');
    if (result.rows.length === 0) return res.json({});
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur GET /config :', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/config', async (req, res) => {
  try {
    const { iban, bic, titulaire, mobile_money_info, carte_info } = req.body;
    const existing = await pool.query('SELECT id FROM paiement_config LIMIT 1');
    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO paiement_config (iban, bic, titulaire, mobile_money_info, carte_info, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [iban, bic, titulaire, mobile_money_info, carte_info]
      );
    } else {
      await pool.query(
        `UPDATE paiement_config 
         SET iban = $1, bic = $2, titulaire = $3, mobile_money_info = $4, carte_info = $5, updated_at = NOW()
         WHERE id = $6`,
        [iban, bic, titulaire, mobile_money_info, carte_info, existing.rows[0].id]
      );
    }
    res.json({ success: true, message: 'Configuration mise à jour' });
  } catch (err) {
    console.error('Erreur POST /config :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PAIEMENT MANUEL AVEC UPLOAD DE PREUVE
// ============================================================
const uploadDir = path.join(__dirname, '../uploads/paiements');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo max
});

router.post('/manual', upload.single('preuve'), async (req, res) => {
  try {
    const { nom, email, telephone, montant, methode, commentaire } = req.body;
    if (!nom || !email || !montant || !methode) {
      return res.status(400).json({ error: 'Nom, email, montant et méthode sont requis' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Preuve de paiement (fichier) requise' });
    }

    const preuve_url = `/uploads/paiements/${req.file.filename}`;
    const result = await pool.query(
      `INSERT INTO paiements_manuels 
        (nom, email, telephone, montant, methode, preuve_url, statut, commentaire, date_creation)
       VALUES ($1, $2, $3, $4, $5, $6, 'en_attente', $7, NOW())
       RETURNING id`,
      [nom, email, telephone || null, montant, methode, preuve_url, commentaire || null]
    );

    res.status(201).json({
      success: true,
      message: 'Demande de paiement manuel enregistrée. L\'administrateur la validera.',
      id: result.rows[0].id
    });
  } catch (err) {
    console.error('❌ Erreur POST /manual :', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ROUTES ADMIN POUR LISTER LES PAIEMENTS MANUELS
// ============================================================
router.get('/manuels', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM paiements_manuels ORDER BY date_creation DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET /manuels :', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ROUTES EXISTANTES (initier, confirmer, liste paiements)
// ============================================================
router.post('/initier', async (req, res) => {
  // ... (conservez votre code existant)
});

router.post('/confirmer/:id', async (req, res) => {
  // ... (conservez votre code existant)
});

router.get('/', async (req, res) => {
  // ... (conservez votre code existant)
});

module.exports = router;
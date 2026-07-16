const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===== Configuration du dossier d'upload =====
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

// Création du dossier avec permissions
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
    console.log('📁 Dossier uploads créé avec succès');
  } else {
    console.log('📁 Dossier uploads existe déjà');
  }
} catch (err) {
  console.error('❌ Erreur création dossier uploads:', err);
}

// ===== Stockage =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, unique + path.extname(sanitized));
  }
});

// ===== Filtre : images + documents =====
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg','.jpeg','.png','.gif','.webp','.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.txt'];
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

// ===== ROUTE PRINCIPALE =====
router.post('/', (req, res) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('❌ Erreur Multer:', err);
      const errorMsg = process.env.NODE_ENV === 'production' 
        ? 'Erreur lors du téléchargement du fichier' 
        : err.message;
      return res.status(500).json({ error: errorMsg });
    }

    try {
      if (!req.files || req.files.length === 0) {
        console.warn('⚠️ Aucun fichier reçu');
        return res.status(400).json({ error: 'Aucun fichier envoyé' });
      }

      const file = req.files[0];
      const fileUrl = `/uploads/${file.filename}`;

      console.log(`✅ Fichier reçu : ${file.originalname} → ${file.filename}`);
      console.log(`📂 Chemin complet : ${path.join(uploadDir, file.filename)}`);

      // ✅ AJOUT DE imageUrl POUR LE FRONTEND
      res.json({
        success: true,
        fileUrl,
        url: fileUrl,
        imageUrl: fileUrl,          // <-- Clé attendue par le frontend
        filename: file.filename,
        message: 'Fichier téléchargé avec succès'
      });
    } catch (err) {
      console.error('💥 Erreur lors du traitement du fichier :', err);
      const errorMsg = process.env.NODE_ENV === 'production'
        ? 'Erreur interne du serveur'
        : err.message;
      res.status(500).json({ error: errorMsg });
    }
  });
});

// ===== ROUTE POUR CV =====
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, unique + path.extname(sanitized));
  }
});

const cvUpload = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type non supporté pour CV. Utilisez PDF, DOC ou DOCX.'));
    }
  }
});

router.post('/cv', cvUpload.single('cv'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun CV envoyé' });
    }
    console.log(`✅ CV reçu : ${req.file.originalname} → ${req.file.filename}`);
    const cvUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      cvUrl,
      url: cvUrl,
      imageUrl: cvUrl,    // <-- Ajout pour cohérence
      filename: req.file.filename,
      message: 'CV téléchargé avec succès'
    });
  } catch (err) {
    console.error('❌ Erreur upload CV :', err);
    const errorMsg = process.env.NODE_ENV === 'production'
      ? 'Erreur lors du téléchargement du CV'
      : err.message;
    res.status(500).json({ error: errorMsg });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dossier uploads (chemin absolu)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Dossier uploads créé');
}

// Configuration de stockage
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

// Filtre : images + documents
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo
  fileFilter
});

// ========== ROUTE PRINCIPALE ==========
// Accepte les champs 'file' OU 'image' (grâce à upload.any())
router.post('/', (req, res) => {
  upload.any()(req, res, (err) => {
    // Gestion des erreurs multer
    if (err) {
      console.error('❌ Erreur Multer :', err);
      return res.status(500).json({ error: err.message, stack: err.stack });
    }

    try {
      // Vérifier qu'un fichier a été reçu
      if (!req.files || req.files.length === 0) {
        console.warn('⚠️ Aucun fichier reçu');
        return res.status(400).json({ error: 'Aucun fichier envoyé' });
      }

      const file = req.files[0];
      const fileUrl = `/uploads/${file.filename}`;

      console.log('✅ Fichier reçu :', file.originalname, '→', file.filename);

      res.json({
        success: true,
        fileUrl,
        url: fileUrl,
        filename: file.filename,
        message: 'Fichier téléchargé avec succès'
      });
    } catch (err) {
      console.error('💥 Erreur lors du traitement du fichier :', err);
      res.status(500).json({ error: err.message, stack: err.stack });
    }
  });
});

// ========== ROUTE POUR CV (champ 'cv') ==========
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
    console.log('✅ CV reçu :', req.file.originalname, '→', req.file.filename);
    res.json({
      success: true,
      cvUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      message: 'CV téléchargé avec succès'
    });
  } catch (err) {
    console.error('❌ Erreur upload CV :', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
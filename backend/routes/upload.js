// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ===== Configuration Cloudinary =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('⚠️ CLOUDINARY_CLOUD_NAME non défini – les uploads vont échouer.');
}

// ===== Helper : choisir dossier + resource_type selon le fichier =====
const getCloudinaryParams = (file) => {
  if (file.mimetype.startsWith('image/')) {
    return { folder: 'mce-site/images', resource_type: 'image' };
  }
  if (file.mimetype.startsWith('video/')) {
    return { folder: 'mce-site/videos', resource_type: 'video' };
  }
  if (file.mimetype === 'application/pdf') {
    return { folder: 'mce-site/pdfs',   resource_type: 'raw' };
  }
  return { folder: 'mce-site/docs', resource_type: 'raw' };
};

// ===== Storage Cloudinary : fichier principal =====
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const { folder, resource_type } = getCloudinaryParams(file);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitized = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '_');

    return {
      folder,
      resource_type,
      public_id: `${unique}-${sanitized}`,
      // Cloudinary valide déjà le type, mais on garde une liste blanche par sécurité
      allowed_formats: [
        'jpg','jpeg','png','gif','webp',
        'mp4','webm','ogg','mov','avi',
        'pdf','doc','docx','xls','xlsx','ppt','pptx','txt'
      ]
    };
  }
});

// ===== Filtre : images + vidéos + documents (inchangé) =====
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg',
    // Vidéos
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
    // Documents
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
  const allowedExts = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.mp4', '.webm', '.ogg', '.mov', '.avi',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'
  ];
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté.'));
  }
};

// ===== Multer : limite 100 Mo =====
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter
});

// ===== ROUTE PRINCIPALE =====
router.post('/', (req, res) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('❌ Erreur Multer/Cloudinary:', err);
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
      // ✅ Cloudinary renvoie l'URL https complète dans file.path
      const fileUrl = file.path || file.secure_url;

      console.log(`✅ Fichier uploadé sur Cloudinary : ${file.originalname} → ${fileUrl}`);

      res.json({
        success: true,
        fileUrl,
        url: fileUrl,
        imageUrl: fileUrl,
        filename: file.filename,   // = public_id Cloudinary
        mimetype: file.mimetype,
        size: file.size,
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

// ===== ROUTE POUR CV (Cloudinary aussi) =====
const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitized = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '_');
    return {
      folder: 'mce-site/cv',
      resource_type: 'raw',
      public_id: `${unique}-${sanitized}`,
      allowed_formats: ['pdf', 'doc', 'docx']
    };
  }
});

const cvUpload = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
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
    console.log(`✅ CV uploadé sur Cloudinary : ${req.file.originalname}`);
    const cvUrl = req.file.path || req.file.secure_url;
    res.json({
      success: true,
      cvUrl,
      url: cvUrl,
      imageUrl: cvUrl,
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
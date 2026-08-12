// frontend/src/utils/media.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const MEDIA_BASE = API_BASE.replace('/api', '');

/**
 * Construire l'URL complète d'une image uploadée
 * @param {string} path - Le chemin relatif (ex: "uploads/photo.jpg" ou "/uploads/photo.jpg")
 * @returns {string} L'URL complète
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  // Si le chemin commence déjà par http:// ou https://, on le renvoie tel quel
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Supprimer le slash initial s'il existe
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Préfixer avec MEDIA_BASE
  return `${MEDIA_BASE}/${cleanPath}`;
};
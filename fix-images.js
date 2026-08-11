// fix-images.js
const fs = require('fs');
const path = require('path');

// Fonction pour parcourir récursivement les fichiers
function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, callback);
    } else if (/\.(jsx|js)$/.test(file) && !file.includes('node_modules') && !file.includes('utils/media.js')) {
      callback(filePath);
    }
  });
}

walk('./frontend/src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Ajouter l'import si absent
  if ((content.includes('image_url') || content.includes('photo_url')) && !content.includes('getImageUrl')) {
    // Calculer le chemin relatif vers utils/media.js
    const relativePath = path.relative(path.dirname(filePath), './frontend/src/utils/media').replace(/\\/g, '/');
    content = `import { getImageUrl } from '${relativePath}';\n${content}`;
    modified = true;
  }

  // Remplacer src={image_url} par src={getImageUrl(image_url)}
  content = content.replace(/src=\{([^}]*?(?:image_url|photo_url)[^}]*?)\}/g, 'src={getImageUrl($1)}');
  // Remplacer ${MEDIA_BASE}/... par getImageUrl
  content = content.replace(/src=\{`\$\{MEDIA_BASE\}\/([^`]+)`\}/g, 'src={getImageUrl("$1")}');

  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Modifié: ${filePath}`);
  }
});
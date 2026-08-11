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

  // Liste des noms de variables d'images à rechercher
  const imageVars = ['image_url', 'photo_url', 'photo', 'image'];

  // Ajouter l'import si le fichier contient une de ces variables et que getImageUrl n'est pas déjà importé
  const hasImageVar = imageVars.some(v => content.includes(v));
  if (hasImageVar && !content.includes('getImageUrl')) {
    const relativePath = path.relative(path.dirname(filePath), './frontend/src/utils/media').replace(/\\/g, '/');
    content = `import { getImageUrl } from '${relativePath}';\n${content}`;
    modified = true;
  }

  // Remplacer toutes les formes de src={...} contenant une variable d'image
  // 1. src={photo_url} → src={getImageUrl(photo_url)}
  // 2. src={image_url} → src={getImageUrl(image_url)}
  // 3. src={photo} → src={getImageUrl(photo)}
  // 4. src={image} → src={getImageUrl(image)}
  // 5. src={"uploads/..."} → src={getImageUrl("uploads/...")}
  // 6. src={`${MEDIA_BASE}/...`} → src={getImageUrl(...)}
  
  // Pattern général : src={ suivi de n'importe quel contenu jusqu'à } 
  // mais on veut capturer les cas où il y a une variable d'image ou une chaîne "uploads/"
  const patterns = [
    // src={photo_url} ou src={image_url} ou src={photo} ou src={image}
    { regex: /src=\{([^}]*?(?:photo_url|image_url|photo|image)[^}]*?)\}/g, replace: 'src={getImageUrl($1)}' },
    // src={"uploads/..."}
    { regex: /src=\{("uploads\/[^"]+")\}/g, replace: 'src={getImageUrl($1)}' },
    // src={`${MEDIA_BASE}/...`}
    { regex: /src=\{`\$\{MEDIA_BASE\}\/([^`]+)`\}/g, replace: 'src={getImageUrl("$1")}' },
    // src={'uploads/...'}
    { regex: /src=\{('uploads\/[^']+')\}/g, replace: 'src={getImageUrl($1)}' },
  ];

  for (const { regex, replace } of patterns) {
    const newContent = content.replace(regex, replace);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Modifié: ${filePath}`);
  }
});
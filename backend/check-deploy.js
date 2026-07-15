// check-deploy.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔍 Vérification du projet pour le déploiement sur Render...\n');

let errors = 0;

// 1. Vérifier les fichiers essentiels
const requiredFiles = [
  'server.js',
  'package.json',
  'config/db.js',
  'routes/',
  'routes/staff.js',
  'routes/appointments.js',
  'routes/patients.js',
  'routes/doctors.js',
  'routes/upload.js',
  'routes/paiement.js',
  'routes/admin/dashboard.js',
  'routes/admin/patients.js',
  'routes/admin/jobs.js',
  'routes/admin/applications.js',
  'routes/admin/appointments.js'
];

console.log('📁 Vérification des fichiers backend...');
requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath) || fs.existsSync(fullPath + '.js')) {
    console.log(`✅ ${file} trouvé`);
  } else {
    console.log(`❌ ${file} manquant`);
    errors++;
  }
});

// 2. Vérifier le package.json
console.log('\n📦 Vérification du package.json...');
const pkg = require('./package.json');
const requiredScripts = ['start', 'build'];
requiredScripts.forEach(script => {
  if (pkg.scripts && pkg.scripts[script]) {
    console.log(`✅ script "${script}" présent`);
  } else {
    console.log(`❌ script "${script}" manquant`);
    errors++;
  }
});

// 3. Vérifier les variables d'environnement (fichier .env)
console.log('\n🔑 Vérification des variables d\'environnement...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName} définie dans .env`);
    } else {
      console.log(`❌ ${varName} manquante dans .env`);
      errors++;
    }
  });
} else {
  console.log('⚠️  .env non trouvé (assurez-vous qu\'il existe en local)');
}

// 4. Vérifier la présence du frontend build (si déjà construit)
console.log('\n🌐 Vérification du frontend...');
const frontendBuildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(frontendBuildPath)) {
  console.log('✅ Dossier frontend/build présent');
} else {
  console.log('⚠️  frontend/build non trouvé (sera construit par Render)');
}

// 5. Vérifier la configuration de Render (fichier render.yaml)
console.log('\n⚙️ Vérification de render.yaml...');
const renderYamlPath = path.join(__dirname, '../render.yaml');
if (fs.existsSync(renderYamlPath)) {
  console.log('✅ render.yaml trouvé à la racine');
} else {
  console.log('⚠️  render.yaml manquant (vous pouvez le créer)');
}

// 6. Vérifier que les fichiers sensibles sont dans .gitignore
console.log('\n🚫 Vérification du .gitignore...');
const gitignorePath = path.join(__dirname, '../.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const ignoredItems = ['.env', 'node_modules', 'uploads', 'build'];
  ignoredItems.forEach(item => {
    if (gitignoreContent.includes(item)) {
      console.log(`✅ ${item} est dans .gitignore`);
    } else {
      console.log(`⚠️  ${item} n'est pas dans .gitignore (pensez à l'ajouter)`);
    }
  });
} else {
  console.log('⚠️  .gitignore non trouvé à la racine');
}

// 7. Vérifier la version de Node
console.log('\n🟢 Version de Node (locale) :', process.version);

// 8. Vérifier les dépendances principales
console.log('\n📚 Vérification des dépendances installées...');
const deps = Object.keys(pkg.dependencies || {});
const criticalDeps = ['express', 'pg', 'bcrypt', 'jsonwebtoken', 'multer', 'cors', 'dotenv'];
criticalDeps.forEach(dep => {
  if (deps.includes(dep)) {
    console.log(`✅ ${dep} présent`);
  } else {
    console.log(`❌ ${dep} manquant`);
    errors++;
  }
});

// 9. Vérifier que le fichier server.js contient la section de service du frontend
console.log('\n📄 Vérification du server.js pour la production...');
const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
if (serverContent.includes('process.env.NODE_ENV === "production"') && serverContent.includes('express.static')) {
  console.log('✅ server.js est configuré pour servir le frontend en production');
} else {
  console.log('❌ server.js ne semble pas configuré pour servir le frontend');
  errors++;
}

// Résumé
console.log(`\n📊 Résumé : ${errors} erreur(s) critique(s) détectée(s).`);
if (errors === 0) {
  console.log('✅ Tout semble prêt pour le déploiement sur Render !');
} else {
  console.log('⚠️  Veuillez corriger les erreurs avant de déployer.');
}
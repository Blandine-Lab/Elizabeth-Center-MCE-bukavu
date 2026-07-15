// reset-password.js
const bcrypt = require('bcrypt');
const pool = require('./config/db');
require('dotenv').config();

async function resetPassword() {
  // ⚠️ REMPLACEZ CES VALEURS PAR CELLES DE VOTRE MÉDECIN
  const email = 'medecin@exemple.com';      // Email du médecin
  const newPassword = 'monNouveauMotDePasse'; // Nouveau mot de passe

  try {
    // Vérifier si le médecin existe
    const check = await pool.query('SELECT id, full_name FROM staff WHERE email = $1', [email]);
    if (check.rows.length === 0) {
      console.log(`❌ Aucun médecin trouvé avec l'email : ${email}`);
      process.exit(1);
    }

    console.log(`👤 Médecin trouvé : ${check.rows[0].full_name} (ID: ${check.rows[0].id})`);

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour en base
    await pool.query('UPDATE staff SET password = $1 WHERE email = $2', [hashedPassword, email]);

    console.log(`✅ Mot de passe mis à jour avec succès pour ${email}`);
    console.log(`🔑 Nouveau mot de passe : ${newPassword}`);
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour :', err.message);
  } finally {
    process.exit();
  }
}

resetPassword();
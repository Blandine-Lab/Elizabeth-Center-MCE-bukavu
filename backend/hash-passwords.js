const bcrypt = require('bcrypt');
const pool = require('./config/db');

(async () => {
  try {
    // Récupérer tous les médecins avec mot de passe en clair
    const result = await pool.query("SELECT id, password FROM staff WHERE profession = 'Médecin'");
    for (const row of result.rows) {
      // Ne hasher que si le mot de passe n'est pas déjà un hash bcrypt
      if (row.password && !row.password.startsWith('$2b$') && !row.password.startsWith('$2a$')) {
        const hashed = await bcrypt.hash(row.password, 10);
        await pool.query('UPDATE staff SET password = $1 WHERE id = $2', [hashed, row.id]);
        console.log(`✅ Mot de passe mis à jour pour l'ID ${row.id}`);
      } else {
        console.log(`⏭️ ID ${row.id} déjà hashé ou vide`);
      }
    }
    console.log('✅ Tous les mots de passe ont été hashés');
    process.exit();
  } catch (err) {
    console.error('Erreur:', err);
    process.exit(1);
  }
})();
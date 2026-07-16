// backend/test-email.js
require('dotenv').config();
const { sendCandidateConfirmation } = require('./config/email');

// 👇 Remplacez par votre adresse personnelle pour recevoir le test
const MON_EMAIL_PERSO = 'mathurinmusenga@gmail.com';

sendCandidateConfirmation(
  MON_EMAIL_PERSO,
  'Jean Test',
  'Développeur Web'
)
.then(resultat => {
  console.log('📧 Résultat de l\'envoi :', resultat);
})
.catch(erreur => {
  console.error('❌ Erreur :', erreur);
});
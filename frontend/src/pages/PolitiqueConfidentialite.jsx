// src/pages/PolitiqueConfidentialite.jsx
function PolitiqueConfidentialite() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        color: '#0b6e8f', 
        marginBottom: '0.5rem',
        borderLeft: '5px solid #2ec4b6',
        paddingLeft: '20px'
      }}>
        🔒 Politique de confidentialité
      </h1>
      <p style={{ color: '#4a6b80', marginBottom: '2rem', fontSize: '1.1rem', paddingLeft: '20px' }}>
        Comment nous protégeons vos données personnelles au Medical Center Elizabeth.
      </p>

      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>1. Collecte des données personnelles</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Nous collectons vos données personnelles lorsque vous :<br />
          – Prenez un rendez-vous en ligne<br />
          – Vous inscrivez à notre newsletter<br />
          – Nous contactez via le formulaire de contact<br />
          – Faites un don ou un paiement en ligne<br />
          – Utilisez l’espace patient
        </p>
        <p style={{ color: '#2c4b62', lineHeight: '1.6', marginTop: '0.5rem' }}>
          Les données collectées peuvent inclure : nom, prénom, email, téléphone, adresse, informations médicales (dans le cadre des soins), données de paiement (via des prestataires sécurisés).
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>2. Utilisation des données</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Vos données sont utilisées pour :<br />
          – Gérer vos rendez-vous et vos soins<br />
          – Vous envoyer des informations médicales et administratives<br />
          – Améliorer nos services et la qualité des soins<br />
          – Répondre à vos demandes et réclamations<br />
          – Envoyer des communications (newsletter, rappels de rendez-vous)
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>3. Sécurité des données</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Nous mettons en place des mesures de sécurité techniques et organisationnelles pour protéger vos données contre toute perte, destruction, accès non autorisé ou divulgation. Nos serveurs sont hébergés par des prestataires certifiés (Railway) et les échanges de données sont chiffrés (SSL/TLS).
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>4. Partage des données</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Nous ne vendons ni ne louons vos données personnelles à des tiers. Vos données peuvent être partagées :<br />
          – Avec les personnels médicaux et administratifs du MCE pour la gestion de vos soins<br />
          – Avec des prestataires techniques (hébergeur, services de paiement) dans le cadre de l’exécution de nos services<br />
          – En cas d’obligation légale (autorités judiciaires, etc.)
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>5. Vos droits</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Conformément à la loi, vous disposez des droits suivants :<br />
          – Droit d’accès : consulter vos données<br />
          – Droit de rectification : corriger vos données<br />
          – Droit de suppression : demander la suppression de vos données<br />
          – Droit d’opposition : vous opposer au traitement de vos données<br />
          – Droit à la portabilité : recevoir vos données
        </p>
        <p style={{ color: '#2c4b62', lineHeight: '1.6', marginTop: '0.5rem' }}>
          Pour exercer vos droits, contactez notre délégué à la protection des données à l’adresse : dpo@medicalcenterelizabeth.fr
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>6. Cookies</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Ce site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez configurer vos préférences dans les paramètres de votre navigateur. Les cookies essentiels (session, authentification) sont indispensables au fonctionnement du site.
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>7. Conservation des données</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Vos données sont conservées pendant la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées, et conformément aux obligations légales et réglementaires (notamment en matière de santé).
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>8. Modifications</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          La présente politique de confidentialité peut être modifiée à tout moment. Les modifications seront publiées sur cette page avec une date de mise à jour. Nous vous invitons à consulter régulièrement cette page.
        </p>

        <p style={{ color: '#4a6b80', marginTop: '2rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
          Dernière mise à jour : 9 juillet 2026
        </p>
      </div>
    </div>
  );
}

export default PolitiqueConfidentialite;
// src/pages/MentionsLegales.jsx
function MentionsLegales() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        color: '#0b6e8f', 
        marginBottom: '0.5rem',
        borderLeft: '5px solid #2ec4b6',
        paddingLeft: '20px'
      }}>
        📄 Mentions légales
      </h1>
      <p style={{ color: '#4a6b80', marginBottom: '2rem', fontSize: '1.1rem', paddingLeft: '20px' }}>
        Informations légales et conditions d’utilisation du site Medical Center Elizabeth.
      </p>

      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>1. Éditeur du site</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          <strong>Medical Center Elizabeth (MCE)</strong><br />
          Adresse : 33 Avenue de l'Innovation, 75012 Paris, France<br />
          Téléphone : +243 992 952 038<br />
          Email : contact@medicalcenterelizabeth.fr
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>2. Directeur de publication</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Dr. Jean-Luc Mertens, Directeur général du Medical Center Elizabeth.
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>3. Hébergement</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Ce site est hébergé par Railway, Inc.<br />
          Adresse : 123 Main Street, San Francisco, CA 94105, États-Unis<br />
          Site web : <a href="https://railway.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0b6e8f' }}>railway.com</a>
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>4. Propriété intellectuelle</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          L’ensemble des contenus présents sur ce site (textes, images, vidéos, logos, etc.) est la propriété exclusive du Medical Center Elizabeth, sauf mention contraire. Toute reproduction, distribution ou utilisation sans autorisation préalable est interdite.
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>5. Données personnelles</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Les données personnelles collectées sur ce site sont traitées conformément à notre <a href="/politique-confidentialite" style={{ color: '#0b6e8f' }}>Politique de confidentialité</a>. Vous disposez d’un droit d’accès, de rectification et de suppression de vos données en nous contactant à l’adresse indiquée ci-dessus.
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>6. Responsabilité</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Le Medical Center Elizabeth met tout en œuvre pour assurer l’exactitude des informations diffusées sur ce site. Toutefois, nous ne pouvons garantir l’absence d’erreurs ou d’omissions. L’utilisation des informations est sous la responsabilité de l’utilisateur.
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>7. Cookies</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Ce site utilise des cookies pour améliorer l’expérience utilisateur. Vous pouvez configurer vos préférences de cookies dans les paramètres de votre navigateur.
        </p>

        <h2 style={{ color: '#0b6e8f', marginTop: '1.5rem', fontSize: '1.3rem' }}>8. Loi applicable</h2>
        <p style={{ color: '#2c4b62', lineHeight: '1.6' }}>
          Les présentes mentions légales sont soumises au droit de la République Démocratique du Congo. En cas de litige, les tribunaux compétents sont ceux de Bukavu.
        </p>
      </div>
    </div>
  );
}

export default MentionsLegales;
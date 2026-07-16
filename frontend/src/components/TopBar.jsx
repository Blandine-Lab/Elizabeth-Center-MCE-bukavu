import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// 🔑 Mot de passe pour accéder à l'administration (identique à Sidebar)
const ADMIN_PASSWORD = '@@Mpombo21262578@@@@19';

function TopBar() {
  const [telephoneUrgence, setTelephoneUrgence] = useState('+33 (0)1 88 88 88 88');
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/site-content/topbar`)
      .then(res => res.json())
      .then(data => {
        if (data.telephoneUrgence) {
          setTelephoneUrgence(data.telephoneUrgence);
        }
      })
      .catch(() => {
        // Garder la valeur par défaut en cas d'erreur
      });
  }, []);

  // Gestion du clic sur "English version" (ou tout autre élément)
  const handleEnglishClick = (e) => {
    e.preventDefault(); // Empêche la navigation par défaut vers "/"

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 6) {
      const password = window.prompt('🔐 Entrez le mot de passe administrateur :');
      if (password === ADMIN_PASSWORD) {
        console.log('✅ Mot de passe correct, redirection vers /admin');
        window.location.href = '/admin';
        setClickCount(0);
      } else {
        if (password !== null) alert('❌ Mot de passe incorrect');
        setClickCount(0);
        // Rediriger vers l'accueil si le mot de passe est faux
        window.location.href = '/';
      }
    } else {
      // Si le compteur n'est pas à 6, naviguer normalement vers l'accueil
      window.location.href = '/';
    }
  };

  return (
    <div className="top-bar">
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/espace-patient"><i className="fas fa-user"></i> Portail patient</Link>
        {/* 👇 Lien modifié pour déclencher le compteur */}
        <Link to="/" onClick={handleEnglishClick}>
          <i className="fas fa-language"></i> English version
        </Link>
        <Link to="/support"><i className="fas fa-heart"></i> Je fais un don</Link>
        <Link to="/trouver-professionnel"><i className="fas fa-stethoscope"></i> Trouver un médecin</Link>
      </div>
      <div style={{ fontSize: '0.75rem' }}>
        <i className="fas fa-phone-alt"></i> Urgences 24/7 : {telephoneUrgence}
      </div>
    </div>
  );
}

export default TopBar;
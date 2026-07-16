import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function TopBar() {
  const navigate = useNavigate();
  const [telephoneUrgence, setTelephoneUrgence] = useState('+33 (0)1 88 88 88 88');
  const [clickCount, setClickCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleEnglishClick = async (e) => {
    e.preventDefault();

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 6) {
      const password = window.prompt('🔐 Entrez le mot de passe administrateur :');
      if (password === null) {
        setClickCount(0);
        navigate('/'); // retour à l'accueil sans recharger
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/verify-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          console.log('✅ Mot de passe correct, redirection vers /admin');
          window.location.href = '/admin'; // rechargement forcé pour reset l'état
        } else {
          alert('❌ Mot de passe incorrect');
          navigate('/');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification :', error);
        alert('❌ Erreur réseau, veuillez réessayer');
        navigate('/');
      } finally {
        setIsLoading(false);
        setClickCount(0);
      }
    } else {
      // Navigation vers l'accueil sans rechargement (React Router)
      navigate('/');
    }
  };

  return (
    <div className="top-bar">
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/espace-patient"><i className="fas fa-user"></i> Portail patient</Link>
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
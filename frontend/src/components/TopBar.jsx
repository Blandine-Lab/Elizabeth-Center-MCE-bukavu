import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function TopBar() {
  const [telephoneUrgence, setTelephoneUrgence] = useState('+33 (0)1 88 88 88 88');

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

  return (
    <div className="top-bar">
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/espace-patient"><i className="fas fa-user"></i> Portail patient</Link>
        <Link to="/"><i className="fas fa-language"></i> English version</Link>
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
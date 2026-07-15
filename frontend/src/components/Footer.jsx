// src/components/Footer.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function Footer() {
  const [footer, setFooter] = useState({});

  useEffect(() => {
    loadFooter();
  }, []);

  async function loadFooter() {
    try {
      const res = await fetch(`${API_BASE}/site-content/footer`);
      if (!res.ok) {
        if (res.status === 404) {
          setFooter({});
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.contenu) {
        try {
          setFooter(JSON.parse(data.contenu));
        } catch {
          setFooter(data);
        }
      } else {
        setFooter(data);
      }
    } catch (err) {
      console.error('Erreur chargement footer:', err);
      setFooter({});
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]);
  }

  const parseLinks = (str) => {
    if (!str) return [];
    return str.split('\n')
      .filter(l => l.trim())
      .map(l => {
        const [texte, url] = l.split('|');
        return { texte: texte.trim(), url: url ? url.trim() : '#' };
      });
  };

  return (
    <footer className="custom-footer" style={styles.footer}>
      <div style={styles.footerContainer}>
        {/* Colonne 1 – Soins & Spécialités */}
        <div style={styles.footerColumn}>
          <h3 style={styles.footerTitle}>🩺 Soins & Spécialités</h3>
          <ul style={styles.footerList}>
            <li><Link to="/nos-specialites">Nos spécialités</Link></li>
            <li><Link to="/trouver-professionnel">Trouver un médecin</Link></li>
            <li><Link to="/checkup-center">Check-up Center</Link></li>
            <li><Link to="/#appointment">Prendre rendez-vous</Link></li>
            <li><Link to="/info-patients">Info patients & visiteurs</Link></li>
            <li><Link to="/about">À propos du MCE</Link></li>
          </ul>
        </div>

        {/* Colonne 2 – Services & Patients */}
        <div style={styles.footerColumn}>
          <h3 style={styles.footerTitle}>👤 Services & Patients</h3>
          <ul style={styles.footerList}>
            <li><Link to="/espace-patient">Espace Patient</Link></li>
            <li><Link to="/messages-patient">Messagerie patient</Link></li>
            <li><Link to="/#appointment">Rendez-vous en ligne</Link></li>
            <li><Link to="/support">Nous soutenir</Link></li>
            <li><Link to="/contact">Nous contacter</Link></li>
            <li><Link to="/connexion">Connexion</Link></li>
          </ul>
        </div>

        {/* Colonne 3 – Carrières & Offres */}
        <div style={styles.footerColumn}>
          <h3 style={styles.footerTitle}>💼 Carrières & Offres</h3>
          <ul style={styles.footerList}>
            <li><Link to="/jobs">Offres d'emploi</Link></li>
            <li><Link to="/espace-medecin">Espace Médecin</Link></li>
            <li><Link to="/jobs#candidature">Postuler en ligne</Link></li>
            <li><Link to="/about#team">Équipe MCE</Link></li>
            <li><Link to="/support#benefices">Devenir bénévole</Link></li>
          </ul>
        </div>

        {/* Colonne 4 – Liens utiles (dynamiques) */}
        <div style={styles.footerColumn}>
          <h3 style={styles.footerTitle}>🔗 Liens utiles</h3>
          <ul style={styles.footerList}>
            {parseLinks(footer.liens_utiles || '').map((item, idx) => (
              <li key={idx}><Link to={item.url}>{item.texte}</Link></li>
            ))}
          </ul>
        </div>

        {/* Colonne 5 – Coordonnées & Contact */}
        <div style={styles.footerColumn}>
          <h3 style={styles.footerTitle}>📞 Coordonnées</h3>
          {footer.etablissement && (
            <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold', color: '#0b6e8f' }}>
              {escapeHtml(footer.etablissement)}
            </p>
          )}
          {footer.adresse && (
            <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.85rem' }}>
              {escapeHtml(footer.adresse)}
            </p>
          )}
          {footer.telephone && (
            <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem' }}>
              <i className="fas fa-phone-alt" style={{ marginRight: '6px', color: '#0b6e8f' }}></i>
              {escapeHtml(footer.telephone)}
            </p>
          )}
          {footer.telephone2 && (
            <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem' }}>
              <i className="fas fa-phone" style={{ marginRight: '6px', color: '#0b6e8f' }}></i>
              {escapeHtml(footer.telephone2)}
            </p>
          )}
          {footer.email && (
            <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem' }}>
              <i className="fas fa-envelope" style={{ marginRight: '6px', color: '#0b6e8f' }}></i>
              <a href={`mailto:${footer.email}`} style={{ color: '#0b6e8f', textDecoration: 'none' }}>
                {escapeHtml(footer.email)}
              </a>
            </p>
          )}
          {footer.urgences && (
            <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#dc3545' }}>
              <i className="fas fa-ambulance" style={{ marginRight: '6px' }}></i>
              Urgences 24/7 : {escapeHtml(footer.urgences)}
            </p>
          )}
          {/* Réseaux sociaux */}
          <div style={styles.socialLinks}>
            {(footer.reseaux || 'fa-facebook, fa-linkedin, fa-instagram, fa-youtube, fa-tiktok').split(',').map((icon, idx) => {
              const cleanIcon = icon.trim();
              const iconMap = {
                'fa-facebook': 'https://cdn-icons-png.flaticon.com/512/5968/5968764.png',
                'fa-linkedin': 'https://cdn-icons-png.flaticon.com/512/145/145807.png',
                'fa-instagram': 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png',
                'fa-youtube': 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
                'fa-twitter': 'https://cdn-icons-png.flaticon.com/512/733/733579.png',
                'fa-tiktok': 'https://cdn-icons-png.flaticon.com/512/3046/3046126.png',
              };
              const imgSrc = iconMap[cleanIcon] || iconMap['fa-facebook'];
              return (
                <a key={idx} href="#" target="_blank" rel="noopener noreferrer" style={styles.socialIcon}>
                  <img src={imgSrc} alt={cleanIcon} style={{ width: '28px', height: '28px' }} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bas du footer */}
      <div style={styles.footerBottom}>
        <div style={styles.footerBottomLinks}>
          <Link to="/">Accueil</Link> | <Link to="/about">À propos</Link> | <Link to="/jobs">Offres</Link> | <Link to="/contact">Contact</Link> | <Link to="/support">Soutenir</Link> | <strong>MK.InnoTech GlobalMind</strong>
        </div>
        <div style={styles.paymentIcons}>
          <span>💰 Mobile Money</span>
          <span>💳 VISA</span>
          <span>💳 MasterCard</span>
          <span>🏦 Orange, Mpesa, Airtel Money</span>
          <span>📱 MTN</span>
        </div>
        <div style={styles.copyright}>
          {escapeHtml(footer.copyright || '© 2026 Medical Center Elizabeth — Soins d\'excellence, éthique et innovations médicales.')}
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(0,0,0,0.18))',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    color: '#1e2a3a',
    padding: '50px 20px 20px',
    marginTop: '3rem',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 -8px 32px rgba(0,0,0,0.06)',
    position: 'relative',
    zIndex: 1,
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingLeft: '70px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '30px',
    position: 'relative',
    zIndex: 2,
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    wordBreak: 'break-word',
  },
  footerTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#0b6e8f',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    opacity: 0.9,
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  socialLinks: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  socialIcon: {
    display: 'inline-block',
    transition: 'transform 0.2s',
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  footerBottom: {
    maxWidth: '1200px',
    margin: '30px auto 0',
    paddingTop: '25px',
    borderTop: '1px solid rgba(255,255,255,0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.8rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'rgba(30,42,58,0.75)',
    position: 'relative',
    zIndex: 2,
  },
  footerBottomLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  paymentIcons: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '1rem',
    fontSize: '0.7rem',
    background: 'rgba(255,255,255,0.2)',
    padding: '0.3rem 1rem',
    borderRadius: '30px',
    color: 'rgba(30,42,58,0.8)',
  },
  copyright: {
    fontSize: '0.7rem',
    color: 'rgba(30,42,58,0.6)',
  },
};

// CSS pour les effets de survol
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .custom-footer .footerList li a {
    color: rgba(30,42,58,0.85);
    text-decoration: none;
    transition: color 0.3s ease, transform 0.2s;
    font-size: 0.85rem;
  }
  .custom-footer .footerList li a:hover {
    color: #0b6e8f;
    transform: translateX(4px);
  }

  .custom-footer .footerBottomLinks a {
    color: rgba(30,42,58,0.75);
    text-decoration: none;
    margin: 0 5px;
    transition: color 0.3s ease;
  }
  .custom-footer .footerBottomLinks a:hover {
    color: #0b6e8f;
  }

  .custom-footer .social-icon:hover {
    transform: translateY(-3px);
  }

  .custom-footer .paymentIcons span {
    margin: 0 6px;
    font-size: 0.7rem;
    opacity: 0.9;
    color: rgba(30,42,58,0.8);
  }
`;
if (!document.querySelector('#footer-mce-styles')) {
  styleSheet.id = 'footer-mce-styles';
  document.head.appendChild(styleSheet);
}

export default Footer;
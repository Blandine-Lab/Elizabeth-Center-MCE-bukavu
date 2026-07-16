import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

// 🔑 Mot de passe pour accéder à l'administration
const ADMIN_PASSWORD = '@@Mpombo21262578@@@@19'; // Changez-le selon vos besoins

function Sidebar({ isOpen, toggleSidebar, isMobile }) {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  // Menu visible (sans le lien Administration)
  const menuItems = [
    { path: '/', label: '🏠 Accueil', icon: 'fas fa-home' },
    { path: '/nos-specialites', label: '📋 Spécialités', icon: 'fas fa-stethoscope' },
    { path: '/checkup-center', label: '🔬 Check-up', icon: 'fas fa-heartbeat' },
    { path: '/about', label: '📖 Nous connaître', icon: 'fas fa-info-circle' },
    { path: '/support', label: '🤝 Nous soutenir', icon: 'fas fa-hand-holding-heart' },
    { path: '/contact', label: '📞 Contact', icon: 'fas fa-envelope' },
    { path: '/jobs', label: '💼 Offres d\'emploi', icon: 'fas fa-briefcase' },
    { path: '/trouver-professionnel', label: '👨‍⚕️ Trouver un médecin', icon: 'fas fa-user-md' },
    { path: '/info-patients', label: '📋 Infos patients', icon: 'fas fa-notes-medical' },
    { path: '/espace-patient', label: '👤 Espace Patient', icon: 'fas fa-user-circle' },
    { path: '/espace-medecin', label: '⚕️ Espace Médecin', icon: 'fas fa-user-md' },
    { path: '/messages-patient', label: '💬 Messagerie', icon: 'fas fa-comments' },
    // Le lien /admin a été retiré volontairement
  ];

  const sidebarStyle = {
    width: '150px',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: isMobile ? (isOpen ? '0' : '-150px') : '0',
    backgroundColor: '#8b0000',
    color: 'white',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'left 0.3s ease',
    boxShadow: '2px 0 12px rgba(0,0,0,0.08)'
  };

  // Gestion du clic sur "Accueil"
  const handleHomeClick = (e) => {
    if (isMobile && toggleSidebar) toggleSidebar(); // fermer la sidebar sur mobile si besoin

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 6) {
      // Demander le mot de passe
      const password = window.prompt('🔐 Entrez le mot de passe administrateur :');
      if (password === ADMIN_PASSWORD) {
        navigate('/admin');
        setClickCount(0);
      } else {
        if (password !== null) alert('❌ Mot de passe incorrect');
        setClickCount(0);
      }
    }
  };

  // Réinitialiser le compteur si on clique sur un autre lien
  const handleOtherLinkClick = () => {
    setClickCount(0);
    if (isMobile && toggleSidebar) toggleSidebar();
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={toggleSidebar}
        />
      )}
      <div style={sidebarStyle}>
        <div style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <h3 style={{ margin: 0, fontSize: '0.85rem' }}>Menu</h3>
        </div>
        <nav style={{ padding: '5px 0', flex: 1 }}>
          {menuItems.map((item) => {
            // Lien spécial pour Accueil
            const isHome = item.path === '/';
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={isHome ? handleHomeClick : handleOtherLinkClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                  fontSize: '0.7rem',
                  borderLeft: '3px solid transparent'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <i className={item.icon} style={{ width: '14px', fontSize: '0.75rem' }}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.15)',
            padding: '12px 0',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          <div
            style={{
              display: 'inline-block',
              animation: 'marquee 8s linear infinite',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              paddingLeft: '100%'
            }}
          >
            ✨ Medical Center Elizabeth • M • C • E ✨ &nbsp;&nbsp;&nbsp; ✨ Medical Center Elizabeth • M • C • E ✨
          </div>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-100%); }
            }
          `}</style>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
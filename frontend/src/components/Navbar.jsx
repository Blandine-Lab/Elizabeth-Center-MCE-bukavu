// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

// URL de l'API (pour récupérer les coordonnées)
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isUserHidden, setIsUserHidden] = useState(false);
  const [contactPhone, setContactPhone] = useState('+243 992 952 038');
  const navbarRef = useRef(null);

  // Charger le téléphone depuis le footer (optionnel)
  useEffect(() => {
    fetch(`${API_BASE}/site-content/footer`)
      .then(res => res.json())
      .then(data => {
        if (data.contenu) {
          try {
            const parsed = JSON.parse(data.contenu);
            if (parsed.telephone) setContactPhone(parsed.telephone);
          } catch {}
        } else if (data.telephone) {
          setContactPhone(data.telephone);
        }
      })
      .catch(() => {});
  }, []);

  // Gestion du scroll (masquer/afficher)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (!isUserHidden) {
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        }
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isUserHidden]);

  // Swipe tactile sur la navbar
  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) return;

    const handleTouchStart = (e) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
      const diffY = e.touches[0].clientY - touchStartY;
      if (diffY < -30 && isVisible) {
        setIsVisible(false);
        setIsUserHidden(true);
        if (navigator.vibrate) navigator.vibrate(30);
      }
      if (diffY > 30 && !isVisible) {
        setIsVisible(true);
        setIsUserHidden(false);
        if (navigator.vibrate) navigator.vibrate(30);
      }
    };

    navbar.addEventListener('touchstart', handleTouchStart);
    navbar.addEventListener('touchmove', handleTouchMove);
    return () => {
      navbar.removeEventListener('touchstart', handleTouchStart);
      navbar.removeEventListener('touchmove', handleTouchMove);
    };
  }, [touchStartY, isVisible]);

  // Réafficher au scroll vers le haut
  useEffect(() => {
    const handleScrollShow = () => {
      if (isUserHidden && window.scrollY < lastScrollY) {
        setIsVisible(true);
        setIsUserHidden(false);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScrollShow);
    return () => window.removeEventListener('scroll', handleScrollShow);
  }, [isUserHidden, lastScrollY]);

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  // Fermer le menu lors d’un changement de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // === Liens de navigation MCE (UNIQUES) ===
  const navItems = [
    { path: '/', label: 'Accueil', icon: 'fas fa-home' },
    { path: '/nos-specialites', label: 'Services', icon: 'fas fa-stethoscope' },
    { path: '/trouver-professionnel', label: 'Médecins', icon: 'fas fa-user-md' },
    { path: '/rendez-vous', label: 'Rendez-vous', icon: 'fas fa-calendar-check' },
    { path: '/espace-medecin', label: 'Espace Médecin', icon: 'fas fa-user-circle' },
    { path: '/jobs', label: 'Offres', icon: 'fas fa-briefcase' },
    { path: '/contact', label: 'Contact', icon: 'fas fa-envelope' },
    { path: '/espace-patient', label: 'Espace Patient', icon: 'fas fa-user-injured' },
    { path: '/messages-patient', label: 'Messagerie', icon: 'fas fa-comments' },
    { path: '/connexion', label: 'Connexion', icon: 'fas fa-sign-in-alt' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  // On n'affiche que les 7 premiers sur desktop (comme avant)
  const desktopNavItems = navItems.slice(0, 7);

  return (
    <>
      <nav
        ref={navbarRef}
        style={{
          ...styles.navbar,
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'rgba(11, 110, 143, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        }}
      >
        <div style={styles.navContainer}>
          <Link to="/" style={styles.logo}>
            <img src="/logo.jpeg" alt="MCE" style={styles.logoImage} onError={(e) => { e.target.src = '/pth1.jpg'; }} />
            <span style={styles.logoText}>
              <span style={{ color: '#2ec4b6' }}>MCE</span>
              <span style={{ fontSize: '0.7rem', fontWeight: '400', opacity: 0.9, marginLeft: '4px' }}>•</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '400', opacity: 0.85, marginLeft: '4px' }}>Medical Center</span>
            </span>
          </Link>

          <div style={styles.swipeIndicator}>
            <span style={styles.swipeIcon}>⋮</span>
          </div>

          {/* Menu desktop */}
          <div style={styles.navMenu}>
            {desktopNavItems.map((item) => {
              // Si le lien est "Rendez-vous", on utilise <a> pour l'ancre
              if (item.path === '/rendez-vous') {
                return (
                  <a
                    key={item.path}
                    href="/#appointment"
                    style={{
                      ...styles.navLink,
                      textDecoration: 'none',
                    }}
                  >
                    <i className={item.icon} style={{ fontSize: '0.9rem', width: '1.2rem' }}></i>
                    <span>{item.label}</span>
                  </a>
                );
              }
              // Sinon on garde le Link normal
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    ...styles.navLink,
                    ...(isActive(item.path) ? styles.navLinkActive : {}),
                  }}
                >
                  <i className={item.icon} style={{ fontSize: '0.9rem', width: '1.2rem' }}></i>
                  <span>{item.label}</span>
                  {isActive(item.path) && (
                    <span style={styles.activeIndicator} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bouton menu mobile */}
          <button
            style={styles.menuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span style={{
              ...styles.burgerLine,
              transform: isMenuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none'
            }} />
            <span style={{
              ...styles.burgerLine,
              opacity: isMenuOpen ? 0 : 1
            }} />
            <span style={{
              ...styles.burgerLine,
              transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none'
            }} />
          </button>
        </div>
      </nav>

      {/* Bouton flottant pour réafficher la navbar */}
      {!isVisible && (
        <button
          onClick={() => { setIsVisible(true); setIsUserHidden(false); }}
          style={styles.showButton}
          className="show-navbar-btn"
        >
          <i className="fas fa-chevron-down"></i>
        </button>
      )}

      {/* Menu mobile */}
      <div style={{
        ...styles.mobileMenu,
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
      }}>
        <div style={styles.mobileMenuHeader}>
          <img src="/logo.jpeg" alt="MCE" style={styles.mobileLogo} onError={(e) => { e.target.src = '/pth1.jpg'; }} />
          <span style={styles.mobileLogoText}>Medical Center Elizabeth</span>
          <button style={styles.closeButton} onClick={() => setIsMenuOpen(false)}>
            ✕
          </button>
        </div>
        {navItems.map((item) => {
          // Pour le menu mobile aussi, le lien Rendez-vous doit être une ancre
          if (item.path === '/rendez-vous') {
            return (
              <a
                key={item.path}
                href="/#appointment"
                style={{
                  ...styles.mobileNavLink,
                  textDecoration: 'none',
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className={item.icon} style={styles.mobileIcon}></i>
                <span>{item.label}</span>
              </a>
            );
          }
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.mobileNavLink,
                ...(isActive(item.path) ? styles.mobileNavLinkActive : {}),
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              <i className={item.icon} style={styles.mobileIcon}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <div style={styles.mobileContact}>
          <i className="fas fa-phone-alt" style={{ marginRight: '8px' }}></i> {contactPhone}
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div style={styles.overlay} onClick={() => setIsMenuOpen(false)} />
      )}
    </>
  );
}

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: '0.6rem 0',
  },
  navContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoImage: {
    height: '42px',
    width: 'auto',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  logoText: {
    fontSize: 'clamp(0.9rem, 3vw, 1.2rem)',
    fontWeight: '600',
    color: 'white',
    textShadow: '0 1px 4px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  swipeIndicator: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    top: '2px',
    display: 'none',
    cursor: 'grab',
  },
  swipeIcon: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '2px',
  },
  navMenu: {
    display: 'flex',
    gap: '0.3rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  navLink: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
    borderRadius: '30px',
    textDecoration: 'none',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'all 0.25s ease',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  navLinkActive: {
    color: 'white',
    background: 'rgba(46, 196, 182, 0.3)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '2px',
    left: '20%',
    width: '60%',
    height: '2px',
    background: '#2ec4b6',
    borderRadius: '2px',
  },
  menuButton: {
    display: 'none',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '28px',
    height: '22px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    zIndex: 10,
  },
  burgerLine: {
    width: '100%',
    height: '2.5px',
    backgroundColor: 'white',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
  },
  showButton: {
    position: 'fixed',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(11, 110, 143, 0.9)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    width: '50px',
    height: '38px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '1.2rem',
    zIndex: 999,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    display: 'none',
  },
  mobileMenu: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '320px',
    maxWidth: '85%',
    height: '100vh',
    background: 'rgba(11, 110, 143, 0.97)',
    backdropFilter: 'blur(20px)',
    padding: '60px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    zIndex: 999,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '-8px 0 30px rgba(0,0,0,0.2)',
  },
  mobileMenuHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '20px',
    marginBottom: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    position: 'relative',
  },
  mobileLogo: {
    width: '45px',
    height: '45px',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  mobileLogoText: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: 'white',
    fontSize: '1.2rem',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  mobileNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.25s ease',
  },
  mobileNavLinkActive: {
    background: 'rgba(46, 196, 182, 0.25)',
    color: 'white',
  },
  mobileIcon: {
    fontSize: '1.1rem',
    width: '24px',
    textAlign: 'center',
  },
  mobileContact: {
    marginTop: '20px',
    padding: '15px 16px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.9rem',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 998,
    transition: 'all 0.3s ease',
  },
};

// CSS pour masquer/afficher les éléments selon la largeur d'écran
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 1024px) {
    .navMenu {
      display: none !important;
    }
    .menuButton {
      display: flex !important;
    }
    .swipeIndicator {
      display: block !important;
    }
    .show-navbar-btn {
      display: flex !important;
      align-items: center;
      justify-content: center;
    }
  }
  @media (min-width: 1025px) {
    .show-navbar-btn {
      display: none !important;
    }
  }
`;
if (!document.querySelector('#navbar-mce-styles')) {
  styleSheet.id = 'navbar-mce-styles';
  document.head.appendChild(styleSheet);
}

export default Navbar;
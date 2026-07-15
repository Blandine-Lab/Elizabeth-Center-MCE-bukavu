// src/components/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ background: '#0b6e8f', color: 'white', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem' }}>
            🏥 Medical Center
          </Link>
        </div>

        {/* Menu déroulant (3 points) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.8rem',
              cursor: 'pointer'
            }}
          >
            ⋮
          </button>
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '2.5rem',
                background: 'white',
                color: '#333',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '0.5rem 0',
                minWidth: '180px',
                zIndex: 1000
              }}
            >
              <Link
                to="/nos-specialites"
                style={{
                  display: 'block',
                  padding: '0.6rem 1.2rem',
                  color: '#333',
                  textDecoration: 'none',
                  borderBottom: '1px solid #eee'
                }}
                onClick={() => setMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                to="/trouver-professionnel"
                style={{
                  display: 'block',
                  padding: '0.6rem 1.2rem',
                  color: '#333',
                  textDecoration: 'none',
                  borderBottom: '1px solid #eee'
                }}
                onClick={() => setMenuOpen(false)}
              >
                Médecins
              </Link>
              {/* ✅ Correction : lien vers l’ancre #appointment de l’accueil */}
              <a
                href="/#appointment"
                style={{
                  display: 'block',
                  padding: '0.6rem 1.2rem',
                  color: '#333',
                  textDecoration: 'none'
                }}
                onClick={() => setMenuOpen(false)}
              >
                Rendez-vous
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
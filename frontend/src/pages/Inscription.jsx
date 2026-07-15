// src/pages/Inscription.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function Inscription() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/patient/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone || '',
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setSuccess('✅ Compte créé avec succès ! Vous allez être redirigé vers la page de connexion.');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });

      setTimeout(() => navigate('/connexion'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* ===== VIDÉO EN ARRIÈRE-PLAN ===== */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        <source src="/video10.mp4" type="video/mp4" />
        Votre navigateur ne supporte pas la vidéo.
      </video>

      {/* Overlay semi-transparent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        zIndex: 1
      }}></div>

      {/* Contenu */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '480px', margin: '2rem auto', padding: '0 1.5rem' }}>
        <div style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          borderRadius: '2rem',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#0b6e8f',
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            📝 Inscription Patient
          </h1>
          <p style={{
            textAlign: 'center',
            color: '#4a6b80',
            marginBottom: '2rem',
            fontSize: '0.95rem'
          }}>
            Créez votre compte pour accéder à votre espace patient
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a', fontSize: '0.85rem' }}>Prénom *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '1rem', border: '1px solid #dce5ec', fontSize: '0.95rem', background: 'white', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a', fontSize: '0.85rem' }}>Nom *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '1rem', border: '1px solid #dce5ec', fontSize: '0.95rem', background: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a', fontSize: '0.85rem' }}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '1rem', border: '1px solid #dce5ec', fontSize: '0.95rem', background: 'white', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a', fontSize: '0.85rem' }}>Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '1rem', border: '1px solid #dce5ec', fontSize: '0.95rem', background: 'white', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a', fontSize: '0.85rem' }}>Mot de passe *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '1rem', border: '1px solid #dce5ec', fontSize: '0.95rem', background: 'white', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a', fontSize: '0.85rem' }}>Confirmer le mot de passe *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '1rem', border: '1px solid #dce5ec', fontSize: '0.95rem', background: 'white', outline: 'none' }}
              />
            </div>

            {error && (
              <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.8rem', borderRadius: '1rem', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: '#d4edda', color: '#155724', padding: '0.8rem', borderRadius: '1rem', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '2rem',
                border: 'none',
                background: 'linear-gradient(135deg, #0b6e8f, #2ec4b6)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(11,110,143,0.3)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Inscription en cours...' : 'Créer mon compte'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#4a6b80' }}>
            Déjà un compte ?{' '}
            <Link to="/connexion" style={{ color: '#0b6e8f', fontWeight: '600', textDecoration: 'none' }}>
              Se connecter
            </Link>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#8a9aa8', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inscription;
// src/pages/Connexion.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function Connexion() {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = role === 'patient' 
        ? `${API_BASE}/patient/login` 
        : `${API_BASE}/doctor/login`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Identifiants incorrects');
      }

      // Stockage du token et redirection
      if (role === 'patient') {
        localStorage.setItem('patientToken', data.token);
        navigate('/espace-patient');
      } else {
        localStorage.setItem('doctorToken', data.token);
        navigate('/espace-medecin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '480px', 
      margin: '3rem auto', 
      padding: '0 1.5rem'
    }}>
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
          🔐 Connexion
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#4a6b80',
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          Accédez à votre espace personnel
        </p>

        {/* Choix du rôle */}
        <div style={{
          display: 'flex',
          background: '#f0f7fc',
          borderRadius: '2rem',
          padding: '0.3rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setRole('patient')}
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              borderRadius: '2rem',
              border: 'none',
              background: role === 'patient' ? '#0b6e8f' : 'transparent',
              color: role === 'patient' ? 'white' : '#4a6b80',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '0.9rem'
            }}
          >
            👤 Patient
          </button>
          <button
            onClick={() => setRole('doctor')}
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              borderRadius: '2rem',
              border: 'none',
              background: role === 'doctor' ? '#0b6e8f' : 'transparent',
              color: role === 'doctor' ? 'white' : '#4a6b80',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '0.9rem'
            }}
          >
            ⚕️ Médecin
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1e2a3a',
              fontSize: '0.9rem'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: jean.dupont@email.com"
              required
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '1rem',
                border: '1px solid #dce5ec',
                fontSize: '1rem',
                transition: 'border-color 0.2s',
                background: 'white',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2ec4b6'}
              onBlur={(e) => e.target.style.borderColor = '#dce5ec'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1e2a3a',
              fontSize: '0.9rem'
            }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 3rem 0.8rem 1rem',
                  borderRadius: '1rem',
                  border: '1px solid #dce5ec',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s',
                  background: 'white',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2ec4b6'}
                onBlur={(e) => e.target.style.borderColor = '#dce5ec'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#8a9aa8',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Lien mot de passe oublié */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1.5rem'
          }}>
            <Link 
              to="/mot-de-passe-oublie" 
              style={{
                color: '#0b6e8f',
                fontSize: '0.85rem',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#2ec4b6'}
              onMouseLeave={(e) => e.target.style.color = '#0b6e8f'}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '0.8rem',
              borderRadius: '1rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {/* Bouton de connexion */}
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
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(11,110,143,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(11,110,143,0.3)';
            }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien vers l'inscription */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#4a6b80'
        }}>
          Pas encore de compte ?{' '}
          <Link 
            to="/inscription" 
            style={{
              color: '#0b6e8f',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#2ec4b6'}
            onMouseLeave={(e) => e.target.style.color = '#0b6e8f'}
          >
            Créer un compte
          </Link>
        </div>

        {/* Retour à l'accueil */}
        <div style={{
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          <Link 
            to="/" 
            style={{
              color: '#8a9aa8',
              fontSize: '0.85rem',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#0b6e8f'}
            onMouseLeave={(e) => e.target.style.color = '#8a9aa8'}
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Connexion;
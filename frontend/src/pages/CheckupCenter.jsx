// src/pages/CheckupCenter.jsx
import { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function CheckupCenter() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    checkupType: 'Bilan essentiel',
    date: '',
    timeSlot: 'Matin (9h-12h)',
    message: ''
  });
  const [formStatus, setFormStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('Envoi en cours...');
    try {
      const res = await fetch(`${API_BASE}/checkup-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
      }
      await res.json();
      setFormStatus('✅ Votre demande a été envoyée. Un conseiller vous recontactera sous 24h.');
      setFormData({
        fullname: '',
        email: '',
        phone: '',
        checkupType: 'Bilan essentiel',
        date: '',
        timeSlot: 'Matin (9h-12h)',
        message: ''
      });
    } catch (err) {
      console.error('Erreur envoi checkup:', err);
      setFormStatus(`❌ Erreur : ${err.message || 'Envoi impossible'}`);
    }
    setTimeout(() => setFormStatus(''), 5000);
  };

  const selectCheckup = (type) => {
    setFormData(prev => ({ ...prev, checkupType: type }));
    document.getElementById('reservationForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* ===== VIDÉO EN ARRIÈRE-PLAN ===== */}
      <video
        autoPlay
        muted
        loop
        playsInline
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
        <source src="/video7.mp4" type="video/mp4" />
        Votre navigateur ne supporte pas la vidéo.
      </video>

      {/* Overlay semi-transparent pour la lisibilité */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        zIndex: 1
      }}></div>

      {/* Contenu */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* En-tête */}
        <div style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(4px)',
          padding: '4rem 0 2rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
            <h1 style={{ fontSize: '2.8rem', color: '#0b6e8f', marginBottom: '1rem' }}>Check-up Center</h1>
            <p style={{ color: '#1e2a3a', maxWidth: '700px', margin: '0 auto' }}>
              Prenez soin de votre santé grâce à nos bilans complets, réalisés avec des équipements de dernière génération.
            </p>
          </div>
        </div>

        {/* Offres de check-up */}
        <div style={{ maxWidth: '1280px', margin: '3rem auto', padding: '0 2rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* Carte Bilan essentiel */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              border: '1px solid #eef2f8'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <h3 style={{ color: '#0b6e8f', marginBottom: '0.5rem' }}>Bilan essentiel</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2ec4b6', margin: '1rem 0' }}>
                150€ <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#6c757d' }}>HT</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '1rem 0' }}>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> Prise de sang complète</li>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> Tension artérielle, poids, IMC</li>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> ECG de repos</li>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> Entretien avec un médecin</li>
              </ul>
              <button onClick={() => selectCheckup('Bilan essentiel')} style={{ background: '#0b6e8f', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '2rem', fontWeight: '600', cursor: 'pointer' }}>Réserver</button>
            </div>

            {/* Carte Bilan confort + */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              border: '1px solid #eef2f8'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <h3 style={{ color: '#0b6e8f', marginBottom: '0.5rem' }}>Bilan confort +</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2ec4b6', margin: '1rem 0' }}>
                290€ <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#6c757d' }}>HT</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '1rem 0' }}>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> Tout le bilan essentiel</li>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> Échographie abdominale</li>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> Dépistage cardiovasculaire avancé</li>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> Bilan nutritionnel</li>
              </ul>
              <button onClick={() => selectCheckup('Bilan confort +')} style={{ background: '#0b6e8f', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '2rem', fontWeight: '600', cursor: 'pointer' }}>Réserver</button>
            </div>

            {/* Carte Bilan premium */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              border: '1px solid #eef2f8'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <h3 style={{ color: '#0b6e8f', marginBottom: '0.5rem' }}>Bilan premium</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2ec4b6', margin: '1rem 0' }}>
                590€ <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#6c757d' }}>HT</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '1rem 0' }}>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> Tout le bilan confort +</li>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> IRM cérébrale ou thoracique</li>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> Test d'effort cardiaque</li>
                <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-check-circle" style={{ color: '#2ec4b6', width: '20px' }}></i> Analyse génétique optionnelle</li>
              </ul>
              <button onClick={() => selectCheckup('Bilan premium')} style={{ background: '#0b6e8f', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '2rem', fontWeight: '600', cursor: 'pointer' }}>Réserver</button>
            </div>
          </div>
        </div>

        {/* Formulaire de réservation */}
        <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 2rem' }}>
          <div id="reservationForm" style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '2rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ color: '#0b6e8f', marginBottom: '1rem' }}>Demander un rendez-vous</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#0f3a4b' }}>Nom complet</label>
                  <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '1rem', border: '1px solid #dce5ec' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#0f3a4b' }}>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '1rem', border: '1px solid #dce5ec' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#0f3a4b' }}>Téléphone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '1rem', border: '1px solid #dce5ec' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#0f3a4b' }}>Bilan choisi</label>
                  <select name="checkupType" value={formData.checkupType} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '1rem', border: '1px solid #dce5ec' }}>
                    <option>Bilan essentiel</option>
                    <option>Bilan confort +</option>
                    <option>Bilan premium</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#0f3a4b' }}>Date souhaitée</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', borderRadius: '1rem', border: '1px solid #dce5ec' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#0f3a4b' }}>Créneau</label>
                  <select name="timeSlot" value={formData.timeSlot} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '1rem', border: '1px solid #dce5ec' }}>
                    <option>Matin (9h-12h)</option>
                    <option>Après-midi (14h-17h)</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#0f3a4b' }}>Message / remarques</label>
                <textarea name="message" rows="2" value={formData.message} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '1rem', border: '1px solid #dce5ec' }}></textarea>
              </div>
              <button type="submit" style={{ background: '#2ec4b6', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '2rem', fontWeight: '600', cursor: 'pointer' }}>Envoyer la demande</button>
            </form>
            {formStatus && <div style={{ marginTop: '1rem', fontWeight: '500', textAlign: 'center', color: formStatus.includes('✅') ? 'green' : 'red' }}>{formStatus}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckupCenter;
// src/pages/Teleconsultation.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function Teleconsultation() {
  const { rdvId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointmentDetails();
  }, [rdvId]);

  const fetchAppointmentDetails = async () => {
    try {
      const token = localStorage.getItem('medecinToken');
      const res = await fetch(`${API_BASE}/appointments/${rdvId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error('Rendez-vous non trouvé');
        throw new Error('Erreur de chargement');
      }
      const data = await res.json();
      setAppointment(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Nom du salon Jitsi basé sur l'ID du rendez-vous
  const roomName = `MCE-Teleconsult-${rdvId}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}?config.prejoinPageEnabled=false`;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #0b6e8f', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Chargement de la consultation...</p>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <p style={{ color: '#dc3545', fontSize: '1.2rem' }}>❌ {error}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#0b6e8f', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Barre d'info */}
      <div style={{ padding: '0.5rem 1.5rem', background: '#0b6e8f', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <strong>📹 Téléconsultation</strong>
          <span style={{ marginLeft: '1rem', opacity: 0.9 }}>
            {appointment?.fullname || 'Patient'} - {appointment?.date} à {appointment?.time}
          </span>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.3rem 1rem', borderRadius: '20px', cursor: 'pointer' }}
        >
          ✕ Quitter
        </button>
      </div>

      {/* Iframe Jitsi */}
      <iframe
        src={jitsiUrl}
        allow="camera; microphone; display-capture; autoplay"
        style={{ flex: 1, border: 'none', width: '100%' }}
        title="Jitsi Meet"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}

export default Teleconsultation;
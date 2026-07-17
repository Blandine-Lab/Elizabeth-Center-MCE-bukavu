// src/pages/EspaceMedecin.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const LOGIN_URL = `${API_BASE}/doctor/login`;

function EspaceMedecin() {
  const [token, setToken] = useState(localStorage.getItem('medecinToken'));
  const [medecin, setMedecin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('messages');
  const [replyText, setReplyText] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [feedback, setFeedback] = useState({ login: '', reply: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientsError, setPatientsError] = useState('');

  // États "Nouveau message"
  const [receiverType, setReceiverType] = useState('patient');
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [selectedReceiverName, setSelectedReceiverName] = useState('');
  const [subject, setSubject] = useState("Demande d'information");
  const [customSubject, setCustomSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  // États "Disponibilités"
  const [availabilities, setAvailabilities] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [availabilityFeedback, setAvailabilityFeedback] = useState('');
  const [loadingAvail, setLoadingAvail] = useState(false);

  // États "Salles de réunion"
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomBookings, setRoomBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '09:00',
    end_time: '10:00',
    is_remote: false,
    room_id: '',
  });
  const [bookingFeedback, setBookingFeedback] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, (m) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])
    );
  }

  // Décodage du token
  const decodeMedecinFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.id, name: payload.name, email: payload.email };
    } catch {
      return null;
    }
  };

  // ===== Connexion =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ ...feedback, login: 'Connexion en cours...' });
    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('medecinToken', data.token);
        setToken(data.token);
        if (data.doctor) {
          setMedecin({
            id: data.doctor.id,
            name: data.doctor.name,
            email: data.doctor.email,
            specialty: data.doctor.specialty,
          });
        } else {
          const decoded = decodeMedecinFromToken(data.token);
          if (decoded) setMedecin(decoded);
          else throw new Error('Impossible de récupérer les informations du médecin');
        }
        setFeedback({ ...feedback, login: '' });
      } else {
        setFeedback({ ...feedback, login: data.error || 'Erreur de connexion' });
      }
    } catch (err) {
      setFeedback({ ...feedback, login: err.message || 'Erreur réseau' });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('medecinToken');
    setToken(null);
    setMedecin(null);
    setMessages([]);
    setPatients([]);
    setDoctors([]);
    setAppointments([]);
    setAvailabilities([]);
    setRooms([]);
    setMyBookings([]);
    setRoomBookings([]);
  };

  // ===== Messages =====
  const fetchMessages = async () => {
    if (!medecin || !token) return;
    try {
      const res = await fetch(`${API_BASE}/messages/medecin/${medecin.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('❌ fetchMessages:', err);
    }
  };

  // ===== Médecins et patients =====
  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE}/staff`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const medecins = data.filter(
        (d) => d.profession === 'Médecin' && d.id !== medecin?.id
      );
      setDoctors(medecins);
    } catch (err) {
      console.error('Erreur chargement médecins:', err);
    }
  };

  const fetchPatients = async () => {
    setPatientsError('');
    try {
      const res = await fetch(`${API_BASE}/admin/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          const res2 = await fetch(`${API_BASE}/patients`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
          const data = await res2.json();
          setPatients(data);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error('Erreur chargement patients:', err);
      setPatientsError('Impossible de charger la liste des patients.');
      setPatients([]);
    }
  };

  // ===== Rendez-vous =====
  const fetchAppointments = async () => {
    if (!medecin || !token) return;
    try {
      const res = await fetch(`${API_BASE}/doctor/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error('❌ fetchAppointments:', err);
    }
  };

  // ===== Disponibilités =====
  const fetchAvailabilities = async () => {
    if (!medecin || !token) return;
    setLoadingAvail(true);
    try {
      const res = await fetch(`${API_BASE}/availability/doctor/${medecin.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAvailabilities(data);
      setAvailabilityFeedback('');
    } catch (err) {
      console.error('❌ fetchAvailabilities:', err);
      setAvailabilityFeedback('❌ Erreur chargement des disponibilités');
    } finally {
      setLoadingAvail(false);
    }
  };

  const addAvailability = async (e) => {
    e.preventDefault();
    if (!newDate || !newStartTime || !newEndTime) {
      setAvailabilityFeedback('❌ Veuillez remplir tous les champs');
      return;
    }
    if (newStartTime >= newEndTime) {
      setAvailabilityFeedback("❌ L'heure de début doit être avant l'heure de fin");
      return;
    }
    const time_slot = `${newStartTime}-${newEndTime}`;
    setLoadingAvail(true);
    try {
      const res = await fetch(`${API_BASE}/availabilities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctor_id: medecin.id,
          date: newDate,
          time_slot: time_slot,
        }),
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
      }
      setAvailabilityFeedback('✅ Créneau ajouté avec succès');
      setNewDate('');
      setNewStartTime('09:00');
      setNewEndTime('10:00');
      fetchAvailabilities();
    } catch (err) {
      setAvailabilityFeedback(`❌ ${err.message}`);
    } finally {
      setLoadingAvail(false);
    }
  };

  const deleteAvailability = async (id) => {
    if (!window.confirm('Supprimer ce créneau ?')) return;
    try {
      const res = await fetch(`${API_BASE}/availabilities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
      }
      setAvailabilityFeedback('✅ Créneau supprimé');
      fetchAvailabilities();
    } catch (err) {
      setAvailabilityFeedback(`❌ ${err.message}`);
    }
  };

  // ===== Salles de réunion =====
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch(`${API_BASE}/meeting-rooms`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error('❌ fetchRooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchRoomBookings = async (roomId) => {
    try {
      const res = await fetch(`${API_BASE}/meeting-rooms/${roomId}/bookings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRoomBookings(data);
    } catch (err) {
      console.error('❌ fetchRoomBookings:', err);
    }
  };

  const fetchMyBookings = async () => {
    if (!medecin) return;
    try {
      const res = await fetch(`${API_BASE}/meeting-rooms/bookings/user/${medecin.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMyBookings(data);
    } catch (err) {
      console.error('❌ fetchMyBookings:', err);
    }
  };

  const handleBookRoom = async (e) => {
    e.preventDefault();
    setBookingFeedback('Envoi...');
    try {
      const payload = {
        ...bookingForm,
        booked_by: medecin.id,
        booked_by_name: medecin.name,
        room_id: bookingForm.is_remote ? null : bookingForm.room_id,
      };
      if (!payload.room_id && !payload.is_remote) {
        setBookingFeedback('❌ Choisissez une salle ou activez "réunion à distance"');
        return;
      }
      const res = await fetch(`${API_BASE}/meeting-rooms/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setBookingFeedback('✅ Réservation créée !');
      fetchMyBookings();
      if (selectedRoom) fetchRoomBookings(selectedRoom);
      setBookingForm({
        title: '',
        description: '',
        date: '',
        start_time: '09:00',
        end_time: '10:00',
        is_remote: false,
        room_id: '',
      });
    } catch (err) {
      setBookingFeedback(`❌ ${err.message}`);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    try {
      const res = await fetch(`${API_BASE}/meeting-rooms/booking/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur');
      setBookingFeedback('✅ Réservation annulée');
      fetchMyBookings();
      if (selectedRoom) fetchRoomBookings(selectedRoom);
    } catch (err) {
      setBookingFeedback(`❌ ${err.message}`);
    }
  };

  // ===== Répondre à un message =====
  const sendReply = async (messageId) => {
    if (!replyText.trim()) {
      setFeedback({ ...feedback, reply: 'Message vide' });
      return;
    }
    const originalMsg = messages.find((m) => m.id === messageId);
    if (!originalMsg) return;
    setFeedback({ ...feedback, reply: 'Envoi...' });
    try {
      const res = await fetch(`${API_BASE}/messages/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: replyText,
          sender_name: medecin.name,
          sender_id: medecin.id,
          sender_type: 'doctor',
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
      }
      setFeedback({ ...feedback, reply: '✅ Réponse envoyée' });
      setReplyText('');
      setSelectedMessageId(null);
      fetchMessages();
    } catch (err) {
      setFeedback({ ...feedback, reply: err.message || 'Erreur réseau' });
    }
  };

  // ===== Nouveau message =====
  const sendNewMessage = async (e) => {
    e.preventDefault();

    let finalSubject = subject;
    if (subject === 'Autre') {
      if (!customSubject.trim()) {
        setFeedback({ ...feedback, reply: 'Veuillez préciser le motif' });
        return;
      }
      finalSubject = customSubject.trim();
    }

    let receiver_id = 0;
    let receiver_name = '';
    let receiver_type = 'patient';

    if (receiverType === 'doctor') {
      if (!selectedReceiverId) {
        setFeedback({ ...feedback, reply: 'Veuillez sélectionner un médecin' });
        return;
      }
      receiver_type = 'doctor';
      receiver_id = parseInt(selectedReceiverId);
      const selectedDoc = doctors.find((d) => d.id === receiver_id);
      receiver_name = selectedDoc ? selectedDoc.full_name : 'Médecin';
    } else {
      receiver_type = 'patient';
      if (!selectedReceiverId) {
        setFeedback({ ...feedback, reply: 'Veuillez sélectionner un patient' });
        return;
      }
      receiver_id = parseInt(selectedReceiverId);
      const selectedPat = patients.find((p) => p.id === receiver_id);
      receiver_name = selectedPat
        ? `${selectedPat.first_name} ${selectedPat.last_name}`
        : 'Patient';
    }

    if (!messageText.trim()) {
      setFeedback({ ...feedback, reply: 'Le message ne peut pas être vide' });
      return;
    }

    let attachmentUrl = null;
    if (attachmentFile) {
      const formData = new FormData();
      formData.append('file', attachmentFile);
      try {
        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Erreur ${uploadRes.status}: ${errorText}`);
        }
        const uploadData = await uploadRes.json();
        attachmentUrl = uploadData.fileUrl || uploadData.url;
        if (!attachmentUrl) {
          throw new Error('URL du fichier manquante dans la réponse');
        }
      } catch (err) {
        setFeedback({ ...feedback, reply: `❌ Échec upload: ${err.message}` });
        return;
      }
    }

    setFeedback({ ...feedback, reply: 'Envoi...' });
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender_type: 'doctor',
          sender_id: medecin.id,
          sender_name: medecin.name,
          receiver_type,
          receiver_id,
          receiver_name,
          subject: finalSubject,
          message: messageText,
          attachment_url: attachmentUrl,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
      }
      setFeedback({ ...feedback, reply: '✅ Message envoyé' });
      setMessageText('');
      setSelectedReceiverId('');
      setSelectedReceiverName('');
      setSubject("Demande d'information");
      setCustomSubject('');
      setReceiverType('patient');
      setAttachmentFile(null);
      setAttachmentPreview(null);
      fetchMessages();
    } catch (err) {
      setFeedback({ ...feedback, reply: err.message || 'Erreur réseau' });
    }
  };

  // ===== Effets =====
  useEffect(() => {
    if (medecin && token) {
      fetchMessages();
      fetchAppointments();
      fetchAvailabilities();
      fetchRooms();
      fetchMyBookings();
      const interval = setInterval(() => {
        fetchMessages();
        fetchAppointments();
        fetchMyBookings();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [medecin, token]);

  useEffect(() => {
    if (token && !medecin) {
      const decoded = decodeMedecinFromToken(token);
      if (decoded) setMedecin(decoded);
      else logout();
    }
  }, [token]);

  useEffect(() => {
    if (medecin && token) {
      fetchDoctors();
      fetchPatients();
    }
  }, [medecin, token]);

  useEffect(() => {
    setSelectedReceiverName('');
    setSelectedReceiverId('');
  }, [receiverType]);

  // ===== Page de connexion =====
  if (!token) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
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
            zIndex: 0,
          }}
        >
          <source src="/video9.mp4" type="video/mp4" />
        </video>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 1,
          }}
        ></div>
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '400px',
            margin: '2rem auto',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
            }}
          >
            <h2 style={{ textAlign: 'center', color: '#0b6e8f' }}>Espace Médecin</h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '1rem',
                    border: '1px solid #cbd5e0',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '1rem',
                    border: '1px solid #cbd5e0',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0b6e8f, #2ec4b6)',
                  color: 'white',
                  padding: '0.7rem',
                  borderRadius: '2rem',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
              {feedback.login && (
                <div
                  style={{
                    marginTop: '1rem',
                    color: feedback.login.includes('Erreur') ? 'red' : 'blue',
                  }}
                >
                  {feedback.login}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!medecin) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement du profil...</div>;
  }

  // ===== Rendu principal =====
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
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
          zIndex: 0,
        }}
      >
        <source src="/video9.mp4" type="video/mp4" />
      </video>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.35)',
          zIndex: 1,
        }}
      ></div>
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          margin: '2rem auto',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h2 style={{ margin: 0, color: '#0b6e8f' }}>Bonjour Dr {escapeHtml(medecin.name)}</h2>
            <button
              onClick={logout}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                cursor: 'pointer',
              }}
            >
              Déconnexion
            </button>
          </div>

          {/* Barre d'onglets */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { id: 'rdv', label: '📅 Rendez-vous' },
              { id: 'messages', label: 'Messagerie' },
              { id: 'newmessage', label: '✉️ Nouveau message' },
              { id: 'disponibilites', label: '📋 Disponibilités' },
              { id: 'meetings', label: '🏢 Salles de réunion' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'meetings') {
                    fetchRooms();
                    fetchMyBookings();
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  color: activeTab === tab.id ? '#0b6e8f' : '#4a5568',
                  borderBottom: activeTab === tab.id ? '2px solid #0b6e8f' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ===== TAB : Rendez-vous ===== */}
          {activeTab === 'rdv' && (
            <div>
              <h3 style={{ color: '#0b6e8f' }}>📅 Mes rendez-vous</h3>
              {appointments.length === 0 ? (
                <p style={{ color: '#4a6b80' }}>Aucun rendez-vous pour le moment.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#0b6e8f', color: 'white' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Patient</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Heure</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Téléconsultation</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((rdv) => (
                        <tr key={rdv.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px' }}>{escapeHtml(rdv.patient_name || rdv.fullname)}</td>
                          <td style={{ padding: '8px' }}>{rdv.date}</td>
                          <td style={{ padding: '8px' }}>{rdv.time}</td>
                          <td style={{ padding: '8px' }}>
                            {rdv.teleconsultation_validated ? (
                              <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Validée</span>
                            ) : (
                              <span style={{ color: 'orange' }}>⏳ En attente</span>
                            )}
                          </td>
                          <td style={{ padding: '8px' }}>
                            {rdv.teleconsultation_validated ? (
                              <button
                                onClick={() => window.open(`/teleconsultation/${rdv.id}`, '_blank')}
                                style={{
                                  background: '#2ec4b6',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.3rem 1rem',
                                  borderRadius: '2rem',
                                  cursor: 'pointer',
                                }}
                              >
                                📹 Démarrer
                              </button>
                            ) : (
                              <span style={{ color: '#6c757d', fontStyle: 'italic' }}>
                                En attente de validation
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== TAB : Messagerie ===== */}
          {activeTab === 'messages' && (
            <div>
              <h3 style={{ color: '#0b6e8f' }}>📬 Messagerie</h3>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {messages.length === 0 ? (
                  <p style={{ color: '#4a6b80' }}>Aucun message.</p>
                ) : (
                  messages.map((msg) => {
                    const isUnread = !msg.is_read && msg.sender_type !== 'doctor';
                    const isSelf = msg.sender_type === 'doctor' && msg.sender_id === medecin.id;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '16px',
                          padding: '1rem',
                          marginBottom: '1rem',
                          backgroundColor: isUnread ? '#f0f7ff' : 'white',
                          borderLeft: isUnread ? '4px solid #0b6e8f' : '4px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#1e2a3a' }}>
                              {isSelf ? '👤 Moi' : escapeHtml(msg.sender_name)}
                              {msg.sender_type === 'patient' && (
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#2ec4b6' }}>
                                  (Patient)
                                </span>
                              )}
                              {msg.sender_type === 'doctor' && !isSelf && (
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#0b6e8f' }}>
                                  (Médecin)
                                </span>
                              )}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: '#718096', marginLeft: '0.5rem' }}>
                              {new Date(msg.sent_date).toLocaleString()}
                            </span>
                            {isUnread && (
                              <span
                                style={{
                                  background: '#0b6e8f',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.7rem',
                                  marginLeft: '0.5rem',
                                }}
                              >
                                📩 Non lu
                              </span>
                            )}
                            {!isUnread && msg.sender_type !== 'doctor' && (
                              <span style={{ color: '#2ec4b6', fontSize: '0.7rem', marginLeft: '0.5rem' }}>
                                ✅ Lu
                              </span>
                            )}
                          </div>
                          {msg.reply_to_id && (
                            <span style={{ fontStyle: 'italic', color: '#2ec4b6' }}>↳ Réponse</span>
                          )}
                        </div>
                        {msg.sender_type === 'doctor' && msg.receiver_name && (
                          <div style={{ fontSize: '0.85rem', color: '#4a6b80', marginTop: '0.3rem' }}>
                            À : {escapeHtml(msg.receiver_name)}
                          </div>
                        )}
                        <p style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>{escapeHtml(msg.message)}</p>
                        {msg.attachment_url && (
                          <div style={{ margin: '0.5rem 0' }}>
                            <a
                              href={`${API_BASE.replace('/api', '')}${msg.attachment_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#0b6e8f', textDecoration: 'underline' }}
                            >
                              📎 Télécharger la pièce jointe
                            </a>
                          </div>
                        )}
                        {selectedMessageId === msg.id ? (
                          <div style={{ marginTop: '0.5rem' }}>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows="2"
                              placeholder="Votre réponse..."
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button
                                onClick={() => sendReply(msg.id)}
                                style={{
                                  background: '#0b6e8f',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.3rem 1rem',
                                  borderRadius: '2rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Envoyer
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMessageId(null);
                                  setReplyText('');
                                }}
                                style={{
                                  background: '#6c757d',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.3rem 1rem',
                                  borderRadius: '2rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedMessageId(msg.id)}
                            style={{
                              background: '#2ec4b6',
                              color: 'white',
                              border: 'none',
                              padding: '0.3rem 1rem',
                              borderRadius: '2rem',
                              cursor: 'pointer',
                            }}
                          >
                            Répondre
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {feedback.reply && (
                <div
                  style={{
                    marginTop: '1rem',
                    color: feedback.reply.includes('✅') ? 'green' : 'red',
                  }}
                >
                  {feedback.reply}
                </div>
              )}
            </div>
          )}

          {/* ===== TAB : Nouveau message ===== */}
          {activeTab === 'newmessage' && (
            <div>
              <h3 style={{ color: '#0b6e8f' }}>✉️ Nouveau message</h3>
              <form
                onSubmit={sendNewMessage}
                style={{ background: '#f1f9fe', padding: '1.5rem', borderRadius: '16px' }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                    Destinataire
                  </label>
                  <select
                    value={receiverType}
                    onChange={(e) => setReceiverType(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0', background: 'white' }}
                  >
                    <option value="patient">👤 Patient</option>
                    <option value="doctor">👨‍⚕️ Médecin</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                    {receiverType === 'patient' ? 'Choisir un patient' : 'Choisir un médecin'}
                  </label>
                  <select
                    value={selectedReceiverId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedReceiverId(id);
                      if (receiverType === 'patient') {
                        const pat = patients.find((p) => p.id === parseInt(id));
                        setSelectedReceiverName(pat ? `${pat.first_name} ${pat.last_name}` : '');
                      } else {
                        const doc = doctors.find((d) => d.id === parseInt(id));
                        setSelectedReceiverName(doc ? doc.full_name : '');
                      }
                    }}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0', background: 'white' }}
                  >
                    <option value="">-- Sélectionnez --</option>
                    {receiverType === 'patient' && patients.length === 0 && (
                      <option value="" disabled>{patientsError || 'Aucun patient trouvé'}</option>
                    )}
                    {receiverType === 'patient' &&
                      patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.first_name} {p.last_name} ({p.email})
                        </option>
                      ))}
                    {receiverType === 'doctor' &&
                      doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name} ({d.specialty || d.profession})
                        </option>
                      ))}
                  </select>
                  {selectedReceiverName && (
                    <div style={{ marginTop: '0.3rem', fontSize: '0.9rem', color: '#0b6e8f', fontWeight: '500' }}>
                      ✅ Destinataire : {escapeHtml(selectedReceiverName)}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                    Motif du message
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0', background: 'white' }}
                  >
                    <option value="Demande d'information">📋 Demande d'information</option>
                    <option value="Demande de rendez-vous">📅 Demande de rendez-vous</option>
                    <option value="Résultats d'examens">🔬 Résultats d'examens</option>
                    <option value="Symptômes">🤒 Symptômes / questions médicales</option>
                    <option value="Ordonnance / renouvellement">💊 Ordonnance / renouvellement</option>
                    <option value="Autre">✏️ Autre (précisez)</option>
                  </select>
                  {subject === 'Autre' && (
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Précisez votre motif..."
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0', marginTop: '0.5rem' }}
                    />
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                    Message *
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows="4"
                    required
                    placeholder="Décrivez votre demande..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                    Pièce jointe (PDF, Word, etc.)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setAttachmentFile(file || null);
                      setAttachmentPreview(file ? file.name : null);
                    }}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0' }}
                  />
                  {attachmentPreview && (
                    <div style={{ marginTop: '0.3rem', color: '#2ec4b6', fontSize: '0.9rem' }}>
                      📎 Fichier sélectionné : {escapeHtml(attachmentPreview)}
                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentFile(null);
                          setAttachmentPreview(null);
                        }}
                        style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}
                      >
                        ✖
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#0b6e8f',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Envoyer
                </button>
                {feedback.reply && (
                  <div style={{ marginTop: '1rem', color: feedback.reply.includes('✅') ? 'green' : 'red' }}>
                    {feedback.reply}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ===== TAB : Disponibilités ===== */}
          {activeTab === 'disponibilites' && (
            <div>
              <h3 style={{ color: '#0b6e8f' }}>📋 Gérer mes disponibilités</h3>

              <div style={{ background: '#f1f9fe', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <h4 style={{ marginTop: 0, color: '#0b6e8f' }}>➕ Ajouter un créneau</h4>
                <form onSubmit={addAvailability} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0' }}
                    />
                  </div>
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>Début</label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0' }}
                    />
                  </div>
                  <div style={{ flex: '1 1 120px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>Fin</label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingAvail}
                    style={{
                      background: '#0b6e8f',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '2rem',
                      cursor: 'pointer',
                      height: 'fit-content',
                    }}
                  >
                    {loadingAvail ? 'Ajout...' : 'Ajouter'}
                  </button>
                </form>
                {availabilityFeedback && (
                  <div style={{ marginTop: '0.5rem', color: availabilityFeedback.includes('✅') ? 'green' : 'red' }}>
                    {availabilityFeedback}
                  </div>
                )}
              </div>

              <h4 style={{ color: '#0b6e8f' }}>📅 Mes créneaux actifs</h4>
              {loadingAvail && <p>Chargement...</p>}
              {!loadingAvail && availabilities.length === 0 && (
                <p style={{ color: '#4a6b80' }}>Aucun créneau enregistré.</p>
              )}
              {!loadingAvail && availabilities.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#0b6e8f', color: 'white' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Créneau</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Réservé ?</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availabilities.map((av) => (
                        <tr key={av.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px' }}>{av.date}</td>
                          <td style={{ padding: '8px' }}>{av.time_slot}</td>
                          <td style={{ padding: '8px' }}>
                            {av.is_booked ? (
                              <span style={{ color: 'red' }}>✅ Réservé</span>
                            ) : (
                              <span style={{ color: 'green' }}>Libre</span>
                            )}
                          </td>
                          <td style={{ padding: '8px' }}>
                            {!av.is_booked && (
                              <button
                                onClick={() => deleteAvailability(av.id)}
                                style={{
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.2rem 0.8rem',
                                  borderRadius: '1rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Supprimer
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== TAB : Salles de réunion ===== */}
          {activeTab === 'meetings' && (
            <div>
              <h3 style={{ color: '#0b6e8f' }}>🏢 Salles de réunion</h3>

              {/* Liste des salles */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                {loadingRooms ? (
                  <p>Chargement...</p>
                ) : (
                  rooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => {
                        setSelectedRoom(room.id);
                        fetchRoomBookings(room.id);
                      }}
                      style={{
                        border: selectedRoom === room.id ? '2px solid #0b6e8f' : '1px solid #ccc',
                        borderRadius: '12px',
                        padding: '1rem',
                        cursor: 'pointer',
                        minWidth: '150px',
                        background: selectedRoom === room.id ? '#f0f7ff' : 'white',
                      }}
                    >
                      <h4>{room.name}</h4>
                      <p>Capacité: {room.capacity}</p>
                      <p>{room.equipment || '-'}</p>
                      {room.has_video && <span style={{ color: '#2ec4b6' }}>📹 Vidéo</span>}
                    </div>
                  ))
                )}
              </div>

              {/* Formulaire de réservation */}
              <div style={{ background: '#f1f9fe', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <h4 style={{ marginTop: 0, color: '#0b6e8f' }}>
                  {bookingForm.is_remote ? 'Réunion à distance' : 'Réserver une salle'}
                </h4>
                <form onSubmit={handleBookRoom}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                        Titre *
                      </label>
                      <input
                        type="text"
                        value={bookingForm.title}
                        onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                        Date *
                      </label>
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                        Heure début *
                      </label>
                      <input
                        type="time"
                        value={bookingForm.start_time}
                        onChange={(e) => setBookingForm({ ...bookingForm, start_time: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                        Heure fin *
                      </label>
                      <input
                        type="time"
                        value={bookingForm.end_time}
                        onChange={(e) => setBookingForm({ ...bookingForm, end_time: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                        Salle (si réunion physique)
                      </label>
                      <select
                        value={bookingForm.room_id}
                        onChange={(e) => setBookingForm({ ...bookingForm, room_id: e.target.value })}
                        disabled={bookingForm.is_remote}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                      >
                        <option value="">-- Choisir une salle --</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label>
                        <input
                          type="checkbox"
                          checked={bookingForm.is_remote}
                          onChange={(e) =>
                            setBookingForm({ ...bookingForm, is_remote: e.target.checked, room_id: '' })
                          }
                        />{' '}
                        Réunion à distance (visioconférence)
                      </label>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>
                        Description
                      </label>
                      <textarea
                        value={bookingForm.description}
                        onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                        rows="2"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    style={{
                      background: '#0b6e8f',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '2rem',
                      cursor: 'pointer',
                      marginTop: '1rem',
                    }}
                  >
                    Réserver
                  </button>
                  {bookingFeedback && (
                    <div style={{ marginTop: '0.5rem', color: bookingFeedback.includes('✅') ? 'green' : 'red' }}>
                      {bookingFeedback}
                    </div>
                  )}
                </form>
              </div>

              {/* Réservations de la salle sélectionnée */}
              {selectedRoom && (
                <div>
                  <h4>Réservations pour cette salle</h4>
                  {roomBookings.length === 0 ? (
                    <p>Aucune réservation.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#0b6e8f', color: 'white' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Heure</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Titre</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Réservé par</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Lien</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roomBookings.map((b) => (
                            <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px' }}>{b.date}</td>
                              <td style={{ padding: '8px' }}>
                                {b.start_time} - {b.end_time}
                              </td>
                              <td style={{ padding: '8px' }}>{b.title}</td>
                              <td style={{ padding: '8px' }}>{b.booked_by_name || b.booked_by}</td>
                              <td style={{ padding: '8px' }}>
                                {b.meeting_link && (
                                  <a
                                    href={b.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#0b6e8f' }}
                                  >
                                    🔗 Rejoindre
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Mes réservations */}
              <div style={{ marginTop: '2rem' }}>
                <h4>📅 Mes réservations</h4>
                {myBookings.length === 0 ? (
                  <p>Aucune réservation.</p>
                ) : (
                  myBookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <strong>{b.title}</strong> – {b.date} {b.start_time}-{b.end_time}
                        {b.is_remote ? ' (📹 Visio)' : ` (Salle: ${b.room_name || b.room_id})`}
                        {b.meeting_link && (
                          <a
                            href={b.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: '1rem', color: '#2ec4b6' }}
                          >
                            🔗 Démarrer la visio
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => cancelBooking(b.id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '0.2rem 0.8rem',
                          borderRadius: '1rem',
                          cursor: 'pointer',
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EspaceMedecin;
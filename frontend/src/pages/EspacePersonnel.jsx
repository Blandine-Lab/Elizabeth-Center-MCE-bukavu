// src/pages/EspacePersonnel.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const LOGIN_URL = `${API_BASE}/staff/login`; // endpoint à créer dans le backend

function EspacePersonnel() {
  const [token, setToken] = useState(localStorage.getItem('staffToken'));
  const [staff, setStaff] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('rooms');
  const [feedback, setFeedback] = useState({ login: '', action: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // États pour les salles
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

  // Messages (lecture uniquement pour le personnel, ou réponse limitée)
  const [replyText, setReplyText] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, (m) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])
    );
  }

  // Décodage token
  const decodeStaffFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.id, name: payload.name, email: payload.email, role: payload.role };
    } catch {
      return null;
    }
  };

  // Connexion
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
        localStorage.setItem('staffToken', data.token);
        setToken(data.token);
        setStaff({
          id: data.staff.id,
          name: data.staff.name,
          email: data.staff.email,
          role: data.staff.role || 'staff',
        });
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
    localStorage.removeItem('staffToken');
    setToken(null);
    setStaff(null);
    setMessages([]);
    setRooms([]);
    setMyBookings([]);
  };

  // Récupérer les messages (reçus en tant que staff)
  const fetchMessages = async () => {
    if (!staff || !token) return;
    try {
      const res = await fetch(`${API_BASE}/messages/staff/${staff.id}`, {
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
      console.error('❌ fetchMessages staff:', err);
    }
  };

  // Salles
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
    if (!staff) return;
    try {
      const res = await fetch(`${API_BASE}/meeting-rooms/bookings/user/${staff.id}`, {
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
        booked_by: staff.id,
        booked_by_name: staff.name,
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

  // Répondre à un message (optionnel)
  const sendReply = async (messageId) => {
    if (!replyText.trim()) {
      setFeedback({ ...feedback, action: 'Message vide' });
      return;
    }
    const originalMsg = messages.find((m) => m.id === messageId);
    if (!originalMsg) return;
    setFeedback({ ...feedback, action: 'Envoi...' });
    try {
      const res = await fetch(`${API_BASE}/messages/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: replyText,
          sender_name: staff.name,
          sender_id: staff.id,
          sender_type: 'staff',
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
      }
      setFeedback({ ...feedback, action: '✅ Réponse envoyée' });
      setReplyText('');
      setSelectedMessageId(null);
      fetchMessages();
    } catch (err) {
      setFeedback({ ...feedback, action: err.message || 'Erreur réseau' });
    }
  };

  // Effets
  useEffect(() => {
    if (staff && token) {
      fetchMessages();
      fetchRooms();
      fetchMyBookings();
      const interval = setInterval(() => {
        fetchMessages();
        fetchMyBookings();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [staff, token]);

  useEffect(() => {
    if (token && !staff) {
      const decoded = decodeStaffFromToken(token);
      if (decoded) setStaff(decoded);
      else logout();
    }
  }, [token]);

  // ---------- Page de connexion ----------
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
            <h2 style={{ textAlign: 'center', color: '#0b6e8f' }}>Espace Personnel</h2>
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

  if (!staff) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
  }

  // ---------- Rendu principal ----------
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
            <h2 style={{ margin: 0, color: '#0b6e8f' }}>
              Bonjour {escapeHtml(staff.name)} ({escapeHtml(staff.role || 'Personnel')})
            </h2>
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
              { id: 'rooms', label: '🏢 Salles' },
              { id: 'messages', label: '📬 Messages' },
              { id: 'mybookings', label: '📅 Mes réservations' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

          {/* TAB : Salles de réunion */}
          {activeTab === 'rooms' && (
            <div>
              <h3 style={{ color: '#0b6e8f' }}>🏢 Salles de réunion</h3>
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

              {/* Formulaire réservation */}
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

              {/* Réservations de la salle */}
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
            </div>
          )}

          {/* TAB : Messages */}
          {activeTab === 'messages' && (
            <div>
              <h3 style={{ color: '#0b6e8f' }}>📬 Messagerie</h3>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {messages.length === 0 ? (
                  <p style={{ color: '#4a6b80' }}>Aucun message.</p>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.sender_type === 'staff' && msg.sender_id === staff.id;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '16px',
                          padding: '1rem',
                          marginBottom: '1rem',
                          backgroundColor: !msg.is_read && !isSelf ? '#f0f7ff' : 'white',
                          borderLeft: !msg.is_read && !isSelf ? '4px solid #0b6e8f' : '4px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#1e2a3a' }}>
                              {isSelf ? '👤 Moi' : escapeHtml(msg.sender_name)}
                              {msg.sender_type === 'doctor' && (
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#0b6e8f' }}>
                                  (Médecin)
                                </span>
                              )}
                              {msg.sender_type === 'staff' && !isSelf && (
                                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#2ec4b6' }}>
                                  (Personnel)
                                </span>
                              )}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: '#718096', marginLeft: '0.5rem' }}>
                              {new Date(msg.sent_date).toLocaleString()}
                            </span>
                            {!msg.is_read && !isSelf && (
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
                          </div>
                          {msg.reply_to_id && (
                            <span style={{ fontStyle: 'italic', color: '#2ec4b6' }}>↳ Réponse</span>
                          )}
                        </div>
                        {msg.sender_type === 'staff' && msg.receiver_name && (
                          <div style={{ fontSize: '0.85rem', color: '#4a6b80', marginTop: '0.3rem' }}>
                            À : {escapeHtml(msg.receiver_name)}
                          </div>
                        )}
                        <p style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>{escapeHtml(msg.message)}</p>
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
              {feedback.action && (
                <div style={{ marginTop: '1rem', color: feedback.action.includes('✅') ? 'green' : 'red' }}>
                  {feedback.action}
                </div>
              )}
            </div>
          )}

          {/* TAB : Mes réservations */}
          {activeTab === 'mybookings' && (
            <div>
              <h3 style={{ color: '#0b6e8f' }}>📅 Mes réservations</h3>
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
          )}
        </div>
      </div>
    </div>
  );
}

export default EspacePersonnel;
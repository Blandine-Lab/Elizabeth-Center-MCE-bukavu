// src/pages/EspacePatient.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function EspacePatient() {
  const [token, setToken] = useState(localStorage.getItem('patientToken'));
  const [patient, setPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('messages');
  const [replyText, setReplyText] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [feedback, setFeedback] = useState({ login: '', reply: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDoctorName, setSelectedDoctorName] = useState('');

  // États pour le formulaire "Nouveau message"
  const [receiverType, setReceiverType] = useState('admin');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [subject, setSubject] = useState("Demande d'information");
  const [customSubject, setCustomSubject] = useState('');
  const [messageText, setMessageText] = useState('');

  // États pour la pièce jointe
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
  }

  const decodePatientFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload.id, name: payload.name, email: payload.email };
    } catch { return null; }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ ...feedback, login: 'Connexion en cours...' });
    try {
      const res = await fetch(`${API_BASE}/patient/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('patientToken', data.token);
        setToken(data.token);
        const patientInfo = decodePatientFromToken(data.token) || data.patient;
        if (patientInfo) setPatient(patientInfo);
        else throw new Error('Impossible de récupérer les informations du patient');
        setFeedback({ ...feedback, login: '' });
      } else {
        setFeedback({ ...feedback, login: data.error || 'Erreur de connexion' });
      }
    } catch (err) {
      setFeedback({ ...feedback, login: err.message || 'Erreur réseau' });
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('patientToken');
    setToken(null);
    setPatient(null);
    setMessages([]);
    setAppointments([]);
  };

  const fetchMessages = async () => {
    if (!patient || !token) return;
    try {
      const res = await fetch(`${API_BASE}/messages/patient/${patient.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) { console.error(err); }
  };

  const fetchAppointments = async () => {
    if (!patient || !token) return;
    try {
      const res = await fetch(`${API_BASE}/patient/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAppointments(data);
    } catch (err) { console.error(err); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE}/staff`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const medecins = data.filter(d => d.profession === 'Médecin');
      setDoctors(medecins);
    } catch (err) {
      console.error('Erreur chargement médecins:', err);
    }
  };

  const sendReply = async (messageId) => {
    if (!replyText.trim()) {
      setFeedback({ ...feedback, reply: 'Message vide' });
      return;
    }
    const originalMsg = messages.find(m => m.id === messageId);
    if (!originalMsg) return;
    setFeedback({ ...feedback, reply: 'Envoi...' });
    try {
      const res = await fetch(`${API_BASE}/messages/${messageId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          message: replyText,
          sender_name: patient.name,
          sender_id: patient.id,
          sender_type: 'patient'
        })
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
    let receiver_type = 'admin';

    if (receiverType === 'doctor') {
      if (!selectedDoctorId) {
        setFeedback({ ...feedback, reply: 'Veuillez sélectionner un médecin' });
        return;
      }
      receiver_type = 'doctor';
      receiver_id = parseInt(selectedDoctorId);
      const selectedDoc = doctors.find(d => d.id === receiver_id);
      receiver_name = selectedDoc ? selectedDoc.full_name : 'Médecin';
    } else {
      receiver_type = 'admin';
      receiver_id = 0;
      receiver_name = 'Administration';
    }

    if (!messageText.trim()) {
      setFeedback({ ...feedback, reply: 'Le message ne peut pas être vide' });
      return;
    }

    // --- UPLOAD AMÉLIORÉ ---
    let attachmentUrl = null;
    if (attachmentFile) {
      const formData = new FormData();
      formData.append('file', attachmentFile);
      try {
        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
          headers: { 'Authorization': `Bearer ${token}` }
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          sender_type: 'patient',
          sender_id: patient.id,
          sender_name: patient.name,
          receiver_type,
          receiver_id,
          receiver_name,
          subject: finalSubject,
          message: messageText,
          attachment_url: attachmentUrl
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
      }
      setFeedback({ ...feedback, reply: '✅ Message envoyé' });
      setMessageText('');
      setSelectedDoctorId('');
      setSelectedDoctorName('');
      setSubject("Demande d'information");
      setCustomSubject('');
      setReceiverType('admin');
      setAttachmentFile(null);
      setAttachmentPreview(null);
      fetchMessages();
    } catch (err) {
      setFeedback({ ...feedback, reply: err.message || 'Erreur réseau' });
    }
  };

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    if (patient && token) {
      fetchMessages();
      fetchAppointments();
      const interval = setInterval(() => {
        fetchMessages();
        fetchAppointments();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [patient, token]);

  useEffect(() => {
    if (token && !patient) {
      const patientInfo = decodePatientFromToken(token);
      if (patientInfo) setPatient(patientInfo);
      else logout();
    }
  }, [token]);

  useEffect(() => {
    if (patient && token) {
      fetchDoctors();
    }
  }, [patient, token]);

  useEffect(() => {
    setSelectedDoctorName('');
    setSelectedDoctorId('');
  }, [receiverType]);

  // ---------------- Rendu de la page de connexion ----------------
  if (!token) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <video autoPlay muted loop playsInline preload="auto" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src="/video9.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1 }}></div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', color: '#0b6e8f' }}>Espace Patient</h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>Mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0' }} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #0b6e8f, #2ec4b6)', color: 'white', padding: '0.7rem', borderRadius: '2rem', border: 'none', fontWeight: '600', cursor: 'pointer' }}>{loading ? 'Connexion...' : 'Se connecter'}</button>
              {feedback.login && <div style={{ marginTop: '1rem', color: feedback.login.includes('Erreur') ? 'red' : 'blue' }}>{feedback.login}</div>}
            </form>
            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#4a6b80' }}>
              Pas encore de compte ? <Link to="/inscription" style={{ color: '#0b6e8f', fontWeight: '600', textDecoration: 'none' }}>Créer un compte</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement du profil...</div>;

  // ---------------- Rendu de l'espace connecté ----------------
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <video autoPlay muted loop playsInline preload="auto" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
        <source src="/video9.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1 }}></div>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '2rem auto', padding: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, color: '#0b6e8f' }}>Bonjour {escapeHtml(patient.name)}</h2>
            <button onClick={logout} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '2rem', cursor: 'pointer' }}>Déconnexion</button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('messages')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'messages' ? 'bold' : 'normal', color: activeTab === 'messages' ? '#0b6e8f' : '#4a5568', borderBottom: activeTab === 'messages' ? '2px solid #0b6e8f' : 'none' }}>Messagerie</button>
            <button onClick={() => setActiveTab('appointments')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'appointments' ? 'bold' : 'normal', color: activeTab === 'appointments' ? '#0b6e8f' : '#4a5568', borderBottom: activeTab === 'appointments' ? '2px solid #0b6e8f' : 'none' }}>Mes rendez-vous</button>
            <button onClick={() => setActiveTab('newmessage')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: activeTab === 'newmessage' ? 'bold' : 'normal', color: activeTab === 'newmessage' ? '#0b6e8f' : '#4a5568', borderBottom: activeTab === 'newmessage' ? '2px solid #0b6e8f' : 'none' }}>Nouveau message</button>
          </div>

          {/* ============== TAB : Messagerie ============== */}
          {activeTab === 'messages' && (
            <div>
              <h3 style={{ color: '#0b6e8f' }}>📬 Messagerie</h3>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {messages.length === 0 ? (
                  <p style={{ color: '#4a6b80' }}>Aucun message.</p>
                ) : (
                  messages.map(msg => {
                    const isUnread = !msg.is_read && msg.sender_type !== 'patient';
                    return (
                      <div key={msg.id} style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        backgroundColor: isUnread ? '#f0f7ff' : 'white',
                        borderLeft: isUnread ? '4px solid #0b6e8f' : '4px solid transparent'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#1e2a3a' }}>
                              {msg.sender_type === 'patient' ? '👤 Moi' : escapeHtml(msg.sender_name)}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: '#718096', marginLeft: '0.5rem' }}>
                              {new Date(msg.sent_date).toLocaleString()}
                            </span>
                            {isUnread && <span style={{ background: '#0b6e8f', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', marginLeft: '0.5rem' }}>📩 Non lu</span>}
                            {!isUnread && msg.sender_type !== 'patient' && <span style={{ color: '#2ec4b6', fontSize: '0.7rem', marginLeft: '0.5rem' }}>✅ Lu</span>}
                          </div>
                          {msg.reply_to_id && <span style={{ fontStyle: 'italic', color: '#2ec4b6' }}>↳ Réponse</span>}
                        </div>
                        {msg.sender_type === 'patient' && msg.receiver_name && (
                          <div style={{ fontSize: '0.85rem', color: '#4a6b80', marginTop: '0.3rem' }}>
                            À : {escapeHtml(msg.receiver_name)}
                          </div>
                        )}
                        <p style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>{escapeHtml(msg.message)}</p>
                        {msg.attachment_url && (
                          <div style={{ margin: '0.5rem 0' }}>
                            <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0b6e8f', textDecoration: 'underline' }}>
                              📎 Télécharger la pièce jointe
                            </a>
                          </div>
                        )}
                        {selectedMessageId === msg.id ? (
                          <div style={{ marginTop: '0.5rem' }}>
                            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows="2" placeholder="Votre réponse..." style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0' }} />
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button onClick={() => sendReply(msg.id)} style={{ background: '#0b6e8f', color: 'white', border: 'none', padding: '0.3rem 1rem', borderRadius: '2rem', cursor: 'pointer' }}>Envoyer</button>
                              <button onClick={() => { setSelectedMessageId(null); setReplyText(''); }} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.3rem 1rem', borderRadius: '2rem', cursor: 'pointer' }}>Annuler</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setSelectedMessageId(msg.id)} style={{ background: '#2ec4b6', color: 'white', border: 'none', padding: '0.3rem 1rem', borderRadius: '2rem', cursor: 'pointer' }}>Répondre</button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {feedback.reply && <div style={{ marginTop: '1rem', color: feedback.reply.includes('✅') ? 'green' : 'red' }}>{feedback.reply}</div>}
            </div>
          )}

          {/* ============== TAB : Rendez-vous ============== */}
          {activeTab === 'appointments' && (
            <div>
              <h3 style={{ color: '#0b6e8f' }}>📅 Mes rendez-vous</h3>
              {appointments.length === 0 ? (
                <p style={{ color: '#4a6b80' }}>Aucun rendez-vous.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {appointments.map(a => (
                    <div key={a.id} style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '1rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#0b6e8f' }}>{a.date} - {a.time}</span>
                        <span style={{
                          background: a.status === 'confirmed' ? '#d4edda' : a.status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                          color: a.status === 'confirmed' ? '#155724' : a.status === 'cancelled' ? '#721c24' : '#856404',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.7rem'
                        }}>{a.status || 'pending'}</span>
                      </div>
                      <p style={{ margin: '0.5rem 0' }}><strong>Médecin :</strong> {escapeHtml(a.doctor_name || '-')}</p>
                      <p style={{ margin: '0.5rem 0' }}><strong>Spécialité :</strong> {escapeHtml(a.specialty || '-')}</p>
                      {/* ✅ Affichage du bouton de téléconsultation si validée */}
                      {a.teleconsultation_validated && (
                        <a
                          href={`/teleconsultation/${a.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#2ec4b6',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            textDecoration: 'none',
                            display: 'inline-block',
                            marginTop: '0.5rem'
                          }}
                        >
                          🎥 Rejoindre la visio
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============== TAB : Nouveau message ============== */}
          {activeTab === 'newmessage' && (
            <div>
              <h3 style={{ color: '#0b6e8f' }}>✉️ Nouveau message</h3>
              <form onSubmit={sendNewMessage} style={{ background: '#f1f9fe', padding: '1.5rem', borderRadius: '16px' }}>
                {/* Destinataire */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>Destinataire</label>
                  <select
                    value={receiverType}
                    onChange={(e) => setReceiverType(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0', background: 'white' }}
                  >
                    <option value="admin">🏢 Administration</option>
                    <option value="doctor">👨‍⚕️ Médecin</option>
                  </select>
                </div>

                {/* Sélection du médecin */}
                {receiverType === 'doctor' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>Choisir un médecin</label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedDoctorId(id);
                        const doc = doctors.find(d => d.id === parseInt(id));
                        setSelectedDoctorName(doc ? doc.full_name : '');
                      }}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0', background: 'white' }}
                    >
                      <option value="">-- Sélectionnez un médecin --</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.full_name} ({d.specialty || d.profession})</option>
                      ))}
                    </select>
                    {selectedDoctorName && (
                      <div style={{ marginTop: '0.3rem', fontSize: '0.9rem', color: '#0b6e8f', fontWeight: '500' }}>
                        ✅ Destinataire : {escapeHtml(selectedDoctorName)}
                      </div>
                    )}
                  </div>
                )}

                {/* Sujet */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>Motif du message</label>
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
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '1rem',
                        border: '1px solid #cbd5e0',
                        marginTop: '0.5rem'
                      }}
                    />
                  )}
                </div>

                {/* Message */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>Message *</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows="4"
                    required
                    placeholder="Décrivez votre demande..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0' }}
                  />
                </div>

                {/* Pièce jointe */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem', color: '#1e2a3a' }}>Pièce jointe (PDF, Word, etc.)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setAttachmentFile(file);
                        setAttachmentPreview(file.name);
                      } else {
                        setAttachmentFile(null);
                        setAttachmentPreview(null);
                      }
                    }}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '1rem', border: '1px solid #cbd5e0' }}
                  />
                  {attachmentPreview && (
                    <div style={{ marginTop: '0.3rem', color: '#2ec4b6', fontSize: '0.9rem' }}>
                      📎 Fichier sélectionné : {escapeHtml(attachmentPreview)}
                      <button
                        type="button"
                        onClick={() => { setAttachmentFile(null); setAttachmentPreview(null); }}
                        style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}
                      >
                        ✖
                      </button>
                    </div>
                  )}
                </div>

                <button type="submit" style={{ background: '#0b6e8f', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '2rem', cursor: 'pointer', width: '100%' }}>
                  Envoyer
                </button>
                {feedback.reply && <div style={{ marginTop: '1rem', color: feedback.reply.includes('✅') ? 'green' : 'red' }}>{feedback.reply}</div>}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EspacePatient;
// src/pages/Accueil.jsx
import { useState, useEffect } from 'react';
import FloatingChat from '../components/FloatingChat';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]);
}

function Accueil() {
  const [doctors, setDoctors] = useState([]);
  const [actualites, setActualites] = useState([]);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [etablissement, setEtablissement] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState({});
  
  const [tarifsModalActive, setTarifsModalActive] = useState(false);
  const [paiementFactureModalActive, setPaiementFactureModalActive] = useState(false);
  const [tarifsContent, setTarifsContent] = useState('');
  const [paiementFactureContent, setPaiementFactureContent] = useState('');
  
  const [formFeedback, setFormFeedback] = useState('');
  const [newsletterFeedback, setNewsletterFeedback] = useState('');
  const [paymentFeedback, setPaymentFeedback] = useState('');
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  let adminClicks = 0;
  let adminTimer = null;

  // ========== CHARGEMENT DES DONNÉES ==========
  async function loadDoctors() {
    try {
      const res = await fetch(`${API_BASE}/staff`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const staff = await res.json();
      if (Array.isArray(staff)) setDoctors(staff);
    } catch (err) { console.error('Erreur médecins:', err); }
  }
  
  async function loadActualites() {
    try {
      const res = await fetch(`${API_BASE}/actualites`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const active = data.filter(a => a.active !== 0).sort((a,b) => (a.ordre||0) - (b.ordre||0));
        setActualites(active);
      }
    } catch (err) { console.error('Erreur actualités:', err); }
  }
  
  async function loadEvents() {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const activeEvents = data.filter(e => e.active === true);
        setEvents(activeEvents);
      }
    } catch (err) { console.error('Erreur événements:', err); }
  }
  
  async function loadJobs() {
    try {
      const res = await fetch(`${API_BASE}/public-jobs`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        console.warn('Réponse non-tableau', data);
        setJobs([]);
      }
    } catch (err) {
      console.error('❌ Erreur chargement offres:', err);
      setJobs([]);
    }
  }
  
  async function loadEtablissement() {
    try {
      const res = await fetch(`${API_BASE}/etablissement`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const photos = await res.json();
      if (Array.isArray(photos)) {
        const activePhotos = photos.filter(p => p.active !== 0 && p.active !== false).sort((a,b) => a.ordre - b.ordre);
        setEtablissement(activePhotos);
      }
    } catch (err) { console.error('Erreur établissement:', err); }
  }
  
  async function loadPartenaires() {
    try {
      const res = await fetch(`${API_BASE}/partenaires`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const activePartenaires = data.filter(p => p.active === 1 || p.active === true).sort((a,b) => a.ordre - b.ordre);
        setPartenaires(activePartenaires);
      }
    } catch (err) { console.error('Erreur partenaires:', err); }
  }
  
  async function loadSpecialties() {
    try {
      const res = await fetch(`${API_BASE}/specialties`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const activeSpecialties = data.filter(s => s.active === 1 || s.active === true);
        setSpecialties(activeSpecialties);
      }
    } catch (err) { console.error('Erreur spécialités:', err); }
  }
  
  async function loadPaymentConfig() {
    try {
      const res = await fetch(`${API_BASE}/paiement/config`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const config = await res.json();
      setPaymentConfig(config);
    } catch (err) { console.error('Erreur config paiement:', err); }
  }
  
  async function loadTarifsContent() {
    try {
      const res = await fetch(`${API_BASE}/tarifs`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const tarifs = await res.json();
      if (Array.isArray(tarifs)) {
        const actifs = tarifs.filter(t => t.active === 1).sort((a,b) => a.ordre - b.ordre);
        if (actifs.length === 0) {
          setTarifsContent('<p>Aucun tarif disponible pour le moment.</p>');
          return;
        }
        const grouped = {};
        actifs.forEach(t => {
          if (!grouped[t.service]) grouped[t.service] = [];
          grouped[t.service].push(t);
        });
        let html = '<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse;">';
        for (const [service, items] of Object.entries(grouped)) {
          html += `<thead><tr style="background:#0b6e8f; color:white;"><th colspan="3">${escapeHtml(service)}</th></tr>
                   <tr style="background:#eef2f6;"><th>Prestation</th><th>Prix</th><th>Description</th></tr></thead><tbody>`;
          items.forEach(item => {
            html += `<tr>
                      <td style="border-bottom:1px solid #ddd; padding:8px;">${escapeHtml(item.prestation)}</td>
                      <td style="border-bottom:1px solid #ddd; padding:8px;">${escapeHtml(item.prix)}</td>
                      <td style="border-bottom:1px solid #ddd; padding:8px;">${escapeHtml(item.description || '')}</td>
                    </tr>`;
          });
          html += `</tbody>`;
        }
        html += `</table></div><p style="margin-top:1rem; font-size:0.8rem;">*Tarifs indicatifs, hors dépassements éventuels.</p>`;
        setTarifsContent(html);
      } else {
        setTarifsContent('<p>Erreur de chargement des tarifs.</p>');
      }
    } catch(err) {
      console.error('Erreur tarifs:', err);
      setTarifsContent('<p>Erreur de chargement des tarifs.</p>');
    }
  }
  
  async function loadPaiementFactureContent() {
    try {
      const res = await fetch(`${API_BASE}/site-content/paiement_facture`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPaiementFactureContent(data.contenu || '<p>Pour payer votre facture, utilisez le formulaire ci-dessus ou contactez notre service financier.</p>');
    } catch(err) {
      console.error('Erreur paiement facture:', err);
      setPaiementFactureContent('<p>Erreur de chargement.</p>');
    }
  }
  
  async function loadSlots(doctorId, date) {
    if (!doctorId || !date) { setAvailableSlots([]); return; }
    try {
      const res = await fetch(`${API_BASE}/availability/${doctorId}/${date}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const slots = await res.json();
      if (Array.isArray(slots)) setAvailableSlots(slots);
      else setAvailableSlots([]);
    } catch (err) { console.error('Erreur créneaux:', err); setAvailableSlots([]); }
  }
  
  // ========== GESTIONNAIRES DE FORMULAIRES ==========
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      fullname: formData.get('fullname'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      date: formData.get('date'),
      time: formData.get('time'),
      doctorId: parseInt(formData.get('doctorId')),
      specialty: formData.get('specialty'),
      message: formData.get('message')
    };
    setFormFeedback('<span style="color:blue;">Envoi en cours...</span>');
    try {
      const res = await fetch(`${API_BASE}/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (res.ok) {
        setFormFeedback('<span style="color:green;">✅ Rendez-vous enregistré avec succès !</span>');
        e.target.reset();
        setAvailableSlots([]);
        setTimeout(() => setFormFeedback(''), 5000);
      } else {
        setFormFeedback(`<span style="color:red;">❌ Erreur : ${result.error}</span>`);
      }
    } catch (err) {
      console.error(err);
      setFormFeedback('<span style="color:red;">❌ Erreur réseau. Veuillez réessayer.</span>');
    }
  };
  
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('#newsEmail').value.trim();
    if (!email) {
      setNewsletterFeedback('<span style="color:red;">Veuillez saisir un email</span>');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (res.ok) {
        setNewsletterFeedback('<span style="color:green;">✅ Inscription réussie !</span>');
        e.target.querySelector('#newsEmail').value = '';
        setTimeout(() => setNewsletterFeedback(''), 3000);
      } else {
        setNewsletterFeedback(`<span style="color:red;">❌ ${data.error || 'Erreur'}</span>`);
      }
    } catch (err) {
      console.error('Erreur newsletter:', err);
      setNewsletterFeedback('<span style="color:red;">❌ Erreur réseau</span>');
    }
  };
  
  // ✅ NOUVEAU : Gestionnaire pour le paiement manuel avec upload de preuve
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Vérifications
    const montant = parseFloat(formData.get('montant'));
    if (isNaN(montant) || montant <= 0) {
      setPaymentFeedback('<span style="color:red;">Montant invalide</span>');
      return;
    }
    const methode = formData.get('methode');
    const telephone = formData.get('telephone');
    if (methode === 'mobile_money' && !telephone) {
      setPaymentFeedback('<span style="color:red;">Téléphone requis pour Mobile Money</span>');
      return;
    }
    const preuve = formData.get('preuve');
    if (!preuve || preuve.size === 0) {
      setPaymentFeedback('<span style="color:red;">Veuillez joindre une preuve de paiement (facture/bordereau)</span>');
      return;
    }

    setPaymentFeedback('<span style="color:blue;">Envoi en cours...</span>');

    try {
      const res = await fetch(`${API_BASE}/paiement/manual`, {
        method: 'POST',
        body: formData, // Ne pas définir Content-Type, le navigateur gère le multipart
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentFeedback(`<span style="color:green;">✅ ${data.message}</span>`);
        e.target.reset();
        // Cacher le champ téléphone si affiché
        const telephoneGroup = document.getElementById('telephoneGroup');
        if (telephoneGroup) telephoneGroup.style.display = 'none';
      } else {
        setPaymentFeedback(`<span style="color:red;">❌ Erreur : ${data.error}</span>`);
      }
    } catch (err) {
      console.error(err);
      setPaymentFeedback('<span style="color:red;">❌ Erreur réseau. Veuillez réessayer.</span>');
    }
  };
  
  // ========== EFFETS ==========
  useEffect(() => {
    loadDoctors();
    loadActualites();
    loadEvents();
    loadJobs();
    loadEtablissement();
    loadPartenaires();
    loadSpecialties();
    loadPaymentConfig();
    
    const interval = setInterval(() => {
      loadDoctors();
      loadActualites();
      loadEvents();
      loadJobs();
      loadEtablissement();
      loadPartenaires();
      loadSpecialties();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadSlots(selectedDoctor, selectedDate);
    }
  }, [selectedDoctor, selectedDate]);
  
  // Gestion de l'affichage du champ téléphone en fonction du mode de paiement
  useEffect(() => {
    const methodeSelect = document.getElementById('payMethode');
    const telephoneGroup = document.getElementById('telephoneGroup');
    if (methodeSelect && telephoneGroup) {
      const toggleTelephone = () => {
        telephoneGroup.style.display = methodeSelect.value === 'mobile_money' ? 'block' : 'none';
      };
      methodeSelect.addEventListener('change', toggleTelephone);
      return () => methodeSelect.removeEventListener('change', toggleTelephone);
    }
  }, []);
  
  // ========== RENDU JSX ==========
  return (
    <>
      {/* Top bar */}
      <div className="top-bar">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/espace-patient"><i className="fas fa-user"></i> Portail patient</Link>
          <a href="#"><i className="fas fa-language"></i> English version</a>
          <Link to="/support"><i className="fas fa-heart"></i> Je fais un don</Link>
          <Link to="/trouver-professionnel"><i className="fas fa-stethoscope"></i> Trouver un médecin</Link>
        </div>
        <div style={{ fontSize: '0.75rem' }}><i className="fas fa-phone-alt"></i> Urgences 24/7 : +243 992 952 038</div>
      </div>

      <Navbar />

      <div className="secondary-nav">
        <Link to="/info-patients">Informations patients & visiteurs</Link>
        <Link to="/nos-specialites">Nos spécialités</Link>
        <Link to="/checkup-center">Check-up Center</Link>
        <Link to="/about">Nous connaître</Link>
        <Link to="/support" style={{ color: '#2ec4b6', fontWeight: 'bold' }}>Nous soutenir</Link>
        <Link to="/jobs" style={{ color: '#2ec4b6', fontWeight: 'bold' }}>💼 Offres d'emploi</Link>
        <Link to="/trouver-professionnel" style={{ color: '#2ec4b6', fontWeight: 'bold' }}>👨‍⚕️ Trouver un professionnel</Link>
      </div>

      <div className="announcement-bar">
        <i className="fas fa-info-circle"></i> Prochaine fermeture technique : vous sera communiqué. Mais nous sommes ouverts.. 
        <a href="#" style={{ color: '#0b6e8f', textDecoration: 'underline' }}>Voir toutes les annonces</a>
      </div>

      {/* Hero */}
      <section id="home" className="hero">
        <video autoPlay muted loop playsInline className="hero-video-bg">
          <source src="/videos/video2.mp4" type="video/mp4" />
        </video>
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge"><i className="fas fa-microchip"></i> <span>Médecine de précision · MCE Excellence</span></div>
            <h1>Bienvenue au Medical Center Elizabeth (MCE)</h1>
            <p className="hero-desc">Bloc opératoire conventionnel – sécurité, hygiène, compétence.</p>
            <div className="btn-group">
              <a href="#appointment" className="btn-primary">Prendre rendez-vous <i className="fas fa-calendar-check"></i></a>
              <a href="#services" className="btn-secondary">Découvrir nos expertises</a>
            </div>
            <div className="hero-stats">
              <div className="stat-item"><h3>98%</h3><p>Satisfaction patient</p></div>
              <div className="stat-item"><h3>24/7</h3><p>Urgences & téléconsultation</p></div>
              <div className="stat-item"><h3>+150</h3><p>Spécialistes hautement qual.</p></div>
            </div>
          </div>
          <div className="hero-visual">
            <h3 style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => {
              adminClicks++;
              if (adminTimer) clearTimeout(adminTimer);
              adminTimer = setTimeout(() => adminClicks = 0, 2000);
              if (adminClicks >= 5) { adminClicks = 0; window.location.href = '/admin'; }
            }}><i className="fas fa-calendar-alt"></i> Prochaines actions</h3>
            <div id="eventsList" style={{ listStyle: 'none', padding: 0 }}>
              {events.length === 0 ? <p>Chargement des événements...</p> : events.map(e => (
                <div key={e.id} style={{ marginBottom: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <i className="fas fa-calendar-day" style={{ color: '#2ec4b6', width: '24px' }}></i>
                  <span><strong>{escapeHtml(e.title)}</strong><br /><small>{escapeHtml(e.description || '')}</small></span>
                </div>
              ))}
            </div>
            <a href="#appointment" className="btn-primary" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Voir tous les événements</a>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="quick-links"><div className="container"><div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
        <a href="#appointment" className="quick-link">Prendre RDV</a>
        <a href="#" className="quick-link">Téléconsultation</a>
        <a href="#" className="quick-link">Mes résultats</a>
        <a href="#" className="quick-link">Trouver un médecin</a>
      </div></div></section>

      {/* Services */}
      <section id="services" className="services-section">
        <video autoPlay muted loop playsInline className="video-background"><source src="/videos/video1.mp4" type="video/mp4" /></video>
        <div className="overlay-dark"></div>
        <div className="container">
          <h2 className="section-title">Soins d'excellence au MCE</h2>
          <p className="section-sub">Innovations médicales, équipements de pointe et approche personnalisée.</p>
          <div className="services-grid">
            <div className="service-card"><div className="service-icon"><i className="fas fa-robot"></i></div><h3>Blocs opératoires standards</h3><p>Da Vinci XI & nouvelles générations.</p></div>
            <div className="service-card"><div className="service-icon"><i className="fas fa-brain"></i></div><h3>diagnostic précis par imagerie</h3><p>Algorithmes prédictifs pour imagerie médicale.</p></div>
            <div className="service-card"><div className="service-icon"><i className="fas fa-vr-cardboard"></i></div><h3>Des chirurgiens qualifiés</h3><p>Planification chirurgicale immersive.</p></div>
            <div className="service-card"><div className="service-icon"><i className="fas fa-microphone-alt"></i></div><h3>Télésuivi connecté</h3><p>Objets connectés & monitoring 24/7.</p></div>
          </div>
        </div>
      </section>

      {/* Médecins */}
      <section id="doctors" style={{ position: 'relative', overflow: 'hidden' }}>
        <video autoPlay muted loop playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src="/videos/video6.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.55)', zIndex: 1 }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="section-title" style={{ color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>Corps médical d'excellence MCE</h2>
          <p className="section-sub" style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Des leaders internationaux formés aux technologies de rupture.</p>
          <div className="doctors-grid">
            {doctors.filter(d => d.profession === 'Médecin').length === 0 ? (
              <p style={{ color: 'white', textAlign: 'center' }}>Chargement des médecins...</p>
            ) : (
              doctors.filter(d => d.profession === 'Médecin').map(m => (
                <div key={m.id} className="doctor-card" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)' }}>
                  <div className="doc-img">{m.photo_url ? <img src={`${API_BASE.replace('/api', '')}${m.photo_url}`} alt={m.full_name} /> : <i className="fas fa-user-md"></i>}</div>
                  <h4>{escapeHtml(m.full_name)}</h4>
                  <p className="specialty">{escapeHtml(m.profession)}{m.specialty ? ' - ' + escapeHtml(m.specialty) : ''}</p>
                  <p>{escapeHtml(m.department || '')}</p>
                  {m.bio && <p className="bio" style={{ fontSize: '0.85rem', color: '#4a627a', marginTop: '0.5rem' }}>{escapeHtml(m.bio)}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Offres d'emploi */}
      <section style={{ padding: '3rem 0', background: '#eef6f9' }}>
        <div className="container">
          <h2 className="section-title">💼 Offres d'emploi</h2>
          <p className="section-sub">Rejoignez notre équipe d'excellence</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            {jobs.length === 0 ? (
              <p>Aucune offre disponible pour le moment.</p>
            ) : (
              jobs.map(job => (
                <div key={job.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flex: '1 1 calc(33.33% - 1.5rem)', minWidth: '250px' }}>
                  <h3>{escapeHtml(job.title)}</h3>
                  <p><strong>Département :</strong> {escapeHtml(job.department)}</p>
                  <p><strong>Contrat :</strong> {escapeHtml(job.contract_type || 'Non spécifié')}</p>
                  <p><strong>Localisation :</strong> {escapeHtml(job.location || '')}</p>
                  <p style={{ color: '#0b6e8f', fontWeight: 'bold' }}>{escapeHtml(job.salary_range || '')}</p>
                  <Link to="/jobs" style={{ color: '#0b6e8f', textDecoration: 'underline' }}>Voir l'offre complète →</Link>
                </div>
              ))
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/jobs" className="btn-primary">Voir toutes nos offres</Link>
          </div>
        </div>
      </section>

      {/* Actualités */}
      <section style={{ padding: '3rem 0', background: '#f9fcfd' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'left' }}>📰 Actualités & communiqués MCE</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ flex: 2, minWidth: '260px' }}>
              <div className="news-grid">
                {actualites.length === 0 ? <p>Chargement des actualités...</p> : actualites.map(a => (
                  <div key={a.id} className="news-item">
                    {a.image_url ? (
                      <img src={`${API_BASE.replace('/api', '')}${a.image_url}`} className="news-img" alt={a.titre} onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="news-img"><i className="fas fa-newspaper"></i></div>
                    )}
                    <div className="news-content">
                      <h3>{escapeHtml(a.titre)}</h3>
                      <p>{escapeHtml(a.description)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, background: 'white', borderRadius: '1.5rem', padding: '1.5rem' }}>
              <h3>Restez informé</h3>
              <form id="newsletterForm" onSubmit={handleNewsletterSubmit}>
                <input type="email" id="newsEmail" placeholder="Votre email" required />
                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>S'inscrire</button>
                <div id="newsletterFeedback" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }} dangerouslySetInnerHTML={{ __html: newsletterFeedback }}></div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Établissement */}
      <section style={{ padding: '4rem 0', background: '#f0f7fc' }}>
        <div className="container">
          <h2 className="section-title">🏥 Notre établissement</h2>
          <p className="section-sub">Découvrez nos infrastructures de pointe</p>
          <div className="etablissement-grid">
            {etablissement.length === 0 ? <p>Chargement des photos...</p> : etablissement.map(p => (
              <div key={p.id} className="etablissement-card">
                <img src={`${API_BASE.replace('/api', '')}${p.image_url}`} alt={escapeHtml(p.titre)} />
                <div className="content">
                  <h3>{escapeHtml(p.titre)}</h3>
                  <p>{escapeHtml(p.description || '')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partenaires */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 className="section-title">🤝 Nos partenaires</h2>
          <p className="section-sub">Ils nous font confiance et contribuent à notre excellence</p>
          <div className="partenaires-grid">
            {partenaires.length === 0 ? <p>Chargement des partenaires...</p> : partenaires.map(p => (
              <div key={p.id} className="partenaire-card">
                {p.image_url ? (
                  <img src={`${API_BASE.replace('/api', '')}${p.image_url}`} alt={escapeHtml(p.nom)} onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div style={{ width: '100%', height: '100px', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                    <i className="fas fa-building" style={{ fontSize: '2rem', color: '#adb5bd' }}></i>
                  </div>
                )}
                <h4>{escapeHtml(p.nom)}</h4>
                <p>{escapeHtml(p.description || '')}</p>
                <div className="commentaire">💬 {escapeHtml(p.commentaire || '')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rendez-vous */}
      <section id="appointment">
        <div className="container">
          <h2 className="section-title">Prenez rendez-vous au MCE en un clic</h2>
          <div className="appointment-form">
            <form id="appointmentForm" onSubmit={handleAppointmentSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Nom complet</label><input type="text" name="fullname" required /></div>
                <div className="form-group"><label>Email</label><input type="email" name="email" required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Téléphone</label><input type="tel" name="phone" /></div>
                <div className="form-group"><label>Spécialité (facultatif)</label><input type="text" name="specialty" /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Médecin</label>
                  <select name="doctorId" required onChange={(e) => setSelectedDoctor(e.target.value)}>
                    <option value="">Sélectionnez un médecin</option>
                    {doctors.filter(m => m.profession === 'Médecin').map(d => (
                      <option key={d.id} value={d.id}>{d.full_name} ({d.specialty || d.profession})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group"><label>Date</label><input type="date" name="date" required onChange={(e) => setSelectedDate(e.target.value)} /></div>
                <div className="form-group">
                  <label>Créneau horaire</label>
                  <select name="time" required>
                    {availableSlots.length === 0 ? <option>Sélectionnez médecin et date</option> : availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Message</label><textarea name="message" rows="2"></textarea></div>
              <button type="submit" className="btn-submit">Confirmer</button>
            </form>
            <div id="formFeedback" dangerouslySetInnerHTML={{ __html: formFeedback }}></div>
          </div>
        </div>
      </section>

      {/* ========== SECTION PAIEMENT AVEC UPLOAD DE PREUVE ========== */}
      <section style={{ padding: '4rem 0', background: 'url(/uploads/payer.jpg) center/cover no-repeat', position: 'relative' }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="section-title">💳 Payer des soins hospitaliers</h2>
          <p className="section-sub">Réglez vos prestations en ligne par Mobile Money ou Carte bancaire</p>
          <div className="payment-layout">
            <div className="payment-left">
              <div className="info-card" onClick={() => { loadTarifsContent(); setTarifsModalActive(true); }} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                <i className="fas fa-file-invoice-dollar" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                <h3 style={{ margin: '0.5rem 0' }}>Comprendre les frais hospitaliers</h3>
                <p>Consultez les tarifs des prestations</p>
                <span className="btn-secondary" style={{ display: 'inline-block', marginTop: '0.5rem' }}>En savoir plus →</span>
              </div>
              <div className="info-card" onClick={() => { loadPaiementFactureContent(); setPaiementFactureModalActive(true); }} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                <i className="fas fa-receipt" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                <h3 style={{ margin: '0.5rem 0' }}>Payer une facture</h3>
                <p>Réglez votre facture en ligne</p>
                <span className="btn-secondary" style={{ display: 'inline-block', marginTop: '0.5rem' }}>En savoir plus →</span>
              </div>
            </div>
            <div className="payment-right">
              {/* Coordonnées bancaires */}
              <div id="paymentConfig" style={{ marginBottom: '1rem', fontSize: '0.9rem', background: '#f0f7fc', borderRadius: '0.8rem', padding: '0.5rem' }}>
                <p><strong>🏦 Coordonnées bancaires :</strong><br />{escapeHtml(paymentConfig.titulaire || '')}<br />IBAN: {escapeHtml(paymentConfig.iban || '')}<br />BIC: {escapeHtml(paymentConfig.bic || '')}</p>
                <p><strong>📱 Mobile Money :</strong> {escapeHtml(paymentConfig.mobile_money_info || '')}</p>
                <p><strong>💳 Carte :</strong> {escapeHtml(paymentConfig.carte_info || '')}</p>
              </div>

              {/* Formulaire de paiement manuel avec upload */}
              <form id="paymentForm" onSubmit={handlePaymentSubmit} encType="multipart/form-data">
                <div className="form-group">
                  <label>Nom complet *</label>
                  <input type="text" name="nom" required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" required />
                </div>
                <div className="form-group">
                  <label>Montant (€) *</label>
                  <input type="number" name="montant" step="0.01" min="1" required />
                </div>
                <div className="form-group">
                  <label>Mode de paiement *</label>
                  <select name="methode" id="payMethode" required>
                    <option value="virement">🏦 Virement bancaire</option>
                    <option value="mobile_money">📱 Mobile Money (Orange, MTN)</option>
                  </select>
                </div>
                <div className="form-group" id="telephoneGroup" style={{ display: 'none' }}>
                  <label>Téléphone (Mobile Money)</label>
                  <input type="tel" name="telephone" placeholder="+243 XX XX XX XX" />
                </div>
                <div className="form-group">
                  <label>Preuve de paiement (facture, bordereau) *</label>
                  <input type="file" name="preuve" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" required />
                  <small>Formats acceptés : PDF, JPG, PNG, Word – max 10 Mo</small>
                </div>
                <div className="form-group">
                  <label>Commentaire (facultatif)</label>
                  <textarea name="commentaire" rows="2"></textarea>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Envoyer ma demande de paiement</button>
                <div id="paymentFeedback" style={{ marginTop: '1rem', fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: paymentFeedback }}></div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ========== NOUS SOUTENIR – avec vidéo en arrière‑plan ========== */}
      <section
        style={{
          position: 'relative',
          padding: '5rem 0',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={() => window.location.href = '/support'}
      >
        {/* Vidéo en arrière‑plan */}
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
          <source src="/videos/video11.mp4" type="video/mp4" />
        </video>

        {/* Overlay sombre */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1
          }}
        ></div>

        {/* Contenu */}
        <div
          className="container"
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            background: 'rgba(0,0,0,0.65)',
            color: 'white',
            borderRadius: '2rem',
            padding: '3rem 2rem',
            backdropFilter: 'blur(2px)'
          }}
        >
          <i className="fas fa-heart" style={{ fontSize: '3rem', color: '#ff9f1c', marginBottom: '1rem', display: 'inline-block' }}></i>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Soutenez Medical Center Elizabeth</h2>
          <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 2rem auto', lineHeight: '1.5' }}>
            Votre générosité nous aide à innover, à équiper nos services de technologies de pointe et à offrir des soins d'excellence à tous.
          </p>
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <span className="btn-primary" style={{ background: '#ff9f1c', borderColor: '#ff9f1c', color: '#1e2a3a', fontWeight: 'bold', boxShadow: 'none' }}>🤝 Je fais un don</span>
            <span className="btn-secondary" style={{ background: 'rgba(255,255,255,0.9)', color: '#1e2a3a' }}>En savoir plus</span>
          </div>
          <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}><i className="fas fa-lock"></i> Paiement 100% sécurisé – Reçu fiscal</p>
        </div>
      </section>

      {/* Modales */}
      <div className={`modal ${tarifsModalActive ? 'active' : ''}`} onClick={() => setTarifsModalActive(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <span className="close-modal" onClick={() => setTarifsModalActive(false)}>&times;</span>
          <div dangerouslySetInnerHTML={{ __html: tarifsContent }}></div>
        </div>
      </div>
      
      <div className={`modal ${paiementFactureModalActive ? 'active' : ''}`} onClick={() => setPaiementFactureModalActive(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <span className="close-modal" onClick={() => setPaiementFactureModalActive(false)}>&times;</span>
          <div dangerouslySetInnerHTML={{ __html: paiementFactureContent }}></div>
        </div>
      </div>

      <FloatingChat />
    </>
  );
}

export default Accueil;
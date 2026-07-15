// src/pages/Jobs.jsx
import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour la modale de candidature
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
    cvFile: null
  });
  const [uploading, setUploading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      // ✅ CORRECTION ICI : utiliser /public-jobs au lieu de /jobs
      const res = await fetch(`${API_BASE}/public-jobs`);
      if (!res.ok) {
        if (res.status === 404) {
          setJobs([]);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Erreur chargement offres:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      message: '',
      cvFile: null
    });
    setSubmitStatus({ type: '', message: '' });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, cvFile: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.cvFile) {
      setSubmitStatus({ type: 'error', message: 'Veuillez remplir tous les champs obligatoires (*)' });
      return;
    }

    setUploading(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // 1. Upload du CV
      const cvFormData = new FormData();
      cvFormData.append('cv', formData.cvFile);
      const uploadRes = await fetch(`${API_BASE}/upload/cv`, { method: 'POST', body: cvFormData });
      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur upload CV');
      }
      const uploadData = await uploadRes.json();
      const cvUrl = uploadData.cvUrl;

      // 2. Envoi de la candidature
      const applicationData = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || '',
        message: formData.message || '',
        cvUrl: cvUrl
      };
      const appRes = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });
      if (!appRes.ok) {
        const errorData = await appRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur envoi candidature');
      }
      const appData = await appRes.json();

      setSubmitStatus({ type: 'success', message: '✅ Candidature envoyée avec succès ! Nous vous répondrons rapidement.' });
      setTimeout(() => {
        setShowModal(false);
        setSubmitStatus({ type: '', message: '' });
      }, 2000);
    } catch (err) {
      console.error(err);
      setSubmitStatus({ type: 'error', message: `❌ ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]);
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <p>Chargement des offres...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ===== SECTION EN-TÊTE AVEC VIDÉO EN ARRIÈRE-PLAN ===== */}
      <div style={styles.headerWrapper}>
        <video
          autoPlay
          muted
          loop
          playsInline
          style={styles.videoBackground}
        >
          <source src="/video6.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>
        <div style={styles.overlay}></div>
        <div style={styles.header}>
          <h1 style={styles.title}>
            💼 Rejoignez l’excellence du <span style={{ color: '#2ec4b6' }}>Medical Center Elizabeth</span>
          </h1>
          <p style={styles.subtitle}>
            Des métiers qui ont du sens, <span style={{ color: '#e63946' }}>des équipes à la pointe</span>, un cadre d’exception.
          </p>
          <div style={styles.redAccent}></div>
        </div>
      </div>
      {/* ===== FIN EN-TÊTE ===== */}

      {/* Grille des offres */}
      <div style={styles.grid}>
        {jobs.length === 0 ? (
          <p style={styles.noOffers}>Aucune offre d’emploi pour le moment. Revenez bientôt !</p>
        ) : (
          jobs.map((job, index) => (
            <div 
              key={job.id} 
              className="job-card"
              style={{
                ...styles.card,
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.jobTitle}>{job.title}</h3>
                <span style={styles.contract}>{job.contract_type}</span>
              </div>
              <div style={styles.details}>
                <p><strong>🏢 Département :</strong> {job.department}</p>
                <p><strong>📍 Localisation :</strong> {job.location}</p>
                {job.salary_range && <p><strong>💰 Salaire :</strong> {job.salary_range}</p>}
                {job.deadline && <p><strong>📅 Date limite :</strong> {new Date(job.deadline).toLocaleDateString()}</p>}
              </div>
              <div style={styles.description}>
                <p><strong>📋 Description :</strong></p>
                <p>{job.description}</p>
                <p><strong>🎯 Prérequis :</strong></p>
                <p>{job.requirements}</p>
              </div>
              <button 
                className="apply-btn"
                style={styles.button}
                onClick={() => handleApplyClick(job)}
              >
                Postuler maintenant →
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODALE DE CANDIDATURE */}
      {showModal && selectedJob && (
        <div style={styles.modalOverlay} onClick={() => !uploading && setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>📄 Candidature pour : {selectedJob.title}</h3>
              <button style={styles.closeBtn} onClick={() => !uploading && setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label>Nom complet *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
              </div>
              <div style={styles.formGroup}>
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div style={styles.formGroup}>
                <label>Téléphone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div style={styles.formGroup}>
                <label>Message (lettre de motivation)</label>
                <textarea name="message" rows="4" value={formData.message} onChange={handleInputChange}></textarea>
              </div>
              <div style={styles.formGroup}>
                <label>CV (PDF, DOC, DOCX) *</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
                <small>Formats acceptés : PDF, Word – max 5 Mo</small>
              </div>
              {submitStatus.message && (
                <div style={submitStatus.type === 'success' ? styles.successMsg : styles.errorMsg}>
                  {submitStatus.message}
                </div>
              )}
              <button type="submit" style={styles.submitBtn} disabled={uploading}>
                {uploading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #e9ecef;
          border-top: 5px solid #0b6e8f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .job-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .job-card:hover { transform: translateY(-8px); box-shadow: 0 20px 30px -12px rgba(0, 0, 0, 0.15); }
        .apply-btn { transition: all 0.2s ease; }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '0 1.5rem 2rem',
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    background: 'linear-gradient(135deg, #f8fafc 0%, #f0f7fc 100%)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  headerWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '0 0 32px 32px',
    marginBottom: '3rem',
    marginTop: '1rem',
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    zIndex: 1,
  },
  header: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '5rem 1rem',
    background: 'transparent',
    boxShadow: 'none',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: 'white',
    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.95)',
    maxWidth: '700px',
    margin: '0 auto',
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  },
  redAccent: {
    width: '80px',
    height: '4px',
    background: '#e63946',
    margin: '1rem auto 0',
    borderRadius: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '2rem',
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
  card: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '24px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '1px solid rgba(46, 196, 182, 0.2)',
    backdropFilter: 'blur(4px)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #eef2f6',
    paddingBottom: '0.75rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  jobTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#0b6e8f',
    margin: 0,
  },
  contract: {
    background: '#2ec4b6',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  details: {
    fontSize: '0.9rem',
    color: '#2c3e50',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  description: {
    fontSize: '0.9rem',
    color: '#4a627a',
    marginTop: '0.5rem',
    borderTop: '1px solid #e9ecef',
    paddingTop: '1rem',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#0b6e8f',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    background: 'white',
    borderRadius: '28px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #e9ecef',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.8rem',
    cursor: 'pointer',
    color: '#6c757d',
  },
  formGroup: {
    marginBottom: '1.2rem',
    textAlign: 'left',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: '#0b6e8f',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  successMsg: {
    background: '#d4edda',
    color: '#155724',
    padding: '0.75rem',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  errorMsg: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    fontFamily: 'sans-serif',
    color: '#0b6e8f',
  },
  noOffers: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#6c757d',
    gridColumn: '1 / -1',
    padding: '2rem',
  },
};

export default Jobs;
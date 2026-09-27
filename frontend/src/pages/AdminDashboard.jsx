import { getImageUrl } from '../utils/media';
/* eslint-disable */
// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
// On retire '/api' pour obtenir la base des fichiers statiques (uploads)
const MEDIA_BASE = API_BASE.replace('/api', '');

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("rdv");
    const [selectedPage, setSelectedPage] = useState("home");
    
    // Ã‰tats pour les donnÃ©es (existants)
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [events, setEvents] = useState([]);
    const [actualites, setActualites] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [etablissement, setEtablissement] = useState([]);
    const [partenaires, setPartenaires] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [availabilities, setAvailabilities] = useState([]);
    const [calendarData, setCalendarData] = useState([]);
    const [stats, setStats] = useState({ total: { total: 0 }, perDay: [], perDoctor: [] });
    const [tarifs, setTarifs] = useState([]);
    const [paiements, setPaiements] = useState([]);
    const [pendingResults, setPendingResults] = useState([]);
    const [patients, setPatients] = useState([]);
    const [newsletterCount, setNewsletterCount] = useState(0);
    const [siteContent, setSiteContent] = useState({});
    const [footerContent, setFooterContent] = useState({});
    const [paymentConfig, setPaymentConfig] = useState({});
    const [paiementsManuels, setPaiementsManuels] = useState([]);
    const [messages, setMessages] = useState([]);

    // Nouveaux Ã©tats pour les salles de rÃ©union (admin)
    const [rooms, setRooms] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [roomForm, setRoomForm] = useState({ name: '', capacity: '', equipment: '', has_video: false });
    const [editingRoom, setEditingRoom] = useState(null);
    const [roomsFeedback, setRoomsFeedback] = useState('');

    // Nouveaux Ã©tats pour le personnel hospitalier
    const [staffList, setStaffList] = useState([]);
    const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'staff' });
    const [editingStaff, setEditingStaff] = useState(null);
    const [staffFeedback, setStaffFeedback] = useState('');

    // â­ Nouveaux Ã©tats pour le Jour d'ouverture
    const [jourOuverture, setJourOuverture] = useState([]);
    const [jourForm, setJourForm] = useState({
        type: 'photo',
        titre: '',
        description: '',
        ordre: 0,
        active: true
    });
    const [editingJour, setEditingJour] = useState(null);
    const [jourFeedback, setJourFeedback] = useState('');
    const [jourPreview, setJourPreview] = useState(null);

    // Ã‰tat pour les informations patients
    const [infoPatientsContent, setInfoPatientsContent] = useState({
        horaires: '',
        repas: '',
        parking: '',
        regles: '',
        contact: ''
    });
    const [infoPatientsLoading, setInfoPatientsLoading] = useState(false);

    // Ã‰tats pour les formulaires et modales (existants)
    const [showJobForm, setShowJobForm] = useState(false);
    const [showEventForm, setShowEventForm] = useState(false);
    const [showSpecialtyForm, setShowSpecialtyForm] = useState(false);
    const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
    const [showPatientForm, setShowPatientForm] = useState(false);
    const [showActuForm, setShowActuForm] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [photoPreview, setPhotoPreview] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    
    // Ã‰tats pour l'Ã©dition (existants)
    const [editingPatient, setEditingPatient] = useState(null);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [editingActu, setEditingActu] = useState(null);
    const [editingEtablissement, setEditingEtablissement] = useState(null);
    const [editingPartenaire, setEditingPartenaire] = useState(null);
    
    // PrÃ©visualisations pour les modales d'Ã©dition
    const [editPhotoPreview, setEditPhotoPreview] = useState(null);
    const [editActuPreview, setEditActuPreview] = useState(null);
    const [editEtabPreview, setEditEtabPreview] = useState(null);
    const [editPartPreview, setEditPartPreview] = useState(null);
    
    // Fonctions utilitaires
    function escapeHtml(str) {
        if (!str) return "";
        return str.replace(/[&<>]/g, m => m === "&" ? "&amp;" : m === "<" ? "&lt;" : "&gt;");
    }
    
    function showSuccess(message) {
        setSuccessMsg(message);
        setTimeout(() => setSuccessMsg(""), 3000);
    }
    
    // ========== CHARGEMENT DES DONNÃ‰ES (existantes) ==========
    const loadAppointments = async () => {
        try {
            const res = await fetch(`${API_BASE}/appointments?_=${Date.now()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setAppointments(data);
        } catch (err) { console.error('loadAppointments:', err); }
    };
    
    const loadDoctors = async () => {
        try {
            const res = await fetch(`${API_BASE}/staff`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setDoctors(data);
        } catch (err) { console.error('loadDoctors:', err); }
    };
    
    const loadEvents = async () => {
        try {
            const res = await fetch(`${API_BASE}/events`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setEvents(data);
        } catch (err) { console.error('loadEvents:', err); }
    };
    
    const loadActualites = async () => {
        try {
            const res = await fetch(`${API_BASE}/actualites`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setActualites(data);
        } catch (err) { console.error('loadActualites:', err); }
    };
    
    const loadSpecialties = async () => {
        try {
            const res = await fetch(`${API_BASE}/specialties`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setSpecialties(data);
        } catch (err) { console.error('loadSpecialties:', err); }
    };
    
    const loadEtablissement = async () => {
        try {
            const res = await fetch(`${API_BASE}/etablissement`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setEtablissement(data);
        } catch (err) { console.error('loadEtablissement:', err); }
    };
    
    const loadPartenaires = async () => {
        try {
            const res = await fetch(`${API_BASE}/partenaires`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setPartenaires(data);
        } catch (err) { console.error('loadPartenaires:', err); }
    };
    
    const loadJobs = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/jobs`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setJobs(data);
        } catch (err) { console.error('loadJobs:', err); }
    };
    
    const loadApplications = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/applications`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setApplications(data);
        } catch (err) { console.error('loadApplications:', err); }
    };
    
    const loadAvailabilities = async () => {
        try {
            const res = await fetch(`${API_BASE}/availability/calendar?_=${Date.now()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setAvailabilities(data);
                const grouped = {};
                data.forEach(item => {
                    if (!grouped[item.date]) grouped[item.date] = [];
                    grouped[item.date].push(item);
                });
                const calArray = Object.keys(grouped).sort().map(date => ({ date, slots: grouped[date] }));
                setCalendarData(calArray);
            }
        } catch (err) { console.error('loadAvailabilities:', err); }
    };
    
    const loadTarifs = async () => {
        try {
            const res = await fetch(`${API_BASE}/tarifs`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setTarifs(data);
        } catch (err) { console.error('loadTarifs:', err); }
    };
    
    const loadPaiements = async () => {
        try {
            const res = await fetch(`${API_BASE}/paiements`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setPaiements(data);
        } catch (err) { console.error('loadPaiements:', err); }
    };
    
    const loadPendingResults = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/results/pending`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setPendingResults(data);
        } catch (err) { console.error('loadPendingResults:', err); }
    };
    
    const loadPatients = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/patients`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setPatients(data);
        } catch (err) { console.error('loadPatients:', err); }
    };
    
    const loadNewsletterStats = async () => {
        try {
            const res = await fetch(`${API_BASE}/newsletter/count`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setNewsletterCount(data.count || 0);
        } catch (err) { console.error('loadNewsletterStats:', err); }
    };
    
    const loadStats = async () => {
        try {
            const res = await fetch(`${API_BASE}/stats`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setStats({
                total: data.total || { total: 0 },
                perDay: data.perDay || [],
                perDoctor: data.perDoctor || []
            });
        } catch (err) {
            console.error('loadStats:', err);
            setStats({ total: { total: 0 }, perDay: [], perDoctor: [] });
        }
    };
    
    const loadFooterContent = async () => {
        try {
            const res = await fetch(`${API_BASE}/site-content/footer`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.contenu) {
                try {
                    setFooterContent(JSON.parse(data.contenu));
                } catch {
                    setFooterContent(data);
                }
            } else {
                setFooterContent(data);
            }
        } catch (err) { console.error('loadFooterContent:', err); }
    };
    
    const loadPaymentConfig = async () => {
        try {
            const res = await fetch(`${API_BASE}/paiement/config`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setPaymentConfig(data);
        } catch (err) { console.error('loadPaymentConfig:', err); }
    };
    
    const loadPaiementsManuels = async () => {
        try {
            const res = await fetch(`${API_BASE}/paiement/manuels`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setPaiementsManuels(data);
        } catch (err) {
            console.error('loadPaiementsManuels:', err);
            setPaiementsManuels([]);
        }
    };
    
    const loadContent = async (page) => {
        try {
            const res = await fetch(`${API_BASE}/site-content/${page}`);
            if (!res.ok) {
                if (res.status === 404) {
                    setSiteContent({});
                    return;
                }
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await res.json();
            if (data.contenu) {
                try {
                    setSiteContent(JSON.parse(data.contenu));
                } catch {
                    setSiteContent({ contenu: data.contenu });
                }
            } else {
                setSiteContent(data);
            }
        } catch (err) { console.error('loadContent:', err); }
    };
    
    const loadDoctorsForSelect = async () => {
        try {
            const res = await fetch(`${API_BASE}/staff`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) setDoctors(data);
        } catch (err) { console.error('loadDoctorsForSelect:', err); }
    };
    
    const loadSlots = async (doctorId, date) => {
        if (!doctorId || !date) { setAvailableSlots([]); return; }
        try {
            const res = await fetch(`${API_BASE}/availability/${doctorId}/${date}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const slots = await res.json();
            if (Array.isArray(slots)) setAvailableSlots(slots);
            else setAvailableSlots([]);
        } catch (err) { console.error('loadSlots:', err); setAvailableSlots([]); }
    };
    
    const loadMessages = async () => {
        try {
            const res = await fetch(`${API_BASE}/messages`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('loadMessages:', err);
            setMessages([]);
        }
    };
    
    // ========== CHARGEMENT DES NOUVELLES DONNÃ‰ES ==========
    const loadRooms = async () => {
        try {
            const res = await fetch(`${API_BASE}/meeting-rooms`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setRooms(data);
        } catch (err) {
            console.error('loadRooms:', err);
        }
    };

    const loadAllBookings = async () => {
        try {
            const res = await fetch(`${API_BASE}/meeting-rooms/bookings/all`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setAllBookings(data);
        } catch (err) {
            console.error('loadAllBookings:', err);
        }
    };

    const loadStaffList = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/staff`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setStaffList(data);
        } catch (err) {
            console.error('loadStaffList:', err);
        }
    };

    // â­ CHARGEMENT JOUR D'OUVERTURE (version ADMIN = /all)
    const loadJourOuverture = async () => {
        try {
            const res = await fetch(`${API_BASE}/jour-ouverture/all`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setJourOuverture(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('loadJourOuverture:', err);
            setJourOuverture([]);
        }
    };

    // ========== INFOS PATIENTS ==========
    const loadInfoPatients = async () => {
        setInfoPatientsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/site-content/info`);
            if (res.ok) {
                const data = await res.json();
                if (data.contenu) {
                    try {
                        const parsed = JSON.parse(data.contenu);
                        setInfoPatientsContent(parsed);
                    } catch {
                        setInfoPatientsContent(data);
                    }
                }
            }
        } catch (err) {
            console.error('loadInfoPatients error:', err);
        } finally {
            setInfoPatientsLoading(false);
        }
    };

    const saveInfoPatients = async () => {
        try {
            const res = await fetch(`${API_BASE}/site-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'info',
                    contenu: JSON.stringify(infoPatientsContent)
                })
            });
            if (res.ok) {
                showSuccess('âœ… Informations patients mises Ã  jour');
                loadInfoPatients();
            } else {
                alert('âŒ Erreur');
            }
        } catch (err) {
            console.error('saveInfoPatients error:', err);
        }
    };

    // ========== GESTION DES SALLES (Admin) ==========
    const createRoom = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/meeting-rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...roomForm, capacity: parseInt(roomForm.capacity) }),
            });
            if (!res.ok) throw new Error('Erreur crÃ©ation');
            setRoomsFeedback('âœ… Salle crÃ©Ã©e');
            setRoomForm({ name: '', capacity: '', equipment: '', has_video: false });
            loadRooms();
        } catch (err) {
            setRoomsFeedback(`âŒ ${err.message}`);
        }
    };

    const updateRoom = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/meeting-rooms/${editingRoom.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...roomForm, capacity: parseInt(roomForm.capacity) }),
            });
            if (!res.ok) throw new Error('Erreur mise Ã  jour');
            setRoomsFeedback('âœ… Salle mise Ã  jour');
            setEditingRoom(null);
            setRoomForm({ name: '', capacity: '', equipment: '', has_video: false });
            loadRooms();
        } catch (err) {
            setRoomsFeedback(`âŒ ${err.message}`);
        }
    };

    const deleteRoom = async (id) => {
        if (!window.confirm('Supprimer cette salle ?')) return;
        try {
            const res = await fetch(`${API_BASE}/meeting-rooms/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erreur suppression');
            setRoomsFeedback('âœ… Salle supprimÃ©e');
            loadRooms();
        } catch (err) {
            setRoomsFeedback(`âŒ ${err.message}`);
        }
    };

    // ========== GESTION DU PERSONNEL ==========
    const createStaff = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/admin/staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffForm),
            });
            if (!res.ok) throw new Error('Erreur crÃ©ation');
            setStaffFeedback('âœ… Personnel ajoutÃ©');
            setStaffForm({ name: '', email: '', password: '', role: 'staff' });
            loadStaffList();
        } catch (err) {
            setStaffFeedback(`âŒ ${err.message}`);
        }
    };

    const updateStaff = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/admin/staff/${editingStaff.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffForm),
            });
            if (!res.ok) throw new Error('Erreur mise Ã  jour');
            setStaffFeedback('âœ… Personnel mis Ã  jour');
            setEditingStaff(null);
            setStaffForm({ name: '', email: '', password: '', role: 'staff' });
            loadStaffList();
        } catch (err) {
            setStaffFeedback(`âŒ ${err.message}`);
        }
    };

    const deleteStaff = async (id) => {
        if (!window.confirm('Supprimer ce compte ?')) return;
        try {
            const res = await fetch(`${API_BASE}/admin/staff/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Erreur suppression');
            setStaffFeedback('âœ… Personnel supprimÃ©');
            loadStaffList();
        } catch (err) {
            setStaffFeedback(`âŒ ${err.message}`);
        }
    };

    // â­ GESTION JOUR D'OUVERTURE ==========
    const uploadMediaFile = async (file) => {
        const fd = new FormData();
        fd.append("image", file);
        const uploadRes = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        return uploadData.imageUrl || null;
    };

    const addJourOuverture = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const type = formData.get("type");
        const titre = formData.get("titre");
        const description = formData.get("description");
        const ordre = parseInt(formData.get("ordre") || 0);
        const active = formData.get("active") === "on";
        const fileField = type === 'video' ? 'videoFile' : 'imageFile';
        const file = formData.get(fileField);

        if (!file || file.size === 0) {
            setJourFeedback('âŒ Fichier requis');
            return;
        }

        setJourFeedback('â³ Upload en cours...');
        try {
            const url = await uploadMediaFile(file);
            if (!url) { setJourFeedback('âŒ Erreur upload'); return; }

            const payload = { type, titre, description, url, ordre, active };
            const res = await fetch(`${API_BASE}/jour-ouverture`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setJourFeedback('âœ… MÃ©dia ajoutÃ©');
                loadJourOuverture();
                e.target.reset();
                setJourPreview(null);
                setJourForm({ type: 'photo', titre: '', description: '', ordre: 0, active: true });
            } else {
                setJourFeedback('âŒ Erreur ajout');
            }
        } catch (err) {
            console.error('addJourOuverture:', err);
            setJourFeedback('âŒ Erreur rÃ©seau');
        }
    };

    const updateJourOuverture = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const type = formData.get("type");
        const titre = formData.get("titre");
        const description = formData.get("description");
        const ordre = parseInt(formData.get("ordre") || 0);
        const active = formData.get("active") === "on";

        let url = editingJour.url;
        const fileField = type === 'video' ? 'videoFile' : 'imageFile';
        const file = formData.get(fileField);

        if (file && file.size > 0) {
            setJourFeedback('â³ Upload en cours...');
            const newUrl = await uploadMediaFile(file);
            if (!newUrl) { setJourFeedback('âŒ Erreur upload'); return; }
            url = newUrl;
        }

        const payload = { type, titre, description, url, ordre, active };
        try {
            const res = await fetch(`${API_BASE}/jour-ouverture/${editingJour.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setJourFeedback('âœ… MÃ©dia mis Ã  jour');
                loadJourOuverture();
                setEditingJour(null);
                setJourPreview(null);
            } else {
                setJourFeedback('âŒ Erreur mise Ã  jour');
            }
        } catch (err) {
            console.error('updateJourOuverture:', err);
            setJourFeedback('âŒ Erreur rÃ©seau');
        }
    };

    const deleteJourOuverture = async (id) => {
        if (!window.confirm("Supprimer ce mÃ©dia ?")) return;
        try {
            const res = await fetch(`${API_BASE}/jour-ouverture/${id}`, { method: "DELETE" });
            if (res.ok) {
                showSuccess("MÃ©dia supprimÃ©");
                loadJourOuverture();
            }
        } catch (err) {
            console.error('deleteJourOuverture:', err);
        }
    };
    
    // ========== SUPPRESSIONS (existantes) ==========
    const deleteAppointment = async (id) => {
        if (!window.confirm("Supprimer ce rendez-vous ?")) return;
        try {
            const res = await fetch(`${API_BASE}/appointments/${id}`, { method: "DELETE" });
            if (res.ok) { showSuccess("Rendez-vous supprimÃ©"); loadAppointments(); }
        } catch (err) { console.error('deleteAppointment:', err); }
    };
    
    const deleteDoctor = async (id) => {
        if (!window.confirm("Supprimer ce mÃ©decin ?")) return;
        try {
            const res = await fetch(`${API_BASE}/staff/${id}`, { method: "DELETE" });
            if (res.ok) { showSuccess("MÃ©decin supprimÃ©"); loadDoctors(); }
        } catch (err) { console.error('deleteDoctor:', err); }
    };
    
    const deleteEvent = async (id) => {
        if (!window.confirm("Supprimer cet Ã©vÃ©nement ?")) return;
        try {
            const res = await fetch(`${API_BASE}/events/${id}`, { method: "DELETE" });
            if (res.ok) { showSuccess("Ã‰vÃ©nement supprimÃ©"); loadEvents(); }
        } catch (err) { console.error('deleteEvent:', err); }
    };
    
    const deleteActualite = async (id) => {
        if (!window.confirm("Supprimer cette actualitÃ© ?")) return;
        try {
            const res = await fetch(`${API_BASE}/actualites/${id}`, { method: "DELETE" });
            if (res.ok) { showSuccess("ActualitÃ© supprimÃ©e"); loadActualites(); }
        } catch (err) { console.error('deleteActualite:', err); }
    };
    
    const deleteSpecialty = async (id) => {
        if (!window.confirm("Supprimer cette spÃ©cialitÃ© ?")) return;
        try {
            const res = await fetch(`${API_BASE}/specialties/${id}`, { method: "DELETE" });
            if (res.ok) { showSuccess("SpÃ©cialitÃ© supprimÃ©e"); loadSpecialties(); }
        } catch (err) { console.error('deleteSpecialty:', err); }
    };
    
    const deleteJob = async (id) => {
        if (!window.confirm("Supprimer cette offre ?")) return;
        try {
            const res = await fetch(`${API_BASE}/admin/jobs/${id}`, { method: "DELETE" });
            if (res.ok) { showSuccess("Offre supprimÃ©e"); loadJobs(); }
        } catch (err) { console.error('deleteJob:', err); }
    };
    
    const deleteTarif = async (id) => {
        if (!window.confirm("Supprimer ce tarif ?")) return;
        try {
            const res = await fetch(`${API_BASE}/tarifs/${id}`, { method: "DELETE" });
            if (res.ok) { showSuccess("Tarif supprimÃ©"); loadTarifs(); }
        } catch (err) { console.error('deleteTarif:', err); }
    };
    
    const deleteAvailability = async (id) => {
        if (!window.confirm("Supprimer ce crÃ©neau ?")) return;
        try {
            const res = await fetch(`${API_BASE}/availabilities/${id}`, { method: "DELETE" });
            if (res.ok) { showSuccess("CrÃ©neau supprimÃ©"); loadAvailabilities(); }
        } catch (err) { console.error('deleteAvailability:', err); }
    };
    
    const deletePatient = async (id) => {
        if (!window.confirm("Supprimer ce patient ?")) return;
        try {
            const res = await fetch(`${API_BASE}/admin/patients/${id}`, { method: "DELETE" });
            if (res.ok) { showSuccess("Patient supprimÃ©"); loadPatients(); }
        } catch (err) { console.error('deletePatient:', err); }
    };
    
    const deleteEtablissement = async (id) => {
        if (!window.confirm("Supprimer cette photo ?")) return;
        try {
            const res = await fetch(`${API_BASE}/etablissement/${id}`, { method: "DELETE" });
            if (res.ok) { showSuccess("Photo supprimÃ©e"); loadEtablissement(); }
        } catch (err) { console.error('deleteEtablissement:', err); }
    };
    
    const deletePartenaire = async (id) => {
        if (!window.confirm("Supprimer ce partenaire ?")) return;
        try {
            const res = await fetch(`${API_BASE}/partenaires/${id}`, { method: "DELETE" });
            if (res.ok) { showSuccess("Partenaire supprimÃ©"); loadPartenaires(); }
        } catch (err) { console.error('deletePartenaire:', err); }
    };
    
    // ========== VALIDATION TÃ‰LÃ‰CONSULTATION ==========
    const validateTeleconsultation = async (id) => {
        if (!window.confirm("Valider cette tÃ©lÃ©consultation ?")) return;
        try {
            const res = await fetch(`${API_BASE}/admin/appointments/${id}/validate-teleconsultation`, { method: "PUT" });
            if (res.ok) {
                showSuccess("TÃ©lÃ©consultation validÃ©e");
                loadAppointments();
            } else alert("Erreur");
        } catch (err) { console.error('validateTeleconsultation:', err); }
    };
    
    // ========== RÃ‰INITIALISATION MOT DE PASSE MÃ‰DECIN ==========
    const resetDoctorPassword = async (id) => {
        const newPassword = window.prompt('Entrez le nouveau mot de passe pour ce mÃ©decin (6 caractÃ¨res min) :');
        if (newPassword === null) return;
        if (!newPassword || newPassword.length < 6) {
            alert('Le mot de passe doit faire au moins 6 caractÃ¨res.');
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/staff/${id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword })
            });
            if (res.ok) {
                showSuccess('âœ… Mot de passe rÃ©initialisÃ© avec succÃ¨s');
            } else {
                const err = await res.json();
                alert('âŒ Erreur : ' + (err.error || 'RÃ©essayez'));
            }
        } catch (err) {
            alert('âŒ Erreur rÃ©seau');
            console.error(err);
        }
    };
    
    // ========== AJOUTS (existants) ==========
    const addJob = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            title: formData.get("title"),
            department: formData.get("department"),
            contract_type: formData.get("contract_type"),
            location: formData.get("location"),
            description: formData.get("description"),
            requirements: formData.get("requirements"),
            salary_range: formData.get("salary_range"),
            active: formData.get("active") === "on" ? 1 : 0
        };
        try {
            const res = await fetch(`${API_BASE}/admin/jobs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            if (res.ok) { showSuccess("Offre ajoutÃ©e"); loadJobs(); setShowJobForm(false); e.target.reset(); }
            else alert("Erreur");
        } catch (err) { console.error('addJob:', err); }
    };
    
    const addEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            title: formData.get("title"),
            description: formData.get("description"),
            start_date: formData.get("start_date"),
            end_date: formData.get("end_date") || null,
            active: formData.get("active") === "on" ? 1 : 0
        };
        try {
            const res = await fetch(`${API_BASE}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                showSuccess("Ã‰vÃ©nement ajoutÃ©");
                loadEvents();
                setShowEventForm(false);
                e.target.reset();
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Erreur lors de l'ajout");
            }
        } catch (err) {
            console.error('addEvent:', err);
        }
    };
    
    const addSpecialty = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get("name"),
            description: formData.get("description"),
            active: formData.get("active") === "on" ? 1 : 0
        };
        try {
            const res = await fetch(`${API_BASE}/specialties`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                showSuccess("SpÃ©cialitÃ© ajoutÃ©e");
                loadSpecialties();
                setShowSpecialtyForm(false);
                e.target.reset();
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Erreur");
            }
        } catch (err) {
            console.error('addSpecialty:', err);
        }
    };
    
    const addPatient = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            first_name: formData.get("first_name"),
            last_name: formData.get("last_name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            password: formData.get("password")
        };
        try {
            const res = await fetch(`${API_BASE}/admin/patients`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            if (res.ok) { showSuccess("Patient ajoutÃ©"); loadPatients(); setShowPatientForm(false); e.target.reset(); }
            else alert("Erreur");
        } catch (err) { console.error('addPatient:', err); }
    };
    
    const addActualite = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const titre = formData.get("titre");
        const description = formData.get("description");
        const active = formData.get("active") === "on" ? 1 : 0;
        const imageFile = formData.get("imageFile");
        let image_url = null;
        if (imageFile && imageFile.size > 0) {
            const fd = new FormData();
            fd.append("image", imageFile);
            try {
                const uploadRes = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
                const uploadData = await uploadRes.json();
                if (uploadData.imageUrl) image_url = uploadData.imageUrl;
                else { alert("Erreur upload"); return; }
            } catch (err) { alert("Erreur rÃ©seau upload"); return; }
        }
        const payload = { titre, description, image_url, active };
        try {
            const res = await fetch(`${API_BASE}/actualites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showSuccess("ActualitÃ© ajoutÃ©e");
                loadActualites();
                setShowActuForm(false);
                e.target.reset();
                setImagePreview("");
            } else {
                alert("Erreur");
            }
        } catch (err) {
            console.error('addActualite:', err);
        }
    };
    
    const addAvailability = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const doctor_id = formData.get("doctor_id");
        const date = formData.get("date");
        const time_slot = formData.get("start_time") + "-" + formData.get("end_time");
        try {
            const res = await fetch(`${API_BASE}/availabilities`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doctor_id, date, time_slot }) });
            if (res.ok) { showSuccess("CrÃ©neau ajoutÃ©"); loadAvailabilities(); setShowAvailabilityForm(false); e.target.reset(); }
            else alert("Erreur");
        } catch (err) { console.error('addAvailability:', err); }
    };
    
    const addTarif = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            service: formData.get("service"),
            prestation: formData.get("prestation"),
            prix: formData.get("prix"),
            description: formData.get("description"),
            active: formData.get("active") === "on" ? 1 : 0
        };
        try {
            const res = await fetch(`${API_BASE}/tarifs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                showSuccess("Tarif ajoutÃ©");
                loadTarifs();
                e.target.reset();
            } else {
                alert("Erreur");
            }
        } catch (err) {
            console.error('addTarif:', err);
        }
    };
    
    const saveContent = async () => {
        try {
            const res = await fetch(`${API_BASE}/site-content`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: selectedPage,
                    contenu: JSON.stringify(siteContent)
                })
            });
            if (res.ok) alert("âœ… Contenu mis Ã  jour !");
            else alert("âŒ Erreur");
        } catch (err) { console.error('saveContent:', err); }
    };
    
    const saveFooter = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updates = {
            etablissement: formData.get("etablissement"),
            adresse: formData.get("adresse"),
            telephone: formData.get("telephone"),
            telephone2: formData.get("telephone2"),
            email: formData.get("email"),
            urgences: formData.get("urgences"),
            liens_aide: formData.get("liens_aide"),
            liens_entreprise: formData.get("liens_entreprise"),
            liens_soignants: formData.get("liens_soignants"),
            liens_specialistes: formData.get("liens_specialistes"),
            liens_recherches: formData.get("liens_recherches"),
            technologies: formData.get("technologies"),
            reseaux: formData.get("reseaux"),
            copyright: formData.get("copyright")
        };
        try {
            const res = await fetch(`${API_BASE}/site-content`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: "footer",
                    contenu: JSON.stringify(updates)
                })
            });
            if (res.ok) { showSuccess("Footer mis Ã  jour !"); loadFooterContent(); }
            else alert("Erreur");
        } catch (err) { console.error('saveFooter:', err); }
    };
    
    const savePaymentConfig = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updates = {
            iban: formData.get("iban"),
            bic: formData.get("bic"),
            titulaire: formData.get("titulaire"),
            mobile_money_info: formData.get("mobile_money_info"),
            carte_info: formData.get("carte_info")
        };
        try {
            const res = await fetch(`${API_BASE}/paiement/config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });
            if (res.ok) { showSuccess("Configuration mise Ã  jour"); loadPaymentConfig(); }
            else alert("Erreur");
        } catch (err) { console.error('savePaymentConfig:', err); }
    };
    
    const sendNewsletter = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const subject = formData.get("subject");
        const content = formData.get("content");
        try {
            const res = await fetch(`${API_BASE}/newsletter/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, content })
            });
            const data = await res.json();
            if (res.ok) alert("Envoi terminÃ© : " + data.successCount + " emails rÃ©ussis.");
            else alert("Erreur");
        } catch (err) { console.error('sendNewsletter:', err); }
    };
    
    const exportEmails = async () => {
        try {
            const res = await fetch(`${API_BASE}/newsletter/export`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.emails && Array.isArray(data.emails)) {
                const blob = new Blob([data.emails.join("\n")], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "abonnes_newsletter.csv";
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) { console.error('exportEmails:', err); }
    };
    
    const publishResult = async (id) => {
        if (!window.confirm("Publier ce rÃ©sultat ?")) return;
        try {
            const res = await fetch(`${API_BASE}/admin/results/${id}/publish`, { method: "PUT" });
            if (res.ok) { showSuccess("RÃ©sultat publiÃ©"); loadPendingResults(); }
        } catch (err) { console.error('publishResult:', err); }
    };
    
    const addResult = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const patient_id = formData.get("patient_id");
        const type = formData.get("type");
        const description = formData.get("description");
        const file_url = formData.get("file_url");
        if (!patient_id || !type) { alert("Veuillez remplir les champs requis"); return; }
        try {
            const res = await fetch(`${API_BASE}/admin/results`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patient_id, type, description, file_url })
            });
            if (res.ok) { showSuccess("RÃ©sultat ajoutÃ©"); e.target.reset(); loadPendingResults(); }
            else alert("Erreur");
        } catch (err) { console.error('addResult:', err); }
    };
    
    const markAppointmentAsViewed = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/admin/appointments/${id}/view`, { method: "PUT" });
            if (res.ok) { showSuccess("Rendez-vous marquÃ© comme vu"); loadAppointments(); }
        } catch (err) { console.error('markAppointmentAsViewed:', err); }
    };
    
    // ========== Ã‰DITIONS (existantes) ==========
    const updatePatient = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            first_name: formData.get("first_name"),
            last_name: formData.get("last_name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            is_active: formData.get("is_active") === "on" ? 1 : 0,
            password: formData.get("password") || undefined
        };
        try {
            const res = await fetch(`${API_BASE}/admin/patients/${editingPatient.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                showSuccess("Patient mis Ã  jour");
                loadPatients();
                setEditingPatient(null);
            } else alert("Erreur");
        } catch (err) { console.error('updatePatient:', err); }
    };
    
    const updateDoctor = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const full_name = formData.get("full_name");
        const specialty = formData.get("specialty");
        const department = formData.get("department");
        const email = formData.get("email");
        const phone = formData.get("phone") || "";
        const password = formData.get("password") || undefined;
        const active = formData.get("active") === "on" ? 1 : 0;
        const telegram_chat_id = formData.get("telegram_chat_id") || null;

        let photo_url = editingDoctor.photo_url;
        const photoFile = formData.get("photo");
        if (photoFile && photoFile.size > 0) {
            const fd = new FormData();
            fd.append("image", photoFile);
            try {
                const uploadRes = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
                const uploadData = await uploadRes.json();
                if (uploadData.imageUrl) {
                    photo_url = uploadData.imageUrl;
                } else {
                    alert("Erreur upload photo : " + (uploadData.error || ""));
                    return;
                }
            } catch (err) {
                alert("Erreur rÃ©seau lors de l'upload");
                console.error(err);
                return;
            }
        }

        const payload = {
            full_name,
            profession: "MÃ©decin",
            specialty,
            department,
            email,
            phone,
            photo_url,
            telegram_chat_id,
            active,
            password
        };

        try {
            const res = await fetch(`${API_BASE}/staff/${editingDoctor.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showSuccess("MÃ©decin mis Ã  jour");
                loadDoctors();
                setEditingDoctor(null);
                setEditPhotoPreview(null);
            } else {
                const errData = await res.json();
                alert("âŒ Erreur : " + (errData.error || res.statusText));
            }
        } catch (err) {
            alert("âŒ Erreur rÃ©seau");
            console.error(err);
        }
    };
    
    const updateActualite = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const titre = formData.get("titre");
        const description = formData.get("description");
        const active = formData.get("active") === "on" ? 1 : 0;
        let image_url = editingActu.image_url;
        const imageFile = formData.get("imageFile");
        if (imageFile && imageFile.size > 0) {
            const fd = new FormData();
            fd.append("image", imageFile);
            try {
                const uploadRes = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
                const uploadData = await uploadRes.json();
                if (uploadData.imageUrl) {
                    image_url = uploadData.imageUrl;
                } else {
                    alert("Erreur upload image : " + (uploadData.error || ""));
                    return;
                }
            } catch (err) {
                alert("Erreur rÃ©seau lors de l'upload");
                console.error(err);
                return;
            }
        }
        const payload = { titre, description, image_url, active };
        try {
            const res = await fetch(`${API_BASE}/actualites/${editingActu.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showSuccess("ActualitÃ© mise Ã  jour");
                loadActualites();
                setEditingActu(null);
                setEditActuPreview(null);
            } else {
                const errData = await res.json();
                alert("âŒ Erreur : " + (errData.error || res.statusText));
            }
        } catch (err) {
            alert("âŒ Erreur rÃ©seau");
            console.error(err);
        }
    };
    
    const updateEtablissement = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const titre = formData.get("titre");
        const description = formData.get("description");
        const active = formData.get("active") === "on" ? 1 : 0;
        let image_url = editingEtablissement.image_url;
        const imageFile = formData.get("imageFile");
        if (imageFile && imageFile.size > 0) {
            const fd = new FormData();
            fd.append("image", imageFile);
            try {
                const uploadRes = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
                const uploadData = await uploadRes.json();
                if (uploadData.imageUrl) {
                    image_url = uploadData.imageUrl;
                } else {
                    alert("Erreur upload image : " + (uploadData.error || ""));
                    return;
                }
            } catch (err) {
                alert("Erreur rÃ©seau lors de l'upload");
                console.error(err);
                return;
            }
        }
        const payload = { titre, description, image_url, active };
        try {
            const res = await fetch(`${API_BASE}/etablissement/${editingEtablissement.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showSuccess("Photo mise Ã  jour");
                loadEtablissement();
                setEditingEtablissement(null);
                setEditEtabPreview(null);
            } else {
                const errData = await res.json();
                alert("âŒ Erreur : " + (errData.error || res.statusText));
            }
        } catch (err) {
            alert("âŒ Erreur rÃ©seau");
            console.error(err);
        }
    };
    
    const updatePartenaire = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const nom = formData.get("nom");
        const description = formData.get("description");
        const commentaire = formData.get("commentaire");
        const active = formData.get("active") === "on" ? 1 : 0;
        let image_url = editingPartenaire.image_url;
        const imageFile = formData.get("imageFile");
        if (imageFile && imageFile.size > 0) {
            const fd = new FormData();
            fd.append("image", imageFile);
            try {
                const uploadRes = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
                const uploadData = await uploadRes.json();
                if (uploadData.imageUrl) {
                    image_url = uploadData.imageUrl;
                } else {
                    alert("Erreur upload image : " + (uploadData.error || ""));
                    return;
                }
            } catch (err) {
                alert("Erreur rÃ©seau lors de l'upload");
                console.error(err);
                return;
            }
        }
        const payload = { nom, description, image_url, commentaire, active };
        try {
            const res = await fetch(`${API_BASE}/partenaires/${editingPartenaire.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showSuccess("Partenaire mis Ã  jour");
                loadPartenaires();
                setEditingPartenaire(null);
                setEditPartPreview(null);
            } else {
                const errData = await res.json();
                alert("âŒ Erreur : " + (errData.error || res.statusText));
            }
        } catch (err) {
            alert("âŒ Erreur rÃ©seau");
            console.error(err);
        }
    };
    
    const togglePatientStatus = async (patient) => {
        const newStatus = patient.is_active ? 0 : 1;
        try {
            const res = await fetch(`${API_BASE}/admin/patients/${patient.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: newStatus })
            });
            if (res.ok) {
                showSuccess(`Patient ${newStatus ? 'activÃ©' : 'dÃ©sactivÃ©'}`);
                loadPatients();
            } else alert("Erreur");
        } catch (err) { console.error('togglePatientStatus:', err); }
    };
    
    // ========== ONGLETS ==========
    const tabs = [
        { id: "rdv", label: "Rendez-vous" },
        { id: "calendar", label: "Calendrier" },
        { id: "applications", label: "Candidatures" },
        { id: "stats", label: "Statistiques" },
        { id: "jobs", label: "Offres d'emploi" },
        { id: "manage", label: "DisponibilitÃ©s" },
        { id: "doctors", label: "MÃ©decins" },
        { id: "events", label: "Ã‰vÃ©nements" },
        { id: "content", label: "Contenu du site" },
        { id: "actualites", label: "ActualitÃ©s" },
        { id: "specialties", label: "SpÃ©cialitÃ©s" },
        { id: "etablissement", label: "Ã‰tablissement" },
        { id: "partenaires", label: "Partenaires" },
        { id: "newsletter", label: "Newsletter" },
        { id: "footer", label: "Footer" },
        { id: "tarifs", label: "Tarifs" },
        { id: "caisse", label: "Caisse" },
        { id: "results", label: "RÃ©sultats labo" },
        { id: "patients", label: "Patients" },
        { id: "paiements-manuels", label: "Paiements manuels" },
        { id: "messages", label: "ðŸ“© Messages" },
        { id: "rooms", label: "ðŸ¢ Salles de rÃ©union" },
        { id: "staff", label: "ðŸ‘¥ Personnel hospitalier" },
        { id: "infos-patients", label: "ðŸ“‹ Infos patients" },
        { id: "jour-ouverture", label: "ðŸŽ‰ Jour d'ouverture" }
    ];
    
    // ========== CHARGEMENT INITIAL ==========
    useEffect(() => {
        loadAppointments();
        loadDoctors();
        loadEvents();
        loadActualites();
        loadSpecialties();
        loadEtablissement();
        loadPartenaires();
        loadJobs();
        loadApplications();
        loadAvailabilities();
        loadTarifs();
        loadPaiements();
        loadPatients();
        loadStats();
        loadFooterContent();
        loadPaymentConfig();
        loadNewsletterStats();
        loadContent("home");
        loadDoctorsForSelect();
        loadPaiementsManuels();
        loadMessages();
        loadRooms();
        loadAllBookings();
        loadStaffList();
        loadInfoPatients();
        loadJourOuverture();
    }, []);
    
    // ========== RECHARGEMENT AU CHANGEMENT D'ONGLET ==========
    useEffect(() => {
        if (activeTab === "manage") { loadAvailabilities(); loadDoctorsForSelect(); }
        if (activeTab === "doctors") loadDoctors();
        if (activeTab === "events") loadEvents();
        if (activeTab === "actualites") loadActualites();
        if (activeTab === "specialties") loadSpecialties();
        if (activeTab === "etablissement") loadEtablissement();
        if (activeTab === "partenaires") loadPartenaires();
        if (activeTab === "footer") loadFooterContent();
        if (activeTab === "newsletter") loadNewsletterStats();
        if (activeTab === "caisse") { loadPaiements(); loadPaymentConfig(); }
        if (activeTab === "results") { loadPendingResults(); loadPatients(); }
        if (activeTab === "patients") loadPatients();
        if (activeTab === "content") loadContent(selectedPage);
        if (activeTab === "jobs") loadJobs();
        if (activeTab === "applications") loadApplications();
        if (activeTab === "stats") loadStats();
        if (activeTab === "calendar") loadAvailabilities();
        if (activeTab === "paiements-manuels") loadPaiementsManuels();
        if (activeTab === "messages") loadMessages();
        if (activeTab === "rooms") { loadRooms(); loadAllBookings(); }
        if (activeTab === "staff") loadStaffList();
        if (activeTab === "infos-patients") loadInfoPatients();
        if (activeTab === "jour-ouverture") loadJourOuverture();
    }, [activeTab]);
    
    // ========== RENDU JSX ==========
    return React.createElement("div", { style: { maxWidth: "1400px", margin: "auto", background: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 8px 20px rgba(0,0,0,0.05)" } },
        React.createElement("h1", { style: { color: "#0b6e8f", borderLeft: "5px solid #2ec4b6", paddingLeft: "20px", marginTop: 0 } }, "ðŸ“‹ Administration Medical Center Elizabeth"),
        successMsg && React.createElement("div", { style: { background: "#28a745", color: "white", padding: "10px", borderRadius: "5px", marginBottom: "20px" } }, successMsg),
        React.createElement("div", { style: { display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #ddd", flexWrap: "wrap" } }, tabs.map(tab => 
            React.createElement("div", { key: tab.id, onClick: () => setActiveTab(tab.id), style: { padding: "10px 20px", cursor: "pointer", background: activeTab === tab.id ? "#0b6e8f" : "#e9ecef", color: activeTab === tab.id ? "white" : "#666", borderRadius: "8px 8px 0 0" } }, tab.label)
        )),
        
        // ===== RENDEZ-VOUS =====
        activeTab === "rdv" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ“‹ Rendez-vous"),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", { style: { padding: "8px" } }, "ID"),
                            React.createElement("th", null, "Nom"),
                            React.createElement("th", null, "Email"),
                            React.createElement("th", null, "Date"),
                            React.createElement("th", null, "Heure"),
                            React.createElement("th", null, "TÃ©lÃ©consultation"),
                            React.createElement("th", null, "Actions")
                        )
                    ),
                    React.createElement("tbody", null, appointments.map(rdv =>
                        React.createElement("tr", { key: rdv.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, rdv.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(rdv.fullname)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(rdv.email)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, rdv.date),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, rdv.time),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } },
                                rdv.teleconsultation_validated ? 
                                    React.createElement("span", { style: { color: "green" } }, "âœ… ValidÃ©e") :
                                    React.createElement("button", { onClick: () => validateTeleconsultation(rdv.id), style: { background: "#ff9f1c", color: "white", border: "none", padding: "4px 8px", borderRadius: "12px", cursor: "pointer" } }, "Valider")
                            ),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, 
                                React.createElement("button", { onClick: () => deleteAppointment(rdv.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸")
                            )
                        )
                    ))
                )
            )
        ),
        
        // ===== CALENDRIER =====
        activeTab === "calendar" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ“… Calendrier des disponibilitÃ©s"),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "15px" } },
                calendarData.map(day => 
                    React.createElement("div", { key: day.date, style: { border: "1px solid #ddd", borderRadius: "8px", padding: "10px", background: "#f8f9fa" } },
                        React.createElement("div", { style: { fontWeight: "bold", background: "#0b6e8f", color: "white", padding: "6px", borderRadius: "6px", marginBottom: "10px", textAlign: "center" } }, day.date),
                        day.slots.map(slot => 
                            React.createElement("div", { key: slot.id, style: { fontSize: "0.85rem", margin: "5px 0", display: "flex", justifyContent: "space-between" } },
                                React.createElement("span", null, escapeHtml(slot.doctor_name), " - ", slot.time_slot),
                                React.createElement("span", { style: { color: slot.is_booked ? "red" : "green" } }, slot.is_booked ? "RÃ©servÃ©" : "Libre")
                            )
                        )
                    )
                )
            )
        ),
        
        // ===== CANDIDATURES =====
        activeTab === "applications" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ“‹ Candidatures reÃ§ues"),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "Poste"), React.createElement("th", null, "Candidat"),
                            React.createElement("th", null, "Email"), React.createElement("th", null, "TÃ©lÃ©phone"), React.createElement("th", null, "Message"),
                            React.createElement("th", null, "CV"), React.createElement("th", null, "Date"), React.createElement("th", null, "Statut")
                        )
                    ),
                    React.createElement("tbody", null, applications.map(app => {
                        const baseUrl = API_BASE.replace('/api', '');
                        const cvUrl = `${baseUrl}${app.cv_url}`;
                        return React.createElement("tr", { key: app.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, app.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(app.job_title)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(app.full_name)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(app.email)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(app.phone || "-")),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(app.message || "-")),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, 
                                app.cv_url ? 
                                    React.createElement("a", { href: cvUrl, target: "_blank", style: { background: "#0b6e8f", color: "white", padding: "4px 8px", borderRadius: "4px", textDecoration: "none", fontSize: "0.8rem" } }, "ðŸ“„ TÃ©lÃ©charger CV") :
                                    "-"
                            ),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, new Date(app.applied_date).toLocaleString()),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, app.status || "pending")
                        );
                    }))
                )
            )
        ),
        
        // ===== STATISTIQUES =====
        activeTab === "stats" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ“Š Statistiques"),
            React.createElement("div", { style: { display: "flex", gap: "20px", flexWrap: "wrap" } },
                React.createElement("div", { style: { background: "#e9ecef", borderRadius: "16px", padding: "16px", textAlign: "center", minWidth: "150px" } },
                    React.createElement("div", { style: { fontSize: "2rem", fontWeight: "bold", color: "#0b6e8f" } },
                        (stats.total && stats.total.total !== undefined) ? stats.total.total : 0
                    ),
                    React.createElement("div", null, "Total RDV")
                )
            ),
            React.createElement("h3", null, "ðŸ“… Par jour"),
            React.createElement("ul", null, 
                (stats.perDay && stats.perDay.length > 0) ? 
                    stats.perDay.map(d => React.createElement("li", { key: d.date }, `${d.date} : ${d.nb} RDV`)) :
                    React.createElement("li", null, "Aucune donnÃ©e")
            ),
            React.createElement("h3", null, "ðŸ‘¨â€âš•ï¸ Par mÃ©decin"),
            React.createElement("ul", null, 
                (stats.perDoctor && stats.perDoctor.length > 0) ? 
                    stats.perDoctor.map(d => React.createElement("li", { key: d.name }, `${d.name} : ${d.nb} RDV`)) :
                    React.createElement("li", null, "Aucune donnÃ©e")
            )
        ),
        
        // ===== OFFRES D'EMPLOI =====
        activeTab === "jobs" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ’¼ Offres d'emploi"),
            React.createElement("button", { onClick: () => setShowJobForm(!showJobForm), style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer", marginBottom: "20px" } }, showJobForm ? "-" : "+", " Ajouter"),
            showJobForm && React.createElement("form", { onSubmit: addJob, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("input", { type: "text", name: "title", placeholder: "Titre", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "text", name: "department", placeholder: "DÃ©partement", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("select", { name: "contract_type", style: { width: "100%", marginBottom: "8px", padding: "8px" } }, 
                    React.createElement("option", null, "CDI"), React.createElement("option", null, "CDD"), React.createElement("option", null, "Stage")
                ),
                React.createElement("input", { type: "text", name: "location", placeholder: "Localisation", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("textarea", { name: "description", placeholder: "Description", rows: "3", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("textarea", { name: "requirements", placeholder: "PrÃ©requis", rows: "3", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "text", name: "salary_range", placeholder: "Salaire", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, React.createElement("input", { type: "checkbox", name: "active", defaultChecked: true }), " Actif"),
                React.createElement("br", null),
                React.createElement("button", { type: "submit", style: { marginTop: "10px", background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Ajouter")
            ),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "Titre"), React.createElement("th", null, "DÃ©partement"),
                            React.createElement("th", null, "Contrat"), React.createElement("th", null, "Localisation"), React.createElement("th", null, "Actif"), React.createElement("th", null, "Actions")
                        )
                    ),
                    React.createElement("tbody", null, jobs.map(job =>
                        React.createElement("tr", { key: job.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, job.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(job.title)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(job.department)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(job.contract_type)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(job.location)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, job.active ? "âœ… Oui" : "âŒ Non"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, React.createElement("button", { onClick: () => deleteJob(job.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸"))
                        )
                    ))
                )
            )
        ),
        
        // ===== DISPONIBILITÃ‰S =====
        activeTab === "manage" && React.createElement("div", null,
            React.createElement("h3", null, "Gestion des disponibilitÃ©s"),
            React.createElement("button", { onClick: () => setShowAvailabilityForm(!showAvailabilityForm), style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer", marginBottom: "20px" } }, showAvailabilityForm ? "-" : "+", " Ajouter crÃ©neau"),
            showAvailabilityForm && React.createElement("form", { onSubmit: addAvailability, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("select", { name: "doctor_id", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }, 
                    React.createElement("option", { value: "" }, "MÃ©decin"),
                    doctors.map(d => React.createElement("option", { key: d.id, value: d.id }, escapeHtml(d.full_name)))
                ),
                React.createElement("input", { type: "date", name: "date", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "time", name: "start_time", required: true, style: { width: "48%", padding: "8px" } }),
                React.createElement("input", { type: "time", name: "end_time", required: true, style: { width: "48%", padding: "8px", float: "right" } }),
                React.createElement("div", { style: { clear: "both" } }),
                React.createElement("button", { type: "submit", style: { marginTop: "10px", background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Ajouter")
            ),
            React.createElement("h3", null, "Liste des crÃ©neaux"),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "MÃ©decin"), React.createElement("th", null, "Date"), React.createElement("th", null, "CrÃ©neau"),
                            React.createElement("th", null, "Statut"), React.createElement("th", null, "Action")
                        )
                    ),
                    React.createElement("tbody", null, availabilities.map(av =>
                        React.createElement("tr", { key: av.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(av.doctor_name)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, av.date),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, av.time_slot),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd", color: av.is_booked ? "red" : "green" } }, av.is_booked ? "RÃ©servÃ©" : "Libre"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, !av.is_booked && React.createElement("button", { onClick: () => deleteAvailability(av.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸"))
                        )
                    ))
                )
            )
        ),
        
        // ===== MÃ‰DECINS =====
        activeTab === "doctors" && React.createElement("div", null,
            React.createElement("h3", null, "âž• Ajouter un mÃ©decin"),
            React.createElement("form", { onSubmit: async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const full_name = formData.get("full_name");
                const specialty = formData.get("specialty");
                const department = formData.get("department");
                const email = formData.get("email");
                const password = formData.get("password");
                const telegram_chat_id = formData.get("telegram_chat_id") || null;
                const profession = "MÃ©decin";
                const active = formData.get("active") === "on" ? 1 : 0;
                const photoFile = formData.get("photo");
                let photo_url = null;
                
                if (photoFile && photoFile.size) {
                    const fd = new FormData();
                    fd.append("image", photoFile);
                    const uploadRes = await fetch(API_BASE + "/upload", { method: "POST", body: fd });
                    const uploadData = await uploadRes.json();
                    if (uploadData.imageUrl) {
                        photo_url = uploadData.imageUrl;
                    } else {
                        alert("Erreur upload photo : " + (uploadData.error || ""));
                        return;
                    }
                }
                
                const payload = {
                    full_name,
                    profession,
                    specialty,
                    department,
                    email,
                    phone: "",
                    photo_url,
                    password,
                    telegram_chat_id,
                    active
                };
                
                try {
                    const res = await fetch(API_BASE + "/staff", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                    
                    if (res.ok) {
                        showSuccess("MÃ©decin ajoutÃ©");
                        loadDoctors();
                        e.target.reset();
                    } else {
                        const errData = await res.json();
                        alert("âŒ Erreur : " + (errData.error || errData.message || res.statusText));
                    }
                } catch (err) {
                    console.error("âŒ Erreur rÃ©seau :", err);
                    alert("âŒ Erreur rÃ©seau : " + err.message);
                }
            }, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("input", { type: "text", name: "full_name", placeholder: "Nom complet", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "text", name: "specialty", placeholder: "SpÃ©cialitÃ©", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "text", name: "department", placeholder: "Service", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "email", name: "email", placeholder: "Email", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "password", name: "password", placeholder: "Mot de passe", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "text", name: "telegram_chat_id", placeholder: "Telegram Chat ID", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "file", name: "photo", accept: "image/*", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "checkbox", name: "active", defaultChecked: true, style: { marginRight: "5px" } }),
                React.createElement("label", null, " Actif"),
                React.createElement("br", null),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Ajouter")
            ),
            React.createElement("h3", null, "ðŸ“‹ Liste des mÃ©decins"),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "Nom"), React.createElement("th", null, "SpÃ©cialitÃ©"),
                            React.createElement("th", null, "Photo"), React.createElement("th", null, "Telegram ID"), React.createElement("th", null, "Actif"), React.createElement("th", null, "Actions")
                        )
                    ),
                    React.createElement("tbody", null, doctors.map(d =>
                        React.createElement("tr", { key: d.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, d.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(d.full_name)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(d.specialty || d.profession)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, d.photo_url ? React.createElement("img", { src: `${MEDIA_BASE}/${d.photo_url}`, style: { width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" } }) : "-"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(d.telegram_chat_id || "-")),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, d.active ? "âœ…" : "âŒ"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, 
                                React.createElement("button", { onClick: () => { setEditingDoctor(d); setEditPhotoPreview(null); }, style: { color: "#ffc107", background: "none", border: "none", cursor: "pointer" } }, "âœï¸"),
                                React.createElement("button", { onClick: () => deleteDoctor(d.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸"),
                                React.createElement("button", { onClick: () => resetDoctorPassword(d.id), style: { color: "#0b6e8f", background: "none", border: "none", cursor: "pointer", marginLeft: "5px" } }, "ðŸ”‘")
                            )
                        )
                    ))
                )
            )
        ),
        
        // ===== MODALE Ã‰DITION MÃ‰DECIN =====
        editingDoctor && React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 } },
            React.createElement("div", { style: { background: "white", padding: "20px", borderRadius: "16px", maxWidth: "500px", width: "90%" } },
                React.createElement("h3", null, "Modifier le mÃ©decin"),
                React.createElement("form", { onSubmit: updateDoctor },
                    React.createElement("input", { type: "text", name: "full_name", defaultValue: editingDoctor.full_name, placeholder: "Nom complet", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("input", { type: "text", name: "specialty", defaultValue: editingDoctor.specialty || "", placeholder: "SpÃ©cialitÃ©", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("input", { type: "text", name: "department", defaultValue: editingDoctor.department || "", placeholder: "Service", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("input", { type: "email", name: "email", defaultValue: editingDoctor.email, placeholder: "Email", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("input", { type: "text", name: "telegram_chat_id", defaultValue: editingDoctor.telegram_chat_id || "", placeholder: "Telegram Chat ID", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("input", { type: "tel", name: "phone", defaultValue: editingDoctor.phone || "", placeholder: "TÃ©lÃ©phone", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("div", { style: { marginBottom: "8px" } },
                        React.createElement("label", null, "Photo actuelle : "),
                        editingDoctor.photo_url ? 
                            React.createElement("img", { src: `${MEDIA_BASE}/${editingDoctor.photo_url}`, style: { width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", marginLeft: "10px" } }) :
                            React.createElement("span", null, "Aucune photo")
                    ),
                    React.createElement("input", { type: "file", name: "photo", accept: "image/*", onChange: (e) => {
                        if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setEditPhotoPreview(ev.target.result);
                            reader.readAsDataURL(e.target.files[0]);
                        }
                    }, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    editPhotoPreview && React.createElement("img", { src: editPhotoPreview, style: { width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", marginBottom: "8px" }, alt: "Nouvelle photo" }),
                    React.createElement("input", { type: "password", name: "password", placeholder: "Nouveau mot de passe (laisser vide pour inchangÃ©)", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("label", { style: { display: "block", marginBottom: "8px" } },
                        React.createElement("input", { type: "checkbox", name: "active", defaultChecked: editingDoctor.active === 1 }),
                        " Compte actif"
                    ),
                    React.createElement("div", { style: { marginTop: "15px", display: "flex", gap: "10px", justifyContent: "flex-end" } },
                        React.createElement("button", { type: "button", onClick: () => { setEditingDoctor(null); setEditPhotoPreview(null); }, style: { background: "#6c757d", color: "white", padding: "8px 16px", border: "none", borderRadius: "20px" } }, "Annuler"),
                        React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", padding: "8px 16px", border: "none", borderRadius: "20px" } }, "Enregistrer")
                    )
                )
            )
        ),
        
        // ===== Ã‰VÃ‰NEMENTS =====
        activeTab === "events" && React.createElement("div", null,
            React.createElement("h3", null, "âž• Ajouter un Ã©vÃ©nement"),
            React.createElement("form", { onSubmit: addEvent, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("input", { type: "text", name: "title", placeholder: "Titre", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("textarea", { name: "description", placeholder: "Description", rows: "2", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "date", name: "start_date", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "date", name: "end_date", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, React.createElement("input", { type: "checkbox", name: "active", defaultChecked: true }), " Actif"),
                React.createElement("br", null),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Ajouter")
            ),
            React.createElement("h3", null, "ðŸ“… Ã‰vÃ©nements"),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "Titre"), React.createElement("th", null, "Description"),
                            React.createElement("th", null, "DÃ©but"), React.createElement("th", null, "Fin"), React.createElement("th", null, "Actif"), React.createElement("th", null, "Actions")
                        )
                    ),
                    React.createElement("tbody", null, events.map(e =>
                        React.createElement("tr", { key: e.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, e.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(e.title)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(e.description || "")),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, e.start_date || "-"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, e.end_date || "-"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, e.active ? "Oui" : "Non"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, React.createElement("button", { onClick: () => deleteEvent(e.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸"))
                        )
                    ))
                )
            )
        ),
        
        // ===== CONTENU DU SITE =====
        activeTab === "content" && React.createElement("div", null,
            React.createElement("h2", null, "âœï¸ Contenu du site"),
            React.createElement("select", { value: selectedPage, onChange: e => { setSelectedPage(e.target.value); loadContent(e.target.value); }, style: { padding: "8px", marginBottom: "20px", borderRadius: "8px" } },
                React.createElement("option", { value: "home" }, "Accueil"),
                React.createElement("option", { value: "about" }, "Nous connaÃ®tre"),
                React.createElement("option", { value: "support" }, "Nous soutenir"),
                React.createElement("option", { value: "checkup" }, "Check-up Center"),
                React.createElement("option", { value: "specialties" }, "Nos spÃ©cialitÃ©s"),
                React.createElement("option", { value: "info" }, "Infos patients & visiteurs"),
                React.createElement("option", { value: "offre" }, "Notre offre de soins"),
                React.createElement("option", { value: "tarifs" }, "Tarifs hospitaliers"),
                React.createElement("option", { value: "paiement_facture" }, "Paiement des factures"),
                React.createElement("option", { value: "topbar" }, "Barre supÃ©rieure (numÃ©ro d'urgence)")
            ),
            React.createElement("div", { id: "contentEditor", style: { marginBottom: "20px" } },
                Object.entries(siteContent).map(([key, val]) =>
                    React.createElement("textarea", { key: key, "data-key": key, defaultValue: typeof val === 'string' ? val : JSON.stringify(val, null, 2), placeholder: key, rows: "4", style: { width: "100%", marginBottom: "10px", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" } })
                )
            ),
            React.createElement("button", { onClick: () => {
                const updates = {};
                document.querySelectorAll("#contentEditor textarea").forEach(ta => {
                    const key = ta.getAttribute("data-key");
                    const val = ta.value;
                    try { updates[key] = JSON.parse(val); }
                    catch { updates[key] = val; }
                });
                fetch(`${API_BASE}/site-content`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: selectedPage, contenu: JSON.stringify(updates) })
                }).then(res => res.ok ? alert("âœ… Contenu mis Ã  jour !") : alert("âŒ Erreur"));
            }, style: { background: "#0b6e8f", color: "white", border: "none", padding: "10px 20px", borderRadius: "25px", cursor: "pointer" } }, "Enregistrer")
        ),
        
        // ===== ACTUALITÃ‰S =====
        activeTab === "actualites" && React.createElement("div", null,
            React.createElement("h2", null, "ActualitÃ©s"),
            React.createElement("button", { onClick: () => setShowActuForm(!showActuForm), style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer", marginBottom: "20px" } }, showActuForm ? "-" : "+", " Ajouter"),
            showActuForm && React.createElement("form", { onSubmit: addActualite, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("input", { type: "text", name: "titre", placeholder: "Titre", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("textarea", { name: "description", placeholder: "Description", rows: "3", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "file", name: "imageFile", accept: "image/*", onChange: e => {
                    if (e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = ev => setImagePreview(ev.target.result);
                        reader.readAsDataURL(e.target.files[0]);
                    }
                }, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                imagePreview && React.createElement("img", { src: imagePreview, style: { maxWidth: "100px", borderRadius: "8px", marginBottom: "8px" }, alt: "Preview" }),
                React.createElement("input", { type: "number", name: "ordre", placeholder: "Ordre", defaultValue: "0", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, React.createElement("input", { type: "checkbox", name: "active", defaultChecked: true }), " Actif"),
                React.createElement("br", null),
                React.createElement("button", { type: "submit", style: { marginTop: "10px", background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Ajouter")
            ),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "Titre"), React.createElement("th", null, "Description"),
                            React.createElement("th", null, "Image"), React.createElement("th", null, "Ordre"), React.createElement("th", null, "Actif"), React.createElement("th", null, "Actions")
                        )
                    ),
                    React.createElement("tbody", null, actualites.map(actu =>
                        React.createElement("tr", { key: actu.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, actu.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(actu.titre)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(actu.description)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, actu.image_url ? React.createElement("img", { src: `${MEDIA_BASE}/${actu.image_url}`, style: { width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" } }) : "-"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, actu.ordre),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, actu.active ? "âœ…" : "âŒ"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, 
                                React.createElement("button", { onClick: () => { setEditingActu(actu); setEditActuPreview(null); }, style: { color: "#ffc107", background: "none", border: "none", cursor: "pointer" } }, "âœï¸"),
                                React.createElement("button", { onClick: () => deleteActualite(actu.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸")
                            )
                        )
                    ))
                )
            )
        ),
        
        // ===== MODALE Ã‰DITION ACTUALITÃ‰ =====
        editingActu && React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 } },
            React.createElement("div", { style: { background: "white", padding: "20px", borderRadius: "16px", maxWidth: "500px", width: "90%" } },
                React.createElement("h3", null, "Modifier l'actualitÃ©"),
                React.createElement("form", { onSubmit: updateActualite },
                    React.createElement("input", { type: "text", name: "titre", defaultValue: editingActu.titre, placeholder: "Titre", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("textarea", { name: "description", defaultValue: editingActu.description, placeholder: "Description", rows: "3", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("div", { style: { marginBottom: "8px" } },
                        React.createElement("label", null, "Image actuelle : "),
                        editingActu.image_url ? 
                            React.createElement("img", { src: `${MEDIA_BASE}/${editingActu.image_url}`, style: { width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover", marginLeft: "10px" } }) :
                            React.createElement("span", null, "Aucune image")
                    ),
                    React.createElement("input", { type: "file", name: "imageFile", accept: "image/*", onChange: (e) => {
                        if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setEditActuPreview(ev.target.result);
                            reader.readAsDataURL(e.target.files[0]);
                        }
                    }, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    editActuPreview && React.createElement("img", { src: editActuPreview, style: { maxWidth: "100px", borderRadius: "8px", marginBottom: "8px" }, alt: "Nouvelle image" }),
                    React.createElement("label", { style: { display: "block", marginBottom: "8px" } },
                        React.createElement("input", { type: "checkbox", name: "active", defaultChecked: editingActu.active === 1 }),
                        " Actif"
                    ),
                    React.createElement("div", { style: { marginTop: "15px", display: "flex", gap: "10px", justifyContent: "flex-end" } },
                        React.createElement("button", { type: "button", onClick: () => { setEditingActu(null); setEditActuPreview(null); }, style: { background: "#6c757d", color: "white", padding: "8px 16px", border: "none", borderRadius: "20px" } }, "Annuler"),
                        React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", padding: "8px 16px", border: "none", borderRadius: "20px" } }, "Enregistrer")
                    )
                )
            )
        ),
        
        // ===== SPÃ‰CIALITÃ‰S =====
        activeTab === "specialties" && React.createElement("div", null,
            React.createElement("h2", null, "SpÃ©cialitÃ©s"),
            React.createElement("button", { onClick: () => setShowSpecialtyForm(!showSpecialtyForm), style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer", marginBottom: "20px" } }, showSpecialtyForm ? "-" : "+", " Ajouter"),
            showSpecialtyForm && React.createElement("form", { onSubmit: addSpecialty, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("input", { type: "text", name: "name", placeholder: "Nom", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("textarea", { name: "description", placeholder: "Description", rows: "2", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, React.createElement("input", { type: "checkbox", name: "active", defaultChecked: true }), " Active"),
                React.createElement("br", null),
                React.createElement("button", { type: "submit", style: { marginTop: "10px", background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Ajouter")
            ),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "Nom"), React.createElement("th", null, "Description"),
                            React.createElement("th", null, "Active"), React.createElement("th", null, "Actions")
                        )
                    ),
                    React.createElement("tbody", null, specialties.map(spec =>
                        React.createElement("tr", { key: spec.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, spec.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(spec.name)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(spec.description || "")),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, spec.active ? "âœ…" : "âŒ"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, React.createElement("button", { onClick: () => deleteSpecialty(spec.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸"))
                        )
                    ))
                )
            )
        ),
        
        // ===== Ã‰TABLISSEMENT =====
        activeTab === "etablissement" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ¥ Gestion des photos de l'Ã©tablissement"),
            React.createElement("form", { onSubmit: async (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const titre = fd.get("titre");
                const description = fd.get("description");
                const active = fd.get("active") === "on" ? 1 : 0;
                const file = fd.get("imageFile");
                if (!file || file.size === 0) { alert("Image requise"); return; }
                const uploadFd = new FormData(); uploadFd.append("image", file);
                const uploadRes = await fetch(API_BASE + "/upload", { method: "POST", body: uploadFd });
                const uploadData = await uploadRes.json();
                if (!uploadData.imageUrl) { alert("Erreur upload"); return; }
                const payload = { titre, description, image_url: uploadData.imageUrl, active };
                const res = await fetch(API_BASE + "/etablissement", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                if (res.ok) { showSuccess("Photo ajoutÃ©e"); loadEtablissement(); e.target.reset(); }
                else alert("Erreur");
            }, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("input", { type: "text", name: "titre", placeholder: "Titre", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("textarea", { name: "description", placeholder: "Description", rows: "2", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "file", name: "imageFile", accept: "image/*", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, React.createElement("input", { type: "checkbox", name: "active", defaultChecked: true }), " Actif"),
                React.createElement("br", null),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Ajouter")
            ),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "Titre"), React.createElement("th", null, "Image"), React.createElement("th", null, "Actif"), React.createElement("th", null, "Actions")
                        )
                    ),
                    React.createElement("tbody", null, etablissement.map(photo =>
                        React.createElement("tr", { key: photo.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, photo.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(photo.titre)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, React.createElement("img", { src: `${MEDIA_BASE}/${photo.image_url}`, style: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" } })),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, photo.active ? "Oui" : "Non"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, 
                                React.createElement("button", { onClick: () => { setEditingEtablissement(photo); setEditEtabPreview(null); }, style: { color: "#ffc107", background: "none", border: "none", cursor: "pointer" } }, "âœï¸"),
                                React.createElement("button", { onClick: () => deleteEtablissement(photo.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸")
                            )
                        )
                    ))
                )
            )
        ),
        
        // ===== MODALE Ã‰DITION Ã‰TABLISSEMENT =====
        editingEtablissement && React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 } },
            React.createElement("div", { style: { background: "white", padding: "20px", borderRadius: "16px", maxWidth: "500px", width: "90%" } },
                React.createElement("h3", null, "Modifier la photo"),
                React.createElement("form", { onSubmit: updateEtablissement },
                    React.createElement("input", { type: "text", name: "titre", defaultValue: editingEtablissement.titre, placeholder: "Titre", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("textarea", { name: "description", defaultValue: editingEtablissement.description || "", placeholder: "Description", rows: "2", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("div", { style: { marginBottom: "8px" } },
                        React.createElement("label", null, "Image actuelle : "),
                        React.createElement("img", { src: `${MEDIA_BASE}/${editingEtablissement.image_url}`, style: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", marginLeft: "10px" } })
                    ),
                    React.createElement("input", { type: "file", name: "imageFile", accept: "image/*", onChange: (e) => {
                        if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setEditEtabPreview(ev.target.result);
                            reader.readAsDataURL(e.target.files[0]);
                        }
                    }, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    editEtabPreview && React.createElement("img", { src: editEtabPreview, style: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }, alt: "Nouvelle image" }),
                    React.createElement("label", { style: { display: "block", marginBottom: "8px" } },
                        React.createElement("input", { type: "checkbox", name: "active", defaultChecked: editingEtablissement.active === 1 }),
                        " Actif"
                    ),
                    React.createElement("div", { style: { marginTop: "15px", display: "flex", gap: "10px", justifyContent: "flex-end" } },
                        React.createElement("button", { type: "button", onClick: () => { setEditingEtablissement(null); setEditEtabPreview(null); }, style: { background: "#6c757d", color: "white", padding: "8px 16px", border: "none", borderRadius: "20px" } }, "Annuler"),
                        React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", padding: "8px 16px", border: "none", borderRadius: "20px" } }, "Enregistrer")
                    )
                )
            )
        ),
        
        // ===== PARTENAIRES =====
        activeTab === "partenaires" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ¤ Gestion des partenaires"),
            React.createElement("form", { onSubmit: async (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const nom = fd.get("nom");
                const description = fd.get("description");
                const commentaire = fd.get("commentaire");
                const active = fd.get("active") === "on" ? 1 : 0;
                const file = fd.get("imageFile");
                if (!file || file.size === 0) { alert("Logo requis"); return; }
                const uploadFd = new FormData(); uploadFd.append("image", file);
                const uploadRes = await fetch(API_BASE + "/upload", { method: "POST", body: uploadFd });
                const uploadData = await uploadRes.json();
                if (!uploadData.imageUrl) { alert("Erreur upload"); return; }
                const payload = { nom, description, image_url: uploadData.imageUrl, commentaire, active };
                const res = await fetch(API_BASE + "/partenaires", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                if (res.ok) { showSuccess("Partenaire ajoutÃ©"); loadPartenaires(); e.target.reset(); }
                else alert("Erreur");
            }, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("input", { type: "text", name: "nom", placeholder: "Nom", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("textarea", { name: "description", placeholder: "Description", rows: "2", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "file", name: "imageFile", accept: "image/*", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("textarea", { name: "commentaire", placeholder: "Commentaire", rows: "3", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, React.createElement("input", { type: "checkbox", name: "active", defaultChecked: true }), " Actif"),
                React.createElement("br", null),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Ajouter")
            ),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "Nom"), React.createElement("th", null, "Image"),
                            React.createElement("th", null, "Commentaire"), React.createElement("th", null, "Actif"), React.createElement("th", null, "Actions")
                        )
                    ),
                    React.createElement("tbody", null, partenaires.map(p =>
                        React.createElement("tr", { key: p.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, p.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(p.nom)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, React.createElement("img", { src: `${MEDIA_BASE}/${p.image_url}`, style: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" } })),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(p.commentaire || "-")),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, p.active ? "Oui" : "Non"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, 
                                React.createElement("button", { onClick: () => { setEditingPartenaire(p); setEditPartPreview(null); }, style: { color: "#ffc107", background: "none", border: "none", cursor: "pointer" } }, "âœï¸"),
                                React.createElement("button", { onClick: () => deletePartenaire(p.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸")
                            )
                        )
                    ))
                )
            )
        ),
        
        // ===== MODALE Ã‰DITION PARTENAIRE =====
        editingPartenaire && React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 } },
            React.createElement("div", { style: { background: "white", padding: "20px", borderRadius: "16px", maxWidth: "500px", width: "90%" } },
                React.createElement("h3", null, "Modifier le partenaire"),
                React.createElement("form", { onSubmit: updatePartenaire },
                    React.createElement("input", { type: "text", name: "nom", defaultValue: editingPartenaire.nom, placeholder: "Nom", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("textarea", { name: "description", defaultValue: editingPartenaire.description || "", placeholder: "Description", rows: "2", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("div", { style: { marginBottom: "8px" } },
                        React.createElement("label", null, "Logo actuel : "),
                        React.createElement("img", { src: `${MEDIA_BASE}/${editingPartenaire.image_url}`, style: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", marginLeft: "10px" } })
                    ),
                    React.createElement("input", { type: "file", name: "imageFile", accept: "image/*", onChange: (e) => {
                        if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setEditPartPreview(ev.target.result);
                            reader.readAsDataURL(e.target.files[0]);
                        }
                    }, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    editPartPreview && React.createElement("img", { src: editPartPreview, style: { width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }, alt: "Nouveau logo" }),
                    React.createElement("textarea", { name: "commentaire", defaultValue: editingPartenaire.commentaire || "", placeholder: "Commentaire", rows: "3", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("label", { style: { display: "block", marginBottom: "8px" } },
                        React.createElement("input", { type: "checkbox", name: "active", defaultChecked: editingPartenaire.active === 1 }),
                        " Actif"
                    ),
                    React.createElement("div", { style: { marginTop: "15px", display: "flex", gap: "10px", justifyContent: "flex-end" } },
                        React.createElement("button", { type: "button", onClick: () => { setEditingPartenaire(null); setEditPartPreview(null); }, style: { background: "#6c757d", color: "white", padding: "8px 16px", border: "none", borderRadius: "20px" } }, "Annuler"),
                        React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", padding: "8px 16px", border: "none", borderRadius: "20px" } }, "Enregistrer")
                    )
                )
            )
        ),
        
        // ===== NEWSLETTER =====
        activeTab === "newsletter" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ“§ Newsletter"),
            React.createElement("p", null, "Total abonnÃ©s actifs : ", React.createElement("strong", null, newsletterCount)),
            React.createElement("button", { onClick: exportEmails, style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer", marginBottom: "20px" } }, "ðŸ“Ž Exporter les emails (CSV)"),
            React.createElement("h3", null, "âœ‰ï¸ Envoyer une newsletter"),
            React.createElement("form", { onSubmit: sendNewsletter, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px" } },
                React.createElement("input", { type: "text", name: "subject", placeholder: "Sujet", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("textarea", { name: "content", placeholder: "Contenu (HTML acceptÃ©)", rows: "5", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "ðŸ“¨ Envoyer")
            )
        ),
        
        // ===== FOOTER =====
        activeTab === "footer" && React.createElement("div", null,
            React.createElement("h2", null, "âœï¸ Gestion du pied de page (multi-colonnes)"),
            React.createElement("form", { onSubmit: saveFooter, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px" } },
                React.createElement("h3", null, "CoordonnÃ©es"),
                React.createElement("label", null, "Nom de l'Ã©tablissement :"),
                React.createElement("input", { type: "text", name: "etablissement", defaultValue: footerContent.etablissement || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, "Adresse :"),
                React.createElement("input", { type: "text", name: "adresse", defaultValue: footerContent.adresse || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, "TÃ©lÃ©phone principal :"),
                React.createElement("input", { type: "text", name: "telephone", defaultValue: footerContent.telephone || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, "TÃ©lÃ©phone secondaire :"),
                React.createElement("input", { type: "text", name: "telephone2", defaultValue: footerContent.telephone2 || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, "Email de contact :"),
                React.createElement("input", { type: "email", name: "email", defaultValue: footerContent.email || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, "NumÃ©ro d'urgence :"),
                React.createElement("input", { type: "text", name: "urgences", defaultValue: footerContent.urgences || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                
                React.createElement("h3", null, "Bloc : Aide et information (une ligne par lien, format texte|url)"),
                React.createElement("textarea", { name: "liens_aide", defaultValue: footerContent.liens_aide || "", rows: "6", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                
                React.createElement("h3", null, "Bloc : Notre entreprise"),
                React.createElement("textarea", { name: "liens_entreprise", defaultValue: footerContent.liens_entreprise || "", rows: "6", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                
                React.createElement("h3", null, "Bloc : Pour les soignants"),
                React.createElement("textarea", { name: "liens_soignants", defaultValue: footerContent.liens_soignants || "", rows: "6", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                
                React.createElement("h3", null, "Bloc : Trouvez votre spÃ©cialiste"),
                React.createElement("textarea", { name: "liens_specialistes", defaultValue: footerContent.liens_specialistes || "", rows: "8", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                
                React.createElement("h3", null, "Bloc : Recherches frÃ©quentes"),
                React.createElement("textarea", { name: "liens_recherches", defaultValue: footerContent.liens_recherches || "", rows: "6", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                
                React.createElement("h3", null, "DerniÃ¨res technologies MCE (une par ligne)"),
                React.createElement("textarea", { name: "technologies", defaultValue: footerContent.technologies || "", rows: "4", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                
                React.createElement("h3", null, "RÃ©seaux sociaux (icÃ´nes Font Awesome sÃ©parÃ©es par des virgules)"),
                React.createElement("input", { type: "text", name: "reseaux", defaultValue: footerContent.reseaux || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                
                React.createElement("h3", null, "Copyright"),
                React.createElement("input", { type: "text", name: "copyright", defaultValue: footerContent.copyright || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Enregistrer le footer")
            )
        ),
        
        // ===== TARIFS =====
        activeTab === "tarifs" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ’° Gestion des tarifs"),
            React.createElement("form", { onSubmit: addTarif, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("input", { type: "text", name: "service", placeholder: "Service", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "text", name: "prestation", placeholder: "Prestation", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "text", name: "prix", placeholder: "Prix", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("textarea", { name: "description", placeholder: "Description", rows: "2", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, React.createElement("input", { type: "checkbox", name: "active", defaultChecked: true }), " Actif"),
                React.createElement("br", null),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Ajouter")
            ),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "Service"), React.createElement("th", null, "Prestation"),
                            React.createElement("th", null, "Prix"), React.createElement("th", null, "Actif"), React.createElement("th", null, "Actions")
                        )
                    ),
                    React.createElement("tbody", null, tarifs.map(t =>
                        React.createElement("tr", { key: t.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, t.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(t.service)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(t.prestation)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(t.prix)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, t.active ? "Oui" : "Non"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, React.createElement("button", { onClick: () => deleteTarif(t.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸"))
                        )
                    ))
                )
            )
        ),
        
        // ===== CAISSE =====
        activeTab === "caisse" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ’° Historique des paiements"),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "Client"), React.createElement("th", null, "Montant"),
                            React.createElement("th", null, "MÃ©thode"), React.createElement("th", null, "Statut"), React.createElement("th", null, "Code"), React.createElement("th", null, "Date"), React.createElement("th", null, "Facture")
                        )
                    ),
                    React.createElement("tbody", null, paiements.map(p =>
                        React.createElement("tr", { key: p.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, p.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(p.nom_client || "-")),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, p.montant + " â‚¬"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, p.methode === "mobile_money" ? "Mobile Money" : "Carte"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd", color: p.statut === "confirme" ? "green" : "orange" } }, p.statut),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, p.code_confirmation || "-"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, new Date(p.date_paiement).toLocaleString()),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, p.facture_url ? React.createElement("a", { href: p.facture_url, target: "_blank", style: { color: "#0b6e8f" } }, "ðŸ“„ Facture") : "-")
                        )
                    ))
                )
            ),
            React.createElement("h3", null, "âš™ï¸ Configuration des moyens de paiement"),
            React.createElement("form", { onSubmit: savePaymentConfig, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginTop: "20px" } },
                React.createElement("label", null, "IBAN :"), React.createElement("input", { type: "text", name: "iban", defaultValue: paymentConfig.iban || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, "BIC :"), React.createElement("input", { type: "text", name: "bic", defaultValue: paymentConfig.bic || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, "Titulaire :"), React.createElement("input", { type: "text", name: "titulaire", defaultValue: paymentConfig.titulaire || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, "Mobile Money :"), React.createElement("input", { type: "text", name: "mobile_money_info", defaultValue: paymentConfig.mobile_money_info || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null, "Carte bancaire :"), React.createElement("input", { type: "text", name: "carte_info", defaultValue: paymentConfig.carte_info || "", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Enregistrer")
            )
        ),
        
        // ===== PAIEMENTS MANUELS =====
        activeTab === "paiements-manuels" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ“‹ Demandes de paiement manuel"),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"),
                            React.createElement("th", null, "Nom"),
                            React.createElement("th", null, "Email"),
                            React.createElement("th", null, "TÃ©lÃ©phone"),
                            React.createElement("th", null, "Montant"),
                            React.createElement("th", null, "MÃ©thode"),
                            React.createElement("th", null, "Preuve"),
                            React.createElement("th", null, "Statut"),
                            React.createElement("th", null, "Commentaire"),
                            React.createElement("th", null, "Date")
                        )
                    ),
                    React.createElement("tbody", null, paiementsManuels.map(p => {
                        const preuveUrl = p.preuve_url ? `${API_BASE.replace('/api', '')}${p.preuve_url}` : '#';
                        return React.createElement("tr", { key: p.id, style: { borderBottom: "1px solid #e2e8f0" } },
                            React.createElement("td", { style: { padding: "8px" } }, p.id),
                            React.createElement("td", { style: { padding: "8px" } }, escapeHtml(p.nom)),
                            React.createElement("td", { style: { padding: "8px" } }, escapeHtml(p.email)),
                            React.createElement("td", { style: { padding: "8px" } }, escapeHtml(p.telephone || "-")),
                            React.createElement("td", { style: { padding: "8px" } }, p.montant ? p.montant + " â‚¬" : "-"),
                            React.createElement("td", { style: { padding: "8px" } }, p.methode === "mobile_money" ? "Mobile Money" : "Virement"),
                            React.createElement("td", { style: { padding: "8px" } },
                                p.preuve_url ?
                                    React.createElement("a", { href: preuveUrl, target: "_blank", style: { color: "#0b6e8f", textDecoration: "underline" } }, "ðŸ“„ Voir la preuve") :
                                    "-"
                            ),
                            React.createElement("td", { style: { padding: "8px" } }, p.statut || "en_attente"),
                            React.createElement("td", { style: { padding: "8px" } }, escapeHtml(p.commentaire || "-")),
                            React.createElement("td", { style: { padding: "8px" } }, new Date(p.date_creation).toLocaleString())
                        );
                    }))
                )
            )
        ),
        
        // ===== RÃ‰SULTATS LABO =====
        activeTab === "results" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ”¬ RÃ©sultats en attente de publication"),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "Patient"), React.createElement("th", null, "Type"),
                            React.createElement("th", null, "Description"), React.createElement("th", null, "Fichier"), React.createElement("th", null, "Date crÃ©ation"), React.createElement("th", null, "Action")
                        )
                    ),
                    React.createElement("tbody", null, pendingResults.map(r =>
                        React.createElement("tr", { key: r.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, r.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(r.first_name + " " + r.last_name)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(r.type)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(r.description || "-")),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, r.file_url ? React.createElement("a", { href: r.file_url, target: "_blank", style: { color: "#0b6e8f" } }, "ðŸ“„ Fichier") : "-"),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, new Date(r.created_at).toLocaleString()),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, React.createElement("button", { onClick: () => publishResult(r.id), style: { background: "#28a745", color: "white", border: "none", padding: "4px 12px", borderRadius: "20px", cursor: "pointer" } }, "Publier"))
                        )
                    ))
                )
            ),
            React.createElement("h3", null, "âž• Ajouter un rÃ©sultat"),
            React.createElement("form", { onSubmit: addResult, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginTop: "20px" } },
                React.createElement("select", { name: "patient_id", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } },
                    React.createElement("option", { value: "" }, "-- Choisir un patient --"),
                    patients.map(p => React.createElement("option", { key: p.id, value: p.id }, escapeHtml(p.first_name + " " + p.last_name) + " (" + p.email + ")"))
                ),
                React.createElement("input", { type: "text", name: "type", placeholder: "Type d'examen", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("textarea", { name: "description", placeholder: "Description", rows: "2", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "text", name: "file_url", placeholder: "URL du fichier (PDF)", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Ajouter")
            )
        ),
        
        // ===== PATIENTS =====
        activeTab === "patients" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ‘¥ Gestion des patients"),
            React.createElement("button", { onClick: () => setShowPatientForm(!showPatientForm), style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer", marginBottom: "20px" } }, showPatientForm ? "-" : "+", " Ajouter"),
            showPatientForm && React.createElement("form", { onSubmit: addPatient, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("input", { type: "text", name: "first_name", placeholder: "PrÃ©nom", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "text", name: "last_name", placeholder: "Nom", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "email", name: "email", placeholder: "Email", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "tel", name: "phone", placeholder: "TÃ©lÃ©phone", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "password", name: "password", placeholder: "Mot de passe", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Ajouter")
            ),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"), React.createElement("th", null, "PrÃ©nom"), React.createElement("th", null, "Nom"),
                            React.createElement("th", null, "Email"), React.createElement("th", null, "TÃ©lÃ©phone"), React.createElement("th", null, "Date d'inscription"),
                            React.createElement("th", null, "Statut"), React.createElement("th", null, "Actions")
                        )
                    ),
                    React.createElement("tbody", null, patients.map(p =>
                        React.createElement("tr", { key: p.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, p.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(p.first_name)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(p.last_name)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(p.email)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(p.phone || "-")),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, new Date(p.created_at).toLocaleDateString()),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } },
                                React.createElement("button", {
                                    onClick: () => togglePatientStatus(p),
                                    style: {
                                        background: p.is_active ? "#28a745" : "#dc3545",
                                        color: "white",
                                        border: "none",
                                        padding: "4px 10px",
                                        borderRadius: "12px",
                                        cursor: "pointer",
                                        fontSize: "0.8rem"
                                    }
                                }, p.is_active ? "Actif" : "Inactif")
                            ),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, 
                                React.createElement("button", { onClick: () => setEditingPatient(p), style: { color: "#ffc107", background: "none", border: "none", cursor: "pointer" } }, "âœï¸"),
                                React.createElement("button", { onClick: () => deletePatient(p.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸")
                            )
                        )
                    ))
                )
            )
        ),
        
        // ===== MODALE Ã‰DITION PATIENT =====
        editingPatient && React.createElement("div", { style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 } },
            React.createElement("div", { style: { background: "white", padding: "20px", borderRadius: "16px", maxWidth: "500px", width: "90%" } },
                React.createElement("h3", null, "Modifier le patient"),
                React.createElement("form", { onSubmit: updatePatient },
                    React.createElement("input", { type: "text", name: "first_name", defaultValue: editingPatient.first_name, placeholder: "PrÃ©nom", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("input", { type: "text", name: "last_name", defaultValue: editingPatient.last_name, placeholder: "Nom", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("input", { type: "email", name: "email", defaultValue: editingPatient.email, placeholder: "Email", required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("input", { type: "tel", name: "phone", defaultValue: editingPatient.phone || "", placeholder: "TÃ©lÃ©phone", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("input", { type: "password", name: "password", placeholder: "Nouveau mot de passe (laisser vide pour inchangÃ©)", style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                    React.createElement("label", { style: { display: "block", marginBottom: "8px" } },
                        React.createElement("input", { type: "checkbox", name: "is_active", defaultChecked: editingPatient.is_active === 1 }),
                        " Compte actif"
                    ),
                    React.createElement("div", { style: { marginTop: "15px", display: "flex", gap: "10px", justifyContent: "flex-end" } },
                        React.createElement("button", { type: "button", onClick: () => setEditingPatient(null), style: { background: "#6c757d", color: "white", padding: "8px 16px", border: "none", borderRadius: "20px" } }, "Annuler"),
                        React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", padding: "8px 16px", border: "none", borderRadius: "20px" } }, "Enregistrer")
                    )
                )
            )
        ),
        
        // ===== MESSAGES =====
        activeTab === "messages" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ“© Messages reÃ§us"),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"),
                            React.createElement("th", null, "ExpÃ©diteur"),
                            React.createElement("th", null, "Nom"),
                            React.createElement("th", null, "Sujet"),
                            React.createElement("th", null, "Message"),
                            React.createElement("th", null, "Date"),
                            React.createElement("th", null, "Lu")
                        )
                    ),
                    React.createElement("tbody", null, messages.map(msg =>
                        React.createElement("tr", { key: msg.id },
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, msg.id),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(msg.sender_type)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(msg.sender_name || "Anonyme")),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, escapeHtml(msg.subject || "-")),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd", maxWidth: "200px", wordWrap: "break-word" } }, escapeHtml(msg.message)),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, new Date(msg.sent_date).toLocaleString()),
                            React.createElement("td", { style: { padding: "8px", borderBottom: "1px solid #ddd" } }, msg.is_read ? "âœ…" : "âŒ")
                        )
                    ))
                )
            )
        ),

        // ===== SALLES DE RÃ‰UNION =====
        activeTab === "rooms" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ¢ Salles de rÃ©union"),
            React.createElement("form", { onSubmit: editingRoom ? updateRoom : createRoom, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("h4", null, editingRoom ? "Modifier la salle" : "âž• Ajouter une salle"),
                React.createElement("input", { type: "text", placeholder: "Nom", value: roomForm.name, onChange: e => setRoomForm({...roomForm, name: e.target.value}), required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "number", placeholder: "CapacitÃ©", value: roomForm.capacity, onChange: e => setRoomForm({...roomForm, capacity: e.target.value}), required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "text", placeholder: "Ã‰quipement", value: roomForm.equipment, onChange: e => setRoomForm({...roomForm, equipment: e.target.value}), style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("label", null,
                    React.createElement("input", { type: "checkbox", checked: roomForm.has_video, onChange: e => setRoomForm({...roomForm, has_video: e.target.checked}) }),
                    " VidÃ©oconfÃ©rence"
                ),
                React.createElement("br", null),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, editingRoom ? "Mettre Ã  jour" : "Ajouter"),
                editingRoom && React.createElement("button", { type: "button", onClick: () => { setEditingRoom(null); setRoomForm({ name: '', capacity: '', equipment: '', has_video: false }); }, style: { marginLeft: "10px", background: "#6c757d", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Annuler"),
                roomsFeedback && React.createElement("div", { style: { marginTop: "10px", color: roomsFeedback.includes("âœ…") ? "green" : "red" } }, roomsFeedback)
            ),
            React.createElement("h3", null, "Liste des salles"),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" } },
                rooms.map(room =>
                    React.createElement("div", { key: room.id, style: { border: "1px solid #ccc", borderRadius: "8px", padding: "1rem", minWidth: "150px" } },
                        React.createElement("h4", null, room.name),
                        React.createElement("p", null, "CapacitÃ©: ", room.capacity),
                        React.createElement("p", null, room.equipment || "-"),
                        room.has_video && React.createElement("span", { style: { color: "#2ec4b6" } }, "ðŸ“¹"),
                        React.createElement("div", { style: { marginTop: "8px" } },
                            React.createElement("button", { onClick: () => { setEditingRoom(room); setRoomForm({ name: room.name, capacity: room.capacity, equipment: room.equipment || '', has_video: room.has_video }); }, style: { color: "#ffc107", background: "none", border: "none", cursor: "pointer" } }, "âœï¸"),
                            React.createElement("button", { onClick: () => deleteRoom(room.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸")
                        )
                    )
                )
            ),
            React.createElement("h3", null, "ðŸ“… RÃ©servations de toutes les salles"),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "Salle"),
                            React.createElement("th", null, "Titre"),
                            React.createElement("th", null, "Date"),
                            React.createElement("th", null, "Heure"),
                            React.createElement("th", null, "RÃ©servÃ© par"),
                            React.createElement("th", null, "Lien")
                        )
                    ),
                    React.createElement("tbody", null, allBookings.map(b =>
                        React.createElement("tr", { key: b.id },
                            React.createElement("td", { style: { padding: "8px" } }, b.room_name || b.room_id),
                            React.createElement("td", { style: { padding: "8px" } }, b.title),
                            React.createElement("td", { style: { padding: "8px" } }, b.date),
                            React.createElement("td", { style: { padding: "8px" } }, b.start_time + "-" + b.end_time),
                            React.createElement("td", { style: { padding: "8px" } }, b.booked_by_name || b.booked_by),
                            React.createElement("td", { style: { padding: "8px" } }, b.meeting_link && React.createElement("a", { href: b.meeting_link, target: "_blank", style: { color: "#0b6e8f" } }, "ðŸ”—"))
                        )
                    ))
                )
            )
        ),

        // ===== PERSONNEL HOSPITALIER =====
        activeTab === "staff" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ‘¥ Personnel hospitalier"),
            React.createElement("form", { onSubmit: editingStaff ? updateStaff : createStaff, style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" } },
                React.createElement("h4", null, editingStaff ? "Modifier un compte" : "âž• Ajouter un compte"),
                React.createElement("input", { type: "text", placeholder: "Nom complet", value: staffForm.name, onChange: e => setStaffForm({...staffForm, name: e.target.value}), required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "email", placeholder: "Email", value: staffForm.email, onChange: e => setStaffForm({...staffForm, email: e.target.value}), required: true, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("input", { type: "password", placeholder: "Mot de passe", value: staffForm.password, onChange: e => setStaffForm({...staffForm, password: e.target.value}), required: !editingStaff, style: { width: "100%", marginBottom: "8px", padding: "8px" } }),
                React.createElement("select", { value: staffForm.role, onChange: e => setStaffForm({...staffForm, role: e.target.value}), style: { width: "100%", marginBottom: "8px", padding: "8px" } },
                    React.createElement("option", { value: "staff" }, "Personnel"),
                    React.createElement("option", { value: "admin" }, "Administrateur")
                ),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, editingStaff ? "Mettre Ã  jour" : "Ajouter"),
                editingStaff && React.createElement("button", { type: "button", onClick: () => { setEditingStaff(null); setStaffForm({ name: '', email: '', password: '', role: 'staff' }); }, style: { marginLeft: "10px", background: "#6c757d", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" } }, "Annuler"),
                staffFeedback && React.createElement("div", { style: { marginTop: "10px", color: staffFeedback.includes("âœ…") ? "green" : "red" } }, staffFeedback)
            ),
            React.createElement("h3", null, "Liste du personnel"),
            React.createElement("div", { style: { overflowX: "auto" } },
                React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { background: "#0b6e8f", color: "white" } },
                            React.createElement("th", null, "ID"),
                            React.createElement("th", null, "Nom"),
                            React.createElement("th", null, "Email"),
                            React.createElement("th", null, "RÃ´le"),
                            React.createElement("th", null, "Actions")
                        )
                    ),
                    React.createElement("tbody", null, staffList.map(s =>
                        React.createElement("tr", { key: s.id },
                            React.createElement("td", { style: { padding: "8px" } }, s.id),
                            React.createElement("td", { style: { padding: "8px" } }, escapeHtml(s.name)),
                            React.createElement("td", { style: { padding: "8px" } }, escapeHtml(s.email)),
                            React.createElement("td", { style: { padding: "8px" } }, s.role || "staff"),
                            React.createElement("td", { style: { padding: "8px" } },
                                React.createElement("button", { onClick: () => { setEditingStaff(s); setStaffForm({ name: s.name, email: s.email, password: '', role: s.role || 'staff' }); }, style: { color: "#ffc107", background: "none", border: "none", cursor: "pointer" } }, "âœï¸"),
                                React.createElement("button", { onClick: () => deleteStaff(s.id), style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer" } }, "ðŸ—‘ï¸")
                            )
                        )
                    ))
                )
            )
        ),

        // ===== INFOS PATIENTS =====
        activeTab === "infos-patients" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸ“‹ Informations patients & visiteurs"),
            React.createElement("p", { style: { color: "#6c757d" } }, "Modifiez les informations affichÃ©es sur la page 'Infos patients'."),
            React.createElement("form", { onSubmit: (e) => { e.preventDefault(); saveInfoPatients(); }, style: { display: "flex", flexDirection: "column", gap: "1rem" } },
                React.createElement("div", null,
                    React.createElement("label", { style: { fontWeight: "bold" } }, "ðŸ•’ Horaires de visite"),
                    React.createElement("textarea", {
                        value: infoPatientsContent.horaires || '',
                        onChange: e => setInfoPatientsContent({...infoPatientsContent, horaires: e.target.value}),
                        rows: "3",
                        style: { width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }
                    })
                ),
                React.createElement("div", null,
                    React.createElement("label", { style: { fontWeight: "bold" } }, "ðŸ½ï¸ Suggestions de repas"),
                    React.createElement("textarea", {
                        value: infoPatientsContent.repas || '',
                        onChange: e => setInfoPatientsContent({...infoPatientsContent, repas: e.target.value}),
                        rows: "8",
                        style: { width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }
                    })
                ),
                React.createElement("div", null,
                    React.createElement("label", { style: { fontWeight: "bold" } }, "ðŸš— AccÃ¨s et parking"),
                    React.createElement("textarea", {
                        value: infoPatientsContent.parking || '',
                        onChange: e => setInfoPatientsContent({...infoPatientsContent, parking: e.target.value}),
                        rows: "4",
                        style: { width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }
                    })
                ),
                React.createElement("div", null,
                    React.createElement("label", { style: { fontWeight: "bold" } }, "ðŸ›¡ï¸ RÃ¨gles et recommandations"),
                    React.createElement("textarea", {
                        value: infoPatientsContent.regles || '',
                        onChange: e => setInfoPatientsContent({...infoPatientsContent, regles: e.target.value}),
                        rows: "6",
                        style: { width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }
                    })
                ),
                React.createElement("div", null,
                    React.createElement("label", { style: { fontWeight: "bold" } }, "ðŸ“ž Contacts utiles"),
                    React.createElement("textarea", {
                        value: infoPatientsContent.contact || '',
                        onChange: e => setInfoPatientsContent({...infoPatientsContent, contact: e.target.value}),
                        rows: "4",
                        style: { width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }
                    })
                ),
                React.createElement("button", { type: "submit", style: { background: "#0b6e8f", color: "white", border: "none", padding: "10px 20px", borderRadius: "25px", cursor: "pointer", alignSelf: "flex-start" } }, "ðŸ’¾ Enregistrer")
            ),
            infoPatientsLoading && React.createElement("p", null, "Chargement...")
        ),

        // ===== ðŸŽ‰ JOUR D'OUVERTURE =====
        activeTab === "jour-ouverture" && React.createElement("div", null,
            React.createElement("h2", null, "ðŸŽ‰ Jour d'ouverture de l'hÃ´pital"),
            React.createElement("p", { style: { color: "#6c757d" } },
                "Ajoutez des photos et vidÃ©os de l'inauguration du MCE. Ils s'afficheront automatiquement sur la page d'accueil."
            ),

            // FORMULAIRE
            React.createElement("form", {
                onSubmit: editingJour ? updateJourOuverture : addJourOuverture,
                style: { background: "#f1f9fe", padding: "15px", borderRadius: "12px", marginBottom: "20px" }
            },
                React.createElement("h4", null, editingJour ? "âœï¸ Modifier le mÃ©dia" : "âž• Ajouter un mÃ©dia"),

                React.createElement("label", { style: { fontWeight: "bold" } }, "Type de mÃ©dia :"),
                React.createElement("select", {
                    name: "type",
                    value: jourForm.type,
                    onChange: e => setJourForm({ ...jourForm, type: e.target.value }),
                    style: { width: "100%", marginBottom: "8px", padding: "8px" }
                },
                    React.createElement("option", { value: "photo" }, "ðŸ“· Photo"),
                    React.createElement("option", { value: "video" }, "ðŸŽ¥ VidÃ©o")
                ),

                React.createElement("input", {
                    type: "text", name: "titre", placeholder: "Titre",
                    defaultValue: editingJour ? editingJour.titre : "",
                    style: { width: "100%", marginBottom: "8px", padding: "8px" }
                }),

                React.createElement("textarea", {
                    name: "description", placeholder: "Description", rows: "2",
                    defaultValue: editingJour ? editingJour.description : "",
                    style: { width: "100%", marginBottom: "8px", padding: "8px" }
                }),

                React.createElement("input", {
                    type: "number", name: "ordre", placeholder: "Ordre d'affichage",
                    defaultValue: editingJour ? editingJour.ordre : 0,
                    style: { width: "100%", marginBottom: "8px", padding: "8px" }
                }),

                editingJour && React.createElement("div", { style: { marginBottom: "8px" } },
                    React.createElement("label", null, "MÃ©dia actuel : "),
                    editingJour.type === 'video'
                        ? React.createElement("video", {
                            src: `${MEDIA_BASE}/${editingJour.url}`,
                            style: { width: "120px", borderRadius: "8px", marginLeft: "10px", verticalAlign: "middle" },
                            muted: true
                        })
                        : React.createElement("img", {
                            src: `${MEDIA_BASE}/${editingJour.url}`,
                            style: { width: "80px", height: "60px", objectFit: "cover", borderRadius: "8px", marginLeft: "10px", verticalAlign: "middle" }
                        })
                ),

                React.createElement("input", {
                    type: "file",
                    name: jourForm.type === 'video' ? 'videoFile' : 'imageFile',
                    accept: jourForm.type === 'video' ? 'video/*' : 'image/*',
                    onChange: e => {
                        if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = ev => setJourPreview({ url: ev.target.result, type: jourForm.type });
                            reader.readAsDataURL(e.target.files[0]);
                        }
                    },
                    style: { width: "100%", marginBottom: "8px", padding: "8px" }
                }),

                jourPreview && React.createElement("div", { style: { marginBottom: "8px" } },
                    jourPreview.type === 'video'
                        ? React.createElement("video", { src: jourPreview.url, style: { width: "160px", borderRadius: "8px" }, muted: true, controls: true })
                        : React.createElement("img", { src: jourPreview.url, style: { width: "120px", borderRadius: "8px" }, alt: "AperÃ§u" })
                ),

                React.createElement("label", null,
                    React.createElement("input", { type: "checkbox", name: "active", defaultChecked: true }),
                    " Actif (visible sur l'accueil)"
                ),
                React.createElement("br", null),

                React.createElement("button", {
                    type: "submit",
                    style: { marginTop: "10px", background: "#0b6e8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" }
                }, editingJour ? "Mettre Ã  jour" : "Ajouter"),

                editingJour && React.createElement("button", {
                    type: "button",
                    onClick: () => {
                        setEditingJour(null);
                        setJourPreview(null);
                        setJourForm({ type: 'photo', titre: '', description: '', ordre: 0, active: true });
                    },
                    style: { marginLeft: "10px", background: "#6c757d", color: "white", border: "none", padding: "8px 16px", borderRadius: "25px", cursor: "pointer" }
                }, "Annuler"),

                jourFeedback && React.createElement("div", {
                    style: { marginTop: "10px", color: jourFeedback.includes("âœ…") ? "green" : jourFeedback.includes("â³") ? "#0b6e8f" : "red" }
                }, jourFeedback)
            ),

            // LISTE DES MÃ‰DIAS
            React.createElement("h3", null, "ðŸ“¸ MÃ©dias enregistrÃ©s"),
            jourOuverture.length === 0
                ? React.createElement("p", null, "Aucun mÃ©dia pour le moment.")
                : React.createElement("div", {
                    style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "15px" }
                },
                    jourOuverture.map(m => {
                        const isVideo = m.type === 'video';
                        return React.createElement("div", {
                            key: m.id,
                            style: {
                                border: "1px solid #ddd",
                                borderRadius: "12px",
                                overflow: "hidden",
                                background: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                            }
                        },
                            isVideo
                                ? React.createElement("video", {
                                    src: `${MEDIA_BASE}/${m.url}`,
                                    style: { width: "100%", height: "150px", objectFit: "cover", background: "#000" },
                                    muted: true,
                                    controls: true
                                })
                                : React.createElement("img", {
                                    src: `${MEDIA_BASE}/${m.url}`,
                                    style: { width: "100%", height: "150px", objectFit: "cover" },
                                    alt: m.titre
                                }),

                            React.createElement("div", { style: { padding: "10px" } },
                                React.createElement("h4", { style: { margin: "0 0 5px 0" } },
                                    isVideo ? "ðŸŽ¥ " : "ðŸ“· ",
                                    escapeHtml(m.titre || "Sans titre")
                                ),
                                React.createElement("p", { style: { fontSize: "0.85rem", color: "#666", margin: "0 0 5px 0" } },
                                    escapeHtml(m.description || "")
                                ),
                                React.createElement("p", { style: { fontSize: "0.8rem", color: "#999", margin: 0 } },
                                    "Ordre : ", m.ordre, " Â· ",
                                    (m.active === 1 || m.active === true) ? "âœ… Actif" : "âŒ Inactif"
                                ),

                                React.createElement("div", { style: { marginTop: "8px", display: "flex", gap: "8px" } },
                                    React.createElement("button", {
                                        onClick: () => {
                                            setEditingJour(m);
                                            setJourForm({
                                                type: m.type || 'photo',
                                                titre: m.titre || '',
                                                description: m.description || '',
                                                ordre: m.ordre || 0,
                                                active: m.active === 1 || m.active === true
                                            });
                                            setJourPreview(null);
                                        },
                                        style: { color: "#ffc107", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }
                                    }, "âœï¸"),
                                    React.createElement("button", {
                                        onClick: () => deleteJourOuverture(m.id),
                                        style: { color: "#dc3545", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }
                                    }, "ðŸ—‘ï¸")
                                )
                            )
                        );
                    })
                )
        ),
        
        React.createElement("div", { className: "footer", style: { marginTop: "20px", textAlign: "center", color: "#6c757d" } }, React.createElement("p", null, "ðŸ”’ AccÃ¨s sÃ©curisÃ© rÃ©servÃ© au personnel autorisÃ©"))
    );
}

export default AdminDashboard;

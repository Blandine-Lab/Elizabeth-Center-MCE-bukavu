// src/components/admin/FooterEditor.jsx
import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function FooterEditor() {
    const [footer, setFooter] = useState({
        etablissement: '',
        adresse: '',
        telephone: '',
        telephone2: '',
        urgences: '',
        email: '',
        liens_aide: '',
        liens_entreprise: '',
        liens_soignants: '',
        liens_specialistes: '',
        liens_recherches: '',
        copyright: '',
        reseaux: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadFooter();
    }, []);

    async function loadFooter() {
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch(`${API_BASE}/site-content/footer`);
            if (!res.ok) {
                if (res.status === 404) {
                    setFooter({});
                    setLoading(false);
                    return;
                }
                throw new Error(`Erreur HTTP ${res.status}`);
            }
            const data = await res.json();
            // Si le contenu est stocké sous forme de JSON, on le parse
            if (data.contenu) {
                try {
                    setFooter(JSON.parse(data.contenu));
                } catch {
                    setFooter({ contenu: data.contenu });
                }
            } else {
                setFooter(data);
            }
        } catch (err) {
            console.error('Erreur chargement footer:', err);
            setMessage('❌ Erreur de chargement du footer');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch(`${API_BASE}/site-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'footer',
                    contenu: JSON.stringify(footer)
                })
            });
            if (res.ok) {
                setMessage('✅ Footer mis à jour avec succès !');
                setTimeout(() => setMessage(''), 3000);
            } else {
                const error = await res.json();
                setMessage(`❌ Erreur : ${error.error || 'Erreur lors de la mise à jour'}`);
            }
        } catch (err) {
            console.error('Erreur sauvegarde footer:', err);
            setMessage('❌ Erreur réseau');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div style={{ padding: '1rem' }}>⏳ Chargement du footer...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px' }}>
            {message && (
                <div style={{
                    background: message.includes('✅') ? '#d4edda' : '#f8d7da',
                    color: message.includes('✅') ? '#155724' : '#721c24',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '15px'
                }}>
                    {message}
                </div>
            )}
            
            <h3 style={{ color: '#0b6e8f', marginBottom: '1rem' }}>🏥 Coordonnées</h3>
            
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nom de l'établissement :</label>
                <input
                    type="text"
                    value={footer.etablissement || ''}
                    onChange={(e) => setFooter({...footer, etablissement: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Adresse :</label>
                <input
                    type="text"
                    value={footer.adresse || ''}
                    onChange={(e) => setFooter({...footer, adresse: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Téléphone principal :</label>
                <input
                    type="text"
                    value={footer.telephone || ''}
                    onChange={(e) => setFooter({...footer, telephone: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Téléphone secondaire :</label>
                <input
                    type="text"
                    value={footer.telephone2 || ''}
                    onChange={(e) => setFooter({...footer, telephone2: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email :</label>
                <input
                    type="email"
                    value={footer.email || ''}
                    onChange={(e) => setFooter({...footer, email: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Urgences :</label>
                <input
                    type="text"
                    value={footer.urgences || ''}
                    onChange={(e) => setFooter({...footer, urgences: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
            </div>

            <hr style={{ margin: '2rem 0' }} />

            <h3 style={{ color: '#0b6e8f', marginBottom: '1rem' }}>🔗 Liens du footer (format: texte|url, un par ligne)</h3>
            
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Aide et information :</label>
                <textarea
                    value={footer.liens_aide || ''}
                    onChange={(e) => setFooter({...footer, liens_aide: e.target.value})}
                    rows="4"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'monospace' }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Notre entreprise :</label>
                <textarea
                    value={footer.liens_entreprise || ''}
                    onChange={(e) => setFooter({...footer, liens_entreprise: e.target.value})}
                    rows="4"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'monospace' }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Pour les soignants :</label>
                <textarea
                    value={footer.liens_soignants || ''}
                    onChange={(e) => setFooter({...footer, liens_soignants: e.target.value})}
                    rows="4"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'monospace' }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Trouvez votre spécialiste :</label>
                <textarea
                    value={footer.liens_specialistes || ''}
                    onChange={(e) => setFooter({...footer, liens_specialistes: e.target.value})}
                    rows="4"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'monospace' }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Recherches fréquentes :</label>
                <textarea
                    value={footer.liens_recherches || ''}
                    onChange={(e) => setFooter({...footer, liens_recherches: e.target.value})}
                    rows="4"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'monospace' }}
                />
            </div>

            <hr style={{ margin: '2rem 0' }} />

            <h3 style={{ color: '#0b6e8f', marginBottom: '1rem' }}>📝 Copyright & Réseaux</h3>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Copyright :</label>
                <input
                    type="text"
                    value={footer.copyright || ''}
                    onChange={(e) => setFooter({...footer, copyright: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Réseaux sociaux (icônes Font Awesome séparées par des virgules) :
                </label>
                <input
                    type="text"
                    value={footer.reseaux || ''}
                    onChange={(e) => setFooter({...footer, reseaux: e.target.value})}
                    placeholder="fa-facebook, fa-twitter, fa-instagram, fa-linkedin, fa-youtube"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <p style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '4px' }}>
                    Exemple : fa-facebook, fa-twitter, fa-instagram, fa-linkedin, fa-youtube
                </p>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                style={{
                    background: '#0b6e8f',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    width: '100%',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                }}
            >
                {saving ? '⏳ Enregistrement...' : '💾 Enregistrer le footer'}
            </button>
        </div>
    );
}

export default FooterEditor;
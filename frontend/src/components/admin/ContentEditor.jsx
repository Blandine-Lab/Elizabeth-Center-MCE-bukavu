// src/components/admin/ContentEditor.jsx
import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function ContentEditor({ pageType, onSave }) {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadContent();
    }, [pageType]);

    async function loadContent() {
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch(`${API_BASE}/site-content/${pageType}`);
            if (!res.ok) {
                // Si la page n'existe pas encore, on initialise avec un objet vide
                if (res.status === 404) {
                    setContent({});
                    setLoading(false);
                    return;
                }
                throw new Error(`Erreur HTTP ${res.status}`);
            }
            const data = await res.json();
            // Si le contenu est stocké sous forme de JSON, on le parse
            if (data.contenu) {
                try {
                    setContent(JSON.parse(data.contenu));
                } catch {
                    setContent({ contenu: data.contenu });
                }
            } else {
                setContent(data);
            }
        } catch (err) {
            console.error('Erreur chargement contenu:', err);
            setMessage('❌ Erreur de chargement du contenu');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        setMessage('');
        try {
            // On envoie le contenu sous forme de JSON stringifié
            const res = await fetch(`${API_BASE}/site-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: pageType,
                    contenu: JSON.stringify(content)
                })
            });
            if (res.ok) {
                setMessage('✅ Contenu mis à jour avec succès !');
                if (onSave) onSave();
                setTimeout(() => setMessage(''), 3000);
            } else {
                const error = await res.json();
                setMessage(`❌ Erreur : ${error.error || 'Erreur lors de la mise à jour'}`);
            }
        } catch (err) {
            console.error('Erreur sauvegarde:', err);
            setMessage('❌ Erreur réseau');
        } finally {
            setSaving(false);
        }
    }

    // Fonction pour afficher une clé de manière lisible
    const formatLabel = (key) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) return <div style={{ padding: '1rem' }}>⏳ Chargement du contenu...</div>;

    // Si le contenu est vide ou n'a pas de propriétés
    if (Object.keys(content).length === 0) {
        return (
            <div style={{ padding: '20px' }}>
                {message && <div style={{ background: message.includes('✅') ? '#d4edda' : '#f8d7da', color: message.includes('✅') ? '#155724' : '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>}
                <p>Aucun contenu trouvé pour cette page.</p>
                <p style={{ fontSize: '0.85rem', color: '#6c757d' }}>Vous pouvez ajouter des champs en modifiant le code.</p>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    style={{ background: '#0b6e8f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', marginTop: '1rem' }}
                >
                    {saving ? 'Enregistrement...' : '💾 Créer le contenu'}
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            {message && <div style={{ background: message.includes('✅') ? '#d4edda' : '#f8d7da', color: message.includes('✅') ? '#155724' : '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>}
            
            {Object.entries(content).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>
                        {formatLabel(key)}
                    </label>
                    {typeof value === 'string' && value.length > 100 ? (
                        <textarea
                            value={value || ''}
                            onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '150px', fontFamily: 'inherit' }}
                        />
                    ) : (
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    )}
                </div>
            ))}
            
            <button 
                onClick={handleSave} 
                disabled={saving}
                style={{ background: '#0b6e8f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}
            >
                {saving ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
            </button>
        </div>
    );
}

export default ContentEditor;
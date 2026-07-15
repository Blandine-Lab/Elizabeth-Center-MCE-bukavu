// src/pages/FAQ.jsx
import { useState } from 'react';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: '📋 Comment prendre un rendez-vous en ligne ?',
      answer: 'Rendez-vous sur notre page d’accueil, section "Prendre rendez-vous", ou cliquez sur le bouton "Prendre rendez-vous" dans la navbar. Remplissez le formulaire avec vos coordonnées, choisissez un médecin et une date, puis validez. Vous recevrez une confirmation par email dans les 24 heures.'
    },
    {
      question: '🕒 Quels sont les horaires d’ouverture de l’hôpital ?',
      answer: 'Le Medical Center Elizabeth est ouvert 24h/24, 7j/7 pour les urgences. Les consultations programmées ont lieu du lundi au vendredi de 8h à 19h, et le samedi de 8h à 13h. Les horaires des services spécialisés peuvent varier, n’hésitez pas à nous contacter pour plus d’informations.'
    },
    {
      question: '🏥 Quels sont les modes de paiement acceptés ?',
      answer: 'Nous acceptons les paiements par Mobile Money (Orange Money, MTN, Airtel Money), cartes bancaires (VISA, MasterCard), virements bancaires et espèces. Vous pouvez régler vos prestations en ligne via notre formulaire de paiement sécurisé.'
    },
    {
      question: '👨‍⚕️ Comment puis-je trouver un médecin spécialiste ?',
      answer: 'Utilisez notre outil "Trouver un médecin" disponible dans la navbar ou sur la page d’accueil. Vous pouvez filtrer par spécialité, département ou nom. Chaque médecin dispose d’une fiche avec ses coordonnées et son parcours.'
    },
    {
      question: '📄 Comment obtenir mes résultats d’examens ?',
      answer: 'Les résultats d’examens sont disponibles dans votre espace patient sécurisé. Vous pouvez également les recevoir par email sur demande. Pour les résultats urgents, notre équipe vous contactera directement par téléphone.'
    },
    {
      question: '🩺 Le MCE propose-t-il des consultations à distance ?',
      answer: 'Oui, nous proposons des téléconsultations via notre plateforme sécurisée. Vous pouvez prendre un rendez-vous en téléconsultation directement depuis votre espace patient. Vous recevrez un lien de connexion par email avant la consultation.'
    },
    {
      question: '💳 Comment puis-je faire un don pour soutenir l’hôpital ?',
      answer: 'Rendez-vous sur la page "Nous soutenir" (lien dans le footer ou dans la navbar). Vous y trouverez un formulaire de don sécurisé. Votre générosité contribue à l’achat d’équipements médicaux de pointe et au développement de nos services.'
    },
    {
      question: '🏥 Quelles sont les spécialités médicales disponibles au MCE ?',
      answer: 'Nous proposons plus de 15 spécialités, dont la cardiologie, la neurologie, la pédiatrie, l’orthopédie, la gynécologie, l’ophtalmologie, la pneumologie, la médecine générale, et bien d’autres. Consultez notre page "Nos spécialités" pour une liste complète.'
    },
    {
      question: '📞 Comment contacter le service patient ?',
      answer: 'Vous pouvez nous joindre par téléphone au +243 992 952 038, par email à contact@medicalcenterelizabeth.fr, ou via le formulaire de contact sur notre site. Notre équipe est à votre disposition 24h/24 pour toute question ou urgence.'
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        color: '#0b6e8f', 
        marginBottom: '0.5rem',
        borderLeft: '5px solid #2ec4b6',
        paddingLeft: '20px'
      }}>
        ❓ Foire aux questions
      </h1>
      <p style={{ color: '#4a6b80', marginBottom: '2rem', fontSize: '1.1rem', paddingLeft: '20px' }}>
        Retrouvez les réponses aux questions les plus fréquemment posées.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {faqData.map((item, index) => (
          <div 
            key={index}
            style={{
              border: '1px solid #eef2f8',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              transition: 'box-shadow 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'}
          >
            <div
              onClick={() => toggleQuestion(index)}
              style={{
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: openIndex === index ? '#f0f7fc' : 'white',
                transition: 'background-color 0.2s'
              }}
            >
              <span style={{ fontWeight: '600', color: '#1e2a3a', fontSize: '1rem' }}>
                {item.question}
              </span>
              <span style={{ fontSize: '1.5rem', color: '#2ec4b6', flexShrink: 0, marginLeft: '1rem' }}>
                {openIndex === index ? '−' : '+'}
              </span>
            </div>
            {openIndex === index && (
              <div style={{
                padding: '0 1.5rem 1.5rem 1.5rem',
                color: '#4a6b80',
                lineHeight: '1.6',
                borderTop: '1px solid #eef2f8'
              }}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
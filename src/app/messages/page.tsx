'use client';
import { useState } from 'react';
import Link from 'next/link';

type Lang = 'fr' | 'ar';

const mockConversations = [
  { id: 1, prenom: 'Yasmine', metier: 'Coiffeuse', avatar: '👩', dernierMsg: 'Bonjour ! Je suis disponible samedi matin si vous souhaitez.', heure: '14:32', nonLu: 2, disponible: true },
  { id: 2, prenom: 'Nadia', metier: 'Pâtissière', avatar: '👩‍🍳', dernierMsg: 'Merci pour votre commande ! Le gâteau sera prêt vendredi.', heure: 'Hier', nonLu: 0, disponible: true },
  { id: 3, prenom: 'Houria', metier: 'Prof soutien scolaire', avatar: '👩‍🏫', dernierMsg: 'Pouvez-vous me préciser le niveau de votre enfant ?', heure: 'Lun', nonLu: 0, disponible: false },
];

const mockMessages: Record<number, { id: number; moi: boolean; texte: string; heure: string; type?: 'devis' | 'rdv' | 'normal' }[]> = {
  1: [
    { id: 1, moi: false, texte: 'Bonjour ! J\'ai vu votre profil sur DJARA. Je cherche une coiffeuse pour un chignon de mariée.', heure: '13:45', type: 'normal' },
    { id: 2, moi: true, texte: 'Bonjour ! Avec plaisir, c\'est ma spécialité 😊 Quelle est la date du mariage ?', heure: '13:52', type: 'normal' },
    { id: 3, moi: false, texte: 'Le 15 novembre. Et pour le maquillage aussi si possible ?', heure: '14:01', type: 'normal' },
    { id: 4, moi: true, texte: 'Parfait ! Je fais les deux. Voici mon devis :', heure: '14:15', type: 'devis' },
    { id: 5, moi: false, texte: 'Bonjour ! Je suis disponible samedi matin si vous souhaitez.', heure: '14:32', type: 'normal' },
  ],
  2: [
    { id: 1, moi: true, texte: 'Bonjour Nadia, je voudrais commander un gâteau d\'anniversaire pour 20 personnes.', heure: 'Hier 10:00', type: 'normal' },
    { id: 2, moi: false, texte: 'Bonjour ! Bien sûr. Quel parfum souhaitez-vous ? Chocolat, vanille ou fruits rouges ?', heure: 'Hier 10:15', type: 'normal' },
    { id: 3, moi: true, texte: 'Chocolat s\'il vous plaît, avec inscription "Bon anniversaire Mama" 🎂', heure: 'Hier 11:30', type: 'normal' },
    { id: 4, moi: false, texte: 'Merci pour votre commande ! Le gâteau sera prêt vendredi.', heure: 'Hier 12:00', type: 'normal' },
  ],
  3: [
    { id: 1, moi: true, texte: 'Bonjour, je cherche un soutien scolaire en maths pour mon fils en 4ème.', heure: 'Lun 09:00', type: 'normal' },
    { id: 2, moi: false, texte: 'Bonjour ! Je serais ravie d\'aider. Pouvez-vous me préciser le niveau de votre enfant ?', heure: 'Lun 09:45', type: 'normal' },
  ],
};

export default function MessagesPage() {
  const [lang, setLang] = useState<Lang>('fr');
  const isRTL = lang === 'ar';
  const [convActive, setConvActive] = useState<number | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const conv = convActive ? mockConversations.find(c => c.id === convActive) : null;
  const msgsActifs = convActive ? (messages[convActive] || []) : [];

  const envoyer = () => {
    if (!newMsg.trim() || !convActive) return;
    const nouveau = { id: Date.now(), moi: true, texte: newMsg.trim(), heure: 'À l\'instant', type: 'normal' as const };
    setMessages(prev => ({ ...prev, [convActive]: [...(prev[convActive] || []), nouveau] }));
    setNewMsg('');
  };

  // Vue conversation ouverte
  if (convActive && conv) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>

        {/* Header conversation */}
        <header style={{ background: '#59364A', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setConvActive(null)} style={{ background: 'none', border: 'none', color: '#FAF7F2', fontSize: 22, cursor: 'pointer', padding: 0 }}>←</button>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #C77D69, #A8B5A2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative', flexShrink: 0 }}>
            {conv.avatar}
            {conv.disponible && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, background: '#4caf50', borderRadius: '50%', border: '2px solid #59364A' }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#FAF7F2', fontWeight: 700, fontSize: 15 }}>{conv.prenom}</div>
            <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 11 }}>{conv.metier} · {conv.disponible ? (lang === 'fr' ? 'En ligne' : 'متصلة') : (lang === 'fr' ? 'Hors ligne' : 'غير متصلة')}</div>
          </div>
          <Link href={`/profil`} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 12px', color: '#FAF7F2', fontSize: 11, textDecoration: 'none' }}>
            👤 {lang === 'fr' ? 'Profil' : 'الملف'}
          </Link>
        </header>

        {/* Bannière sécurité */}
        <div style={{ background: '#e8f5e9', padding: '8px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ color: '#2e7d32', fontSize: 11 }}>
            {lang === 'fr' ? 'Messagerie sécurisée DJARA — Ne partagez jamais vos coordonnées bancaires.' : 'مراسلة آمنة DJARA — لا تشاركي بياناتك المصرفية أبداً.'}
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 80 }}>
          {msgsActifs.map(msg => (
            <div key={msg.id}>
              {/* Carte devis */}
              {msg.type === 'devis' && msg.moi && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                  <div style={{ background: '#fff', border: '2px solid #C77D69', borderRadius: 16, padding: '12px 16px', maxWidth: '75%' }}>
                    <div style={{ color: '#C77D69', fontWeight: 800, fontSize: 12, marginBottom: 8 }}>📋 {lang === 'fr' ? 'DEVIS' : 'عرض سعر'}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#555' }}>
                      <div>💇‍♀️ Chignon mariée — <strong>3 500 DA</strong></div>
                      <div>💄 Maquillage — <strong>2 500 DA</strong></div>
                      <div style={{ borderTop: '1px solid #e8ddd6', paddingTop: 4, fontWeight: 800, color: '#59364A' }}>Total : 6 000 DA</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <button style={{ flex: 1, padding: '6px', background: '#59364A', border: 'none', borderRadius: 10, color: '#FAF7F2', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        ✓ {lang === 'fr' ? 'Accepter' : 'قبول'}
                      </button>
                      <button style={{ flex: 1, padding: '6px', background: '#FAF7F2', border: '1px solid #ddd', borderRadius: 10, color: '#666', fontSize: 11, cursor: 'pointer' }}>
                        ✗ {lang === 'fr' ? 'Refuser' : 'رفض'}
                      </button>
                    </div>
                    <div style={{ color: '#bbb', fontSize: 10, marginTop: 4 }}>{msg.heure}</div>
                  </div>
                </div>
              )}

              {/* Bulle normale */}
              {msg.type !== 'devis' && (
                <div style={{ display: 'flex', justifyContent: msg.moi ? 'flex-end' : 'flex-start' }}>
                  <div style={{ background: msg.moi ? '#59364A' : '#fff', color: msg.moi ? '#FAF7F2' : '#292929', borderRadius: msg.moi ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '10px 14px', maxWidth: '75%', fontSize: 14, lineHeight: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                    {msg.texte}
                    <div style={{ color: msg.moi ? 'rgba(250,247,242,0.5)' : '#bbb', fontSize: 10, marginTop: 4, textAlign: 'right' }}>{msg.heure}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Zone de saisie */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e8e0', padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, background: '#FAF7F2', borderRadius: 24, border: '1px solid #e8ddd6', padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && envoyer()}
              placeholder={lang === 'fr' ? 'Écrire un message...' : 'اكتبي رسالة...'}
              style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14, color: '#292929' }} />
          </div>
          <button onClick={envoyer} style={{ width: 44, height: 44, borderRadius: '50%', background: newMsg.trim() ? '#59364A' : '#ddd', border: 'none', color: '#FAF7F2', fontSize: 18, cursor: newMsg.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ➤
          </button>
        </div>
      </div>
    );
  }

  // Vue liste des conversations
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 80 }}>

      <header style={{ background: '#59364A', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ color: '#FAF7F2', fontSize: 18, fontWeight: 900 }}>💬 {lang === 'fr' ? 'Messages' : 'الرسائل'}</div>
          <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 11 }}>
            {lang === 'fr' ? 'Messagerie sécurisée' : 'مراسلة آمنة'}
          </div>
        </div>
        <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>
          {lang === 'fr' ? 'عربي' : 'FR'}
        </button>
      </header>

      {/* Bannière sécurité */}
      <div style={{ background: '#fff3e0', padding: '10px 20px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>🔒</span>
        <span style={{ color: '#e65100', fontSize: 12 }}>
          {lang === 'fr' ? 'Ne communiquez jamais votre numéro de téléphone ou vos coordonnées bancaires.' : 'لا تشاركي رقم هاتفك أو بياناتك المصرفية أبداً.'}
        </span>
      </div>

      {/* Liste conversations */}
      <div style={{ padding: '12px 0' }}>
        {mockConversations.map(conv => (
          <button key={conv.id} onClick={() => setConvActive(conv.id)} style={{ width: '100%', background: 'none', border: 'none', padding: '12px 20px', display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #f0e8e0', textAlign: isRTL ? 'right' : 'left' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #C77D69, #A8B5A2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {conv.avatar}
              </div>
              {conv.disponible && <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, background: '#4caf50', borderRadius: '50%', border: '2px solid #FAF7F2' }} />}
            </div>
            {/* Infos */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ color: '#292929', fontWeight: conv.nonLu > 0 ? 800 : 600, fontSize: 15 }}>{conv.prenom}</span>
                <span style={{ color: '#bbb', fontSize: 11 }}>{conv.heure}</span>
              </div>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 2 }}>{conv.metier}</div>
              <div style={{ color: conv.nonLu > 0 ? '#292929' : '#bbb', fontSize: 13, fontWeight: conv.nonLu > 0 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conv.dernierMsg}
              </div>
            </div>
            {/* Badge non lu */}
            {conv.nonLu > 0 && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#C77D69', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {conv.nonLu}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* État vide si aucune conversation */}
      {mockConversations.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>💬</div>
          <div style={{ color: '#999', fontSize: 16 }}>{lang === 'fr' ? 'Aucun message pour le moment' : 'لا رسائل حتى الآن'}</div>
          <Link href="/rechercher" style={{ display: 'inline-block', marginTop: 16, background: '#59364A', color: '#FAF7F2', padding: '12px 24px', borderRadius: 25, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
            {lang === 'fr' ? '🔍 Trouver une prestataire' : '🔍 البحث عن خدمة'}
          </Link>
        </div>
      )}

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e8e0', display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', boxShadow: '0 -4px 20px rgba(89,54,74,0.08)', zIndex: 50 }}>
        {[
          { icon: '🏠', fr: 'Accueil', ar: 'الرئيسية', href: '/' },
          { icon: '🔍', fr: 'Rechercher', ar: 'بحث', href: '/rechercher' },
          { icon: '➕', fr: 'Publier', ar: 'نشر', href: '/publier' },
          { icon: '💬', fr: 'Messages', ar: 'رسائل', href: '/messages', active: true },
          { icon: '👤', fr: 'Profil', ar: 'حسابي', href: '/profil' },
        ].map((item, i) => (
          <Link key={i} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: (item as {active?:boolean}).active ? '#59364A' : '#bbb' }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: (item as {active?:boolean}).active ? 700 : 400 }}>{lang === 'fr' ? item.fr : item.ar}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
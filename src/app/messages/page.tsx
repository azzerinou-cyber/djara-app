'use client';
import { useState } from 'react';

type Lang = 'fr' | 'ar';

const conversations = [
  { id: 1, name: 'Amina B.', icon: '👩‍🍳', service: 'Cuisine traditionnelle', lastMsg: 'Bonjour, je suis disponible samedi matin.', lastMsgAr: 'مرحباً، أنا متاحة صباح السبت.', time: '10:24', unread: 2, online: true },
  { id: 2, name: 'Sara M.', icon: '💇‍♀️', service: 'Coiffure & Soins', lastMsg: 'Merci pour votre confiance !', lastMsgAr: 'شكراً على ثقتك!', time: 'Hier', unread: 0, online: false },
  { id: 3, name: 'Lina K.', icon: '👩‍🏫', service: 'Soutien scolaire', lastMsg: 'Le cours est confirmé pour lundi.', lastMsgAr: 'تم تأكيد الدرس ليوم الإثنين.', time: 'Lun', unread: 1, online: true },
  { id: 4, name: 'Yasmine R.', icon: '🪡', service: 'Broderie & Couture', lastMsg: 'Pouvez-vous m\'envoyer une photo ?', lastMsgAr: 'هل يمكنك إرسال صورة؟', time: 'Dim', unread: 0, online: false },
];

const chatMessages = [
  { from: 'them', text: 'Bonjour ! J\'ai vu votre profil, je suis intéressée par vos services de cuisine.', textAr: 'مرحباً! رأيت ملفك الشخصي، أنا مهتمة بخدمات الطبخ.', time: '10:10' },
  { from: 'me', text: 'Bonjour ! Avec plaisir, qu\'est-ce que vous souhaitez commander ?', textAr: 'مرحباً! بكل سرور، ماذا تودين طلبه؟', time: '10:12' },
  { from: 'them', text: 'Un couscous complet pour 6 personnes samedi prochain.', textAr: 'كسكس كامل لـ 6 أشخاص السبت القادم.', time: '10:15' },
  { from: 'me', text: 'Parfait ! Ce sera 3500 DA. Je peux livrer à domicile.', textAr: 'ممتاز! سيكون 3500 دج. يمكنني التوصيل للمنزل.', time: '10:18' },
  { from: 'them', text: 'Bonjour, je suis disponible samedi matin.', textAr: 'مرحباً، أنا متاحة صباح السبت.', time: '10:24' },
];

export default function Messages() {
  const [lang, setLang] = useState<Lang>('fr');
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const isRTL = lang === 'ar';

  const T = {
    fr: { title: 'Messages', search: 'Rechercher une conversation...', online: 'En ligne', typeMsg: 'Écrire un message...', send: 'Envoyer', empty: 'Aucune conversation', emptySub: 'Vos échanges avec les prestataires apparaîtront ici.' },
    ar: { title: 'الرسائل', search: 'البحث في المحادثات...', online: 'متصلة', typeMsg: 'اكتبي رسالة...', send: 'إرسال', empty: 'لا توجد محادثات', emptySub: 'ستظهر محادثاتك مع مقدمات الخدمات هنا.' },
  }[lang];

  const activeConv = conversations.find(c => c.id === activeChat);

  if (activeChat && activeConv) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'white', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 40 }}>
          <button onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#59364A' }}>←</button>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(89,54,74,0.1), rgba(199,125,105,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{activeConv.icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#292929', margin: 0 }}>{activeConv.name}</p>
            <p style={{ fontSize: 11, color: activeConv.online ? '#A8B5A2' : '#aaa', margin: 0 }}>{activeConv.online ? `● ${T.online}` : activeConv.service}</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['fr', 'ar'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? '#59364A' : '#f5f5f5', color: lang === l ? 'white' : '#888', border: 'none', padding: '3px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingBottom: 80 }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'me' ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start') }}>
              <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: msg.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.from === 'me' ? '#59364A' : 'white', color: msg.from === 'me' ? 'white' : '#292929', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <p style={{ fontSize: 13, margin: '0 0 4px', lineHeight: 1.5 }}>{isRTL ? msg.textAr : msg.text}</p>
                <p style={{ fontSize: 10, margin: 0, opacity: 0.7, textAlign: 'right' }}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 10 }}>
          <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder={T.typeMsg}
            style={{ flex: 1, padding: '10px 16px', borderRadius: 9999, border: '1px solid #e5e7eb', background: '#FAF7F2', fontSize: 14, outline: 'none' }} />
          <button onClick={() => setNewMsg('')}
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #59364A, #C77D69)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ➤
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', paddingBottom: 100 }}>
      <div style={{ background: 'white', padding: '16px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#292929', margin: 0 }}>{T.title}</h1>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['fr', 'ar'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? '#59364A' : '#f5f5f5', color: lang === l ? 'white' : '#888', border: 'none', padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <input placeholder={T.search} style={{ width: '100%', padding: '10px 16px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#FAF7F2', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {conversations.map((conv, i) => (
          <button key={conv.id} onClick={() => setActiveChat(conv.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'white', border: 'none', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', textAlign: isRTL ? 'right' : 'left', width: '100%' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(89,54,74,0.1), rgba(199,125,105,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{conv.icon}</div>
              {conv.online && <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#A8B5A2', border: '2px solid white' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#292929', margin: 0 }}>{conv.name}</p>
                <span style={{ fontSize: 11, color: '#aaa' }}>{conv.time}</span>
              </div>
              <p style={{ fontSize: 12, color: '#888', margin: '0 0 2px' }}>{conv.service}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 13, color: conv.unread > 0 ? '#292929' : '#aaa', fontWeight: conv.unread > 0 ? 600 : 400, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
                  {isRTL ? conv.lastMsgAr : conv.lastMsg}
                </p>
                {conv.unread > 0 && (
                  <span style={{ background: '#59364A', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{conv.unread}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bottom-nav">
        {[
          { icon: '🏠', label: lang === 'fr' ? 'Accueil' : 'الرئيسية', href: '/' },
          { icon: '🔍', label: lang === 'fr' ? 'Rechercher' : 'بحث', href: '/rechercher' },
          { icon: '➕', label: lang === 'fr' ? 'Publier' : 'نشر', href: '/publier', special: true },
          { icon: '💬', label: lang === 'fr' ? 'Messages' : 'رسائل', href: '/messages', active: true },
          { icon: '👤', label: lang === 'fr' ? 'Profil' : 'ملفي', href: '/profil' },
        ].map((item, i) => (
          <a key={i} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', flex: 1 }}>
            {item.special ? (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #59364A, #C77D69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white', boxShadow: '0 4px 12px rgba(89,54,74,0.4)', marginTop: -20 }}>{item.icon}</div>
            ) : (
              <span style={{ fontSize: 22 }}>{item.icon}</span>
            )}
            <span style={{ fontSize: 10, fontWeight: (item as any).active ? 700 : 500, color: (item as any).active ? '#59364A' : '#888' }}>{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
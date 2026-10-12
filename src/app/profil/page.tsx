'use client';
import { useState } from 'react';

type Lang = 'fr' | 'ar';

export default function Profil() {
  const [lang, setLang] = useState<Lang>('fr');
  const [activeTab, setActiveTab] = useState<'services' | 'avis' | 'galerie'>('services');
  const isRTL = lang === 'ar';

  const labels = {
    fr: {
      verified: '✓ Identité vérifiée',
      contact: 'Contacter',
      request: 'Demander un devis',
      services: 'Services',
      reviews: 'Avis',
      gallery: 'Galerie',
      about: 'À propos',
      availability: 'Disponibilités',
      availDays: 'Lun · Mar · Jeu · Sam',
      from: 'À partir de',
      experience: "5 ans d'expérience",
      selfTaught: 'Autodidacte passionnée',
      bio: "Passionnée de cuisine traditionnelle algérienne depuis mon enfance. Je propose des plats faits maison avec des ingrédients frais et naturels. Spécialiste en pâtisserie orientale et couscous.",
    },
    ar: {
      verified: '✓ هوية موثقة',
      contact: 'تواصلي معها',
      request: 'طلب عرض سعر',
      services: 'الخدمات',
      reviews: 'التقييمات',
      gallery: 'معرض الأعمال',
      about: 'نبذة عنها',
      availability: 'أوقات التوفر',
      availDays: 'الإثنين · الثلاثاء · الخميس · السبت',
      from: 'ابتداءً من',
      experience: '5 سنوات خبرة',
      selfTaught: 'متعلمة ذاتياً',
      bio: 'شغوفة بالطبخ الجزائري التقليدي منذ طفولتي. أقدم أطباقاً منزلية بمكونات طازجة وطبيعية. متخصصة في الحلويات الشرقية والكسكس.',
    }
  };

  const L = labels[lang];

  const services = [
    { icon: '🍲', name: lang === 'fr' ? 'Cuisine traditionnelle' : 'طبخ تقليدي', price: '1500 DA', time: lang === 'fr' ? 'par plat' : 'للطبق' },
    { icon: '🎂', name: lang === 'fr' ? 'Pâtisserie orientale' : 'حلويات شرقية', price: '2000 DA', time: lang === 'fr' ? 'par kg' : 'للكيلو' },
    { icon: '🥘', name: lang === 'fr' ? 'Couscous complet' : 'كسكس كامل', price: '3500 DA', time: lang === 'fr' ? 'pour 6 pers.' : 'لـ 6 أشخاص' },
  ];

  const reviews = [
    { name: 'Fatima S.', rating: 5, comment: lang === 'fr' ? 'Excellente cuisinière ! Le couscous était délicieux.' : 'طباخة رائعة! الكسكس كان لذيذاً جداً.', date: 'Oct 2026' },
    { name: 'Nadia B.', rating: 5, comment: lang === 'fr' ? 'Très professionnelle et ponctuelle. Je recommande !' : 'محترفة جداً ودقيقة في المواعيد. أنصح بها!', date: 'Sep 2026' },
    { name: 'Meriem K.', rating: 4, comment: lang === 'fr' ? 'Très bon travail, les gâteaux étaient parfaits.' : 'عمل رائع، الحلويات كانت مثالية.', date: 'Sep 2026' },
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', paddingBottom: 100 }}>

      {/* Cover */}
      <div style={{ height: 180, background: 'linear-gradient(135deg, #59364A, #C77D69)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', fontSize: 18, cursor: 'pointer' }}>←</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['fr','ar'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? 'white' : 'rgba(255,255,255,0.2)', color: lang === l ? '#59364A' : 'white', border: 'none', padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Avatar + infos */}
      <div style={{ background: 'white', padding: '0 20px 20px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -40, marginBottom: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #59364A, #C77D69)', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
            👩‍🍳
          </div>
          <div style={{ paddingBottom: 4, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#292929', margin: 0 }}>Amina Benali</h1>
              <span style={{ background: '#A8B5A2', color: 'white', fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 500 }}>{L.verified}</span>
            </div>
            <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>📍 Alger · 1.2 km</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', background: '#FAF7F2', borderRadius: 16, padding: '12px 0', marginBottom: 16 }}>
          {[
            { value: '4.9', label: '⭐ Note' },
            { value: '47', label: lang === 'fr' ? 'Avis' : 'تقييم' },
            { value: '120+', label: lang === 'fr' ? 'Prestations' : 'خدمة' },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid #e5e7eb' : 'none' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#59364A' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" style={{ flex: 1, padding: '12px' }}>{L.contact}</button>
          <button className="btn-outline" style={{ flex: 1, padding: '12px' }}>{L.request}</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: 12 }}>
        {([['services', L.services], ['avis', L.reviews], ['galerie', L.gallery]] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '14px 0', fontSize: 13, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', color: activeTab === tab ? '#59364A' : '#888', borderBottom: activeTab === tab ? '2px solid #59364A' : '2px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div style={{ padding: '0 16px' }}>

        {activeTab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#59364A', marginBottom: 8 }}>{L.about}</h3>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{L.bio}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {[L.experience, L.selfTaught].map(tag => (
                  <span key={tag} style={{ background: '#FAF7F2', border: '1px solid rgba(89,54,74,0.2)', color: '#59364A', fontSize: 11, padding: '4px 10px', borderRadius: 9999, fontWeight: 500 }}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#59364A', marginBottom: 8 }}>{L.availability}</h3>
              <p style={{ fontSize: 13, color: '#555' }}>🗓 {L.availDays}</p>
              <p style={{ fontSize: 13, color: '#555', marginTop: 4 }}>🕐 09:00 – 18:00</p>
            </div>

            {services.map((s, i) => (
              <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 32 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#292929', margin: 0 }}>{s.name}</p>
                  <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{s.time}</p>
                </div>
                <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                  <p style={{ fontSize: 11, color: '#888', margin: '0 0 2px' }}>{L.from}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#C77D69', margin: 0 }}>{s.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'avis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((r, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0ebee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#292929', margin: 0 }}>{r.name}</p>
                      <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{r.date}</p>
                    </div>
                  </div>
                  <div style={{ fontSize: 13 }}>{'⭐'.repeat(r.rating)}</div>
                </div>
                <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.5 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'galerie' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {['🍲','🎂','🥘','🍰','🫕','🍮'].map((emoji, i) => (
              <div key={i} style={{ aspectRatio: '1', background: 'linear-gradient(135deg, rgba(89,54,74,0.1), rgba(199,125,105,0.1))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, cursor: 'pointer' }}>
                {emoji}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
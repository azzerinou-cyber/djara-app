'use client';
import { useState } from 'react';

type Lang = 'fr' | 'ar';

const categories = [
  { icon: '🏠', fr: 'Maison', ar: 'المنزل' },
  { icon: '💄', fr: 'Beauté', ar: 'الجمال' },
  { icon: '📚', fr: 'Éducation', ar: 'التعليم' },
  { icon: '🎨', fr: 'Artisanat', ar: 'الحرف' },
  { icon: '💻', fr: 'Digital', ar: 'الرقمي' },
  { icon: '🎉', fr: 'Événements', ar: 'الأحداث' },
];

const wilayas = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Tlemcen'];

const results = [
  { name: 'Amina B.', service: 'Cuisine traditionnelle', serviceAr: 'طبخ تقليدي', rating: 4.9, reviews: 47, location: 'Alger', distance: '1.2 km', price: '1500 DA', icon: '👩‍🍳', verified: true },
  { name: 'Sara M.', service: 'Coiffure & Soins', serviceAr: 'تصفيف الشعر', rating: 4.8, reviews: 32, location: 'Alger', distance: '2.1 km', price: '800 DA', icon: '💇‍♀️', verified: true },
  { name: 'Lina K.', service: 'Soutien scolaire', serviceAr: 'دروس خصوصية', rating: 4.7, reviews: 28, location: 'Alger', distance: '3.5 km', price: '500 DA', icon: '👩‍🏫', verified: false },
  { name: 'Yasmine R.', service: 'Broderie & Couture', serviceAr: 'تطريز وخياطة', rating: 5.0, reviews: 15, location: 'Alger', distance: '4.2 km', price: '600 DA', icon: '🪡', verified: true },
  { name: 'Nadia T.', service: 'Community Management', serviceAr: 'إدارة المجتمع', rating: 4.6, reviews: 21, location: 'Alger', distance: '5.0 km', price: '3000 DA', icon: '📱', verified: false },
];

const distances = ['1 km', '3 km', '5 km', '10 km', '25 km', '50 km'];

export default function Rechercher() {
  const [lang, setLang] = useState<Lang>('fr');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState('Alger');
  const [selectedDist, setSelectedDist] = useState('5 km');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const isRTL = lang === 'ar';

  const L = {
    fr: {
      title: 'Rechercher',
      placeholder: 'Coiffure, cuisine, couture...',
      filters: 'Filtres',
      allCats: 'Toutes',
      wilaya: 'Wilaya',
      distance: 'Distance',
      sort: 'Trier par',
      sortOptions: ['Pertinence', 'Distance', 'Note', 'Prix'],
      results: (n: number) => `${n} prestataires trouvées`,
      verified: '✓ Vérifiée',
      reviews: 'avis',
      from: 'À partir de',
      noResults: 'Aucune prestataire trouvée dans cette zone.',
      expand: 'Élargir la recherche',
      list: 'Liste',
      map: 'Carte',
    },
    ar: {
      title: 'البحث',
      placeholder: 'تصفيف، طبخ، خياطة...',
      filters: 'تصفية',
      allCats: 'الكل',
      wilaya: 'الولاية',
      distance: 'المسافة',
      sort: 'ترتيب حسب',
      sortOptions: ['الصلة', 'المسافة', 'التقييم', 'السعر'],
      results: (n: number) => `${n} مقدمة خدمات`,
      verified: '✓ موثقة',
      reviews: 'تقييم',
      from: 'ابتداءً من',
      noResults: 'لم يتم العثور على أي مقدمة خدمات في هذه المنطقة.',
      expand: 'توسيع نطاق البحث',
      list: 'قائمة',
      map: 'خريطة',
    },
  };
  const T = L[lang];

  const filtered = results.filter(r =>
    (!search || r.service.toLowerCase().includes(search.toLowerCase()) || r.serviceAr.includes(search)) &&
    (selectedCat === null || true)
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: 'white', padding: '16px 16px 0', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#292929', margin: 0 }}>{T.title}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {(['fr', 'ar'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ background: lang === l ? '#59364A' : '#f5f5f5', color: lang === l ? 'white' : '#888', border: 'none', padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Barre de recherche */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', [isRTL ? 'right' : 'left']: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={T.placeholder}
            style={{ width: '100%', padding: isRTL ? '12px 44px 12px 50px' : '12px 50px 12px 44px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#FAF7F2', fontSize: 14, color: '#292929', outline: 'none', boxSizing: 'border-box' }}
          />
          <button onClick={() => setShowFilters(!showFilters)}
            style={{ position: 'absolute', [isRTL ? 'left' : 'right']: 8, top: '50%', transform: 'translateY(-50%)', background: showFilters ? '#59364A' : 'white', color: showFilters ? 'white' : '#59364A', border: '1px solid #59364A', padding: '6px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {T.filters}
          </button>
        </div>

        {/* Filtres expanded */}
        {showFilters && (
          <div style={{ background: '#FAF7F2', borderRadius: 12, padding: 12, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', fontWeight: 600 }}>{T.wilaya}</p>
                <select value={selectedWilaya} onChange={e => setSelectedWilaya(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', fontSize: 13, color: '#292929' }}>
                  {wilayas.map(w => <option key={w}>{w}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', fontWeight: 600 }}>{T.distance}</p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {distances.map(d => (
                    <button key={d} onClick={() => setSelectedDist(d)}
                      style={{ padding: '5px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, border: '1px solid', borderColor: selectedDist === d ? '#59364A' : '#e5e7eb', background: selectedDist === d ? '#59364A' : 'white', color: selectedDist === d ? 'white' : '#888', cursor: 'pointer' }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Catégories */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
          <button onClick={() => setSelectedCat(null)}
            style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 600, border: '1px solid', borderColor: selectedCat === null ? '#59364A' : '#e5e7eb', background: selectedCat === null ? '#59364A' : 'white', color: selectedCat === null ? 'white' : '#888', cursor: 'pointer' }}>
            {T.allCats}
          </button>
          {categories.map((cat, i) => (
            <button key={i} onClick={() => setSelectedCat(i === selectedCat ? null : i)}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 600, border: '1px solid', borderColor: selectedCat === i ? '#59364A' : '#e5e7eb', background: selectedCat === i ? '#59364A' : 'white', color: selectedCat === i ? 'white' : '#888', cursor: 'pointer' }}>
              {cat.icon} {isRTL ? cat.ar : cat.fr}
            </button>
          ))}
        </div>
      </div>

      {/* Résultats header */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{T.results(filtered.length)}</p>
        <div style={{ display: 'flex', background: 'white', borderRadius: 9999, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {(['list', 'map'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, border: 'none', background: viewMode === mode ? '#59364A' : 'white', color: viewMode === mode ? 'white' : '#888', cursor: 'pointer' }}>
              {mode === 'list' ? T.list : T.map}
            </button>
          ))}
        </div>
      </div>

      {/* Résultats */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 15, color: '#292929', fontWeight: 600, marginBottom: 8 }}>{T.noResults}</p>
            <button className="btn-primary" style={{ marginTop: 8 }}>{T.expand}</button>
          </div>
        ) : (
          filtered.map((r, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: 14, cursor: 'pointer' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, rgba(89,54,74,0.1), rgba(199,125,105,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>
                {r.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#292929', margin: 0 }}>{r.name}</p>
                      {r.verified && <span style={{ background: '#A8B5A2', color: 'white', fontSize: 10, padding: '1px 6px', borderRadius: 9999, fontWeight: 600 }}>{T.verified}</span>}
                    </div>
                    <p style={{ fontSize: 13, color: '#888', margin: '2px 0 0' }}>{isRTL ? r.serviceAr : r.service}</p>
                  </div>
                  <div style={{ textAlign: isRTL ? 'left' : 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 11, color: '#888', margin: '0 0 2px' }}>{T.from}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#C77D69', margin: 0 }}>{r.price}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: '#555' }}>⭐ {r.rating} ({r.reviews} {T.reviews})</span>
                  <span style={{ fontSize: 12, color: '#A8B5A2' }}>📍 {r.distance}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        {[
          { icon: '🏠', label: lang === 'fr' ? 'Accueil' : 'الرئيسية', href: '/' },
          { icon: '🔍', label: lang === 'fr' ? 'Rechercher' : 'بحث', href: '/rechercher', active: true },
          { icon: '➕', label: lang === 'fr' ? 'Publier' : 'نشر', href: '/publier', special: true },
          { icon: '💬', label: lang === 'fr' ? 'Messages' : 'رسائل', href: '/messages' },
          { icon: '👤', label: lang === 'fr' ? 'Profil' : 'ملفي', href: '/profil' },
        ].map((item, i) => (
          <a key={i} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', flex: 1 }}>
            {item.special ? (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #59364A, #C77D69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white', boxShadow: '0 4px 12px rgba(89,54,74,0.4)', marginTop: -20 }}>
                {item.icon}
              </div>
            ) : (
              <span style={{ fontSize: 22 }}>{item.icon}</span>
            )}
            <span style={{ fontSize: 10, fontWeight: item.active ? 700 : 500, color: item.active ? '#59364A' : '#888' }}>{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
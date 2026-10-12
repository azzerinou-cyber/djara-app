'use client';
import { useState } from 'react';
import Link from 'next/link';

type Lang = 'fr' | 'ar';

const wilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
  'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj',
  'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal',
  'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet',
  'El M\'Ghair', 'El Meniaa'
];

const categories = [
  { icon: '🍳', fr: 'Maison & Quotidien', ar: 'المنزل' },
  { icon: '💄', fr: 'Beauté & Soins', ar: 'الجمال' },
  { icon: '📚', fr: 'Éducation', ar: 'التعليم' },
  { icon: '🧵', fr: 'Couture & Artisanat', ar: 'الحرف' },
  { icon: '💻', fr: 'Digital', ar: 'الرقمي' },
  { icon: '🎉', fr: 'Événements', ar: 'الفعاليات' },
];

const rayons = ['5 km', '10 km', '25 km', '50 km', 'National'];

// Données mockées — seront remplacées par Supabase
const prestataires = [
  { id: 1, prenom: 'Yasmine', metier: 'Coiffeuse professionnelle', wilaya: 'Alger', commune: 'Bab El Oued', note: 4.9, avis: 47, tarifMin: 500, badge: true, categorie: '💄', dispo: true },
  { id: 2, prenom: 'Nadia', metier: 'Pâtissière traditionnelle', wilaya: 'Alger', commune: 'El Harrach', note: 4.8, avis: 31, tarifMin: 300, badge: true, categorie: '🍳', dispo: true },
  { id: 3, prenom: 'Houria', metier: 'Prof de soutien scolaire', wilaya: 'Alger', commune: 'Hussein Dey', note: 5.0, avis: 22, tarifMin: 800, badge: false, categorie: '📚', dispo: false },
  { id: 4, prenom: 'Souad', metier: 'Créatrice de robes kabyles', wilaya: 'Alger', commune: 'Birkhadem', note: 4.7, avis: 18, tarifMin: 2000, badge: true, categorie: '🧵', dispo: true },
  { id: 5, prenom: 'Meriem', metier: 'Community Manager', wilaya: 'Alger', commune: 'Kouba', note: 4.6, avis: 12, tarifMin: 1500, badge: false, categorie: '💻', dispo: true },
];

export default function RechercherPage() {
  const [lang, setLang] = useState<Lang>('fr');
  const isRTL = lang === 'ar';
  const [search, setSearch] = useState('');
  const [wilayaSelect, setWilayaSelect] = useState('Alger');
  const [catSelect, setCatSelect] = useState('');
  const [rayon, setRayon] = useState('10 km');
  const [vue, setVue] = useState<'liste' | 'carte'>('liste');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [prixMax, setPrixMax] = useState(5000);
  const [dispoDispo, setDispoDispo] = useState(false);
  const [badgeOnly, setBadgeOnly] = useState(false);

  const filtered = prestataires.filter(p => {
    const matchSearch = !search || p.prenom.toLowerCase().includes(search.toLowerCase()) || p.metier.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catSelect || p.categorie === catSelect;
    const matchDispo = !dispoDispo || p.dispo;
    const matchBadge = !badgeOnly || p.badge;
    const matchPrix = p.tarifMin <= prixMax;
    return matchSearch && matchCat && matchDispo && matchBadge && matchPrix;
  });

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 80 }}>

      {/* Header */}
      <header style={{ background: '#59364A', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ color: '#FAF7F2', fontSize: 18, fontWeight: 900 }}>🔍 {lang === 'fr' ? 'Rechercher' : 'بحث'}</div>
          <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 11 }}>{lang === 'fr' ? `${filtered.length} prestataires trouvées` : `${filtered.length} نتيجة`}</div>
        </div>
        <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>
          {lang === 'fr' ? 'عربي' : 'FR'}
        </button>
      </header>

      {/* Barre de recherche */}
      <div style={{ background: '#fff', padding: '16px 20px', boxShadow: '0 2px 8px rgba(89,54,74,0.08)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'fr' ? '🔍 Coiffure, cuisine, couture...' : '🔍 ابحثي...'}
            style={{ flex: 1, padding: '11px 16px', borderRadius: 25, border: '2px solid #e8ddd6', fontSize: 14, outline: 'none', color: '#292929', background: '#FAF7F2' }}
          />
          <button onClick={() => setFiltersOpen(!filtersOpen)} style={{ background: filtersOpen ? '#59364A' : '#FAF7F2', border: '2px solid ' + (filtersOpen ? '#59364A' : '#e8ddd6'), color: filtersOpen ? '#fff' : '#59364A', borderRadius: 25, padding: '0 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            ⚙️ {lang === 'fr' ? 'Filtres' : 'فلتر'}
          </button>
        </div>

        {/* Wilaya + Rayon */}
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={wilayaSelect} onChange={e => setWilayaSelect(e.target.value)} style={{ flex: 1, padding: '9px 12px', borderRadius: 20, border: '2px solid #e8ddd6', fontSize: 13, color: '#292929', background: '#FAF7F2', outline: 'none' }}>
            {wilayas.map(w => <option key={w}>{w}</option>)}
          </select>
          <select value={rayon} onChange={e => setRayon(e.target.value)} style={{ padding: '9px 12px', borderRadius: 20, border: '2px solid #e8ddd6', fontSize: 13, color: '#292929', background: '#FAF7F2', outline: 'none' }}>
            {rayons.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Filtres avancés */}
        {filtersOpen && (
          <div style={{ marginTop: 14, padding: '16px', background: '#FAF7F2', borderRadius: 16, border: '1px solid #e8ddd6' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#59364A', marginBottom: 12 }}>{lang === 'fr' ? 'Filtres avancés' : 'فلاتر متقدمة'}</div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{lang === 'fr' ? `Prix max : ${prixMax.toLocaleString()} DA` : `السعر الأقصى: ${prixMax.toLocaleString()} دج`}</div>
              <input type="range" min={200} max={10000} step={100} value={prixMax} onChange={e => setPrixMax(+e.target.value)}
                style={{ width: '100%', accentColor: '#C77D69' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#292929', cursor: 'pointer' }}>
                <input type="checkbox" checked={dispoDispo} onChange={e => setDispoDispo(e.target.checked)} style={{ accentColor: '#59364A' }} />
                {lang === 'fr' ? 'Disponibles' : 'المتاحات'}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#292929', cursor: 'pointer' }}>
                <input type="checkbox" checked={badgeOnly} onChange={e => setBadgeOnly(e.target.checked)} style={{ accentColor: '#59364A' }} />
                {lang === 'fr' ? 'Profil vérifié ✓' : 'موثقة ✓'}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Catégories chips */}
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button onClick={() => setCatSelect('')} style={{ padding: '7px 16px', borderRadius: 20, border: '2px solid ' + (!catSelect ? '#59364A' : '#e8ddd6'), background: !catSelect ? '#59364A' : '#fff', color: !catSelect ? '#FAF7F2' : '#292929', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}>
          {lang === 'fr' ? 'Toutes' : 'الكل'}
        </button>
        {categories.map(cat => (
          <button key={cat.icon} onClick={() => setCatSelect(catSelect === cat.icon ? '' : cat.icon)} style={{ padding: '7px 14px', borderRadius: 20, border: '2px solid ' + (catSelect === cat.icon ? '#C77D69' : '#e8ddd6'), background: catSelect === cat.icon ? '#C77D69' : '#fff', color: catSelect === cat.icon ? '#fff' : '#292929', fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            {cat.icon} {lang === 'fr' ? cat.fr : cat.ar}
          </button>
        ))}
      </div>

      {/* Toggle vue */}
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
        <button onClick={() => setVue('liste')}
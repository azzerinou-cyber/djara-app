<<<<<<< HEAD
'use client'
=======
'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
>>>>>>> 6a61080cb3429c590d3b6008d4b91683d925e01d

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

<<<<<<< HEAD
interface Service {
  id: string
  title: string
  description: string
  wilaya: string
  commune: string
  price_min: number | null
  price_max: number | null
  price_type: string
  categories: { name_fr: string; icon: string }
  profiles: { display_name: string; avatar_url: string | null; trust_level: number }
}

export default function RechercherPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [wilaya, setWilaya] = useState('')
  const [categorySlug, setCategorySlug] = useState('')

  useEffect(() => {
    fetchServices()
  }, [wilaya, categorySlug])

  async function fetchServices() {
    setLoading(true)
    let query = supabase
      .from('services')
      .select(`
        id, title, description, wilaya, commune,
        price_min, price_max, price_type,
        categories(name_fr, icon),
        profiles(display_name, avatar_url, trust_level)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (wilaya) query = query.eq('wilaya', wilaya)

    const { data, error } = await query

    if (!error && data) setServices(data as unknown as Service[])
    setLoading(false)
  }
=======
interface ServiceResult {
  service_id: string;
  title: string;
  provider_name: string;
  category_fr: string;
  category_ar: string;
  category_icon: string;
  wilaya: string;
  commune: string;
  price_min: number | null;
  price_max: number | null;
  price_unit: string | null;
  is_available: boolean;
  is_remote: boolean;
  avg_rating: number;
  review_count: number;
  trust_level: number;
  is_verified: boolean;
  distance_km?: number;
}

const wilayas = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
  'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  "M'Sila", 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj',
  'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal',
  'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet',
  "El M'Ghair", 'El Meniaa',
];

const CATEGORY_SLUGS: Record<string, string> = {
  '🍳': 'maison',
  '💄': 'beaute',
  '📚': 'education',
  '🧵': 'artisanat',
  '💻': 'digital',
  '🎉': 'evenements',
};

const categories = [
  { icon: '🍳', fr: 'Maison & Quotidien', ar: 'المنزل' },
  { icon: '💄', fr: 'Beauté & Soins',     ar: 'الجمال' },
  { icon: '📚', fr: 'Éducation',           ar: 'التعليم' },
  { icon: '🧵', fr: 'Couture & Artisanat', ar: 'الحرف' },
  { icon: '💻', fr: 'Digital',             ar: 'الرقمي' },
  { icon: '🎉', fr: 'Événements',          ar: 'الفعاليات' },
];

export default function RechercherPage() {
  const [lang, setLang] = useState<Lang>('fr');
  const isRTL = lang === 'ar';

  const [search, setSearch] = useState('');
  const [wilayaSelect, setWilayaSelect] = useState('Alger');
  const [catIcon, setCatIcon] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [prixMax, setPrixMax] = useState(5000);
  const [dispoDispo, setDispoDispo] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [services, setServices] = useState<ServiceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chargement des services depuis Supabase
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const catSlug = catIcon ? CATEGORY_SLUGS[catIcon] : undefined;

      const { data, error: rpcError } = await supabase.rpc('search_services_by_wilaya', {
        p_wilaya: wilayaSelect,
        cat_slug: catSlug ?? null,
        max_price: prixMax,
      });

      if (rpcError) throw rpcError;
      setServices((data as ServiceResult[]) ?? []);
    } catch (err) {
      console.error('Erreur chargement services:', err);
      setError('Impossible de charger les services. Veuillez réessayer.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [wilayaSelect, catIcon, prixMax]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Filtrage côté client (recherche texte, dispo, vérifié)
  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.title.toLowerCase().includes(q) ||
      s.provider_name.toLowerCase().includes(q) ||
      s.category_fr.toLowerCase().includes(q);
    const matchDispo = !dispoDispo || s.is_available;
    const matchVerif = !verifiedOnly || s.is_verified;
    return matchSearch && matchDispo && matchVerif;
  });
>>>>>>> 6a61080cb3429c590d3b6008d4b91683d925e01d

  // Formatage prix
  const formatPrix = (s: ServiceResult) => {
    if (!s.price_min && !s.price_max) return null;
    if (s.price_min && s.price_max && s.price_min !== s.price_max)
      return `${s.price_min.toLocaleString()} – ${s.price_max.toLocaleString()} DA`;
    return `${(s.price_min ?? s.price_max ?? 0).toLocaleString()} DA`;
  };

  return (
    <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#59364A', marginBottom: '24px' }}>Rechercher un service</h1>

<<<<<<< HEAD
      <input
        placeholder="Filtrer par wilaya..."
        value={wilaya}
        onChange={e => setWilaya(e.target.value)}
        style={{
          width: '100%', padding: '12px', marginBottom: '24px',
          border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px'
        }}
      />

      {loading && <p style={{ color: '#888' }}>Chargement...</p>}

      {!loading && services.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '48px' }}>
          Aucun service trouvé. Soyez la première à publier ! 🌸
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {services.map(service => (
          <div key={service.id} style={{
            background: '#fff', borderRadius: '12px',
            padding: '20px', border: '1px solid #eee',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#C77D69', fontWeight: 600 }}>
                  {service.categories?.icon} {service.categories?.name_fr}
                </span>
                <h2 style={{ color: '#292929', margin: '4px 0 8px', fontSize: '18px' }}>
                  {service.title}
                </h2>
                <p style={{ color: '#666', fontSize: '14px', margin: '0 0 12px' }}>
                  {service.description}
                </p>
                <p style={{ color: '#888', fontSize: '13px' }}>
                  📍 {service.commune}, {service.wilaya}
                </p>
              </div>
              {service.price_min && (
                <div style={{
                  background: '#FAF7F2', borderRadius: '8px',
                  padding: '8px 14px', textAlign: 'center', minWidth: '80px'
                }}>
                  <p style={{ color: '#59364A', fontWeight: 700, margin: 0 }}>
                    {service.price_min} DA
                  </p>
                </div>
              )}
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '12px', paddingTop: '12px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>
                👤 {service.profiles?.display_name}
                {service.profiles?.trust_level >= 2 && ' ✓'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
=======
      {/* Header */}
      <header style={{ background: '#59364A', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ color: '#FAF7F2', fontSize: 18, fontWeight: 900 }}>
            🔍 {lang === 'fr' ? 'Rechercher' : 'بحث'}
          </div>
          <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 11 }}>
            {loading
              ? (lang === 'fr' ? 'Chargement...' : 'جاري التحميل...')
              : lang === 'fr'
                ? `${filtered.length} prestataire${filtered.length !== 1 ? 's' : ''} trouvée${filtered.length !== 1 ? 's' : ''}`
                : `${filtered.length} نتيجة`}
          </div>
        </div>
        <button
          onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}
        >
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
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{ background: filtersOpen ? '#59364A' : '#FAF7F2', border: '2px solid ' + (filtersOpen ? '#59364A' : '#e8ddd6'), color: filtersOpen ? '#fff' : '#59364A', borderRadius: 25, padding: '0 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
          >
            ⚙️ {lang === 'fr' ? 'Filtres' : 'فلتر'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={wilayaSelect}
            onChange={e => setWilayaSelect(e.target.value)}
            style={{ flex: 1, padding: '9px 12px', borderRadius: 20, border: '2px solid #e8ddd6', fontSize: 13, color: '#292929', background: '#FAF7F2', outline: 'none' }}
          >
            {wilayas.map(w => <option key={w}>{w}</option>)}
          </select>
        </div>

        {filtersOpen && (
          <div style={{ marginTop: 14, padding: '16px', background: '#FAF7F2', borderRadius: 16, border: '1px solid #e8ddd6' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#59364A', marginBottom: 12 }}>
              {lang === 'fr' ? 'Filtres avancés' : 'فلاتر متقدمة'}
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                {lang === 'fr' ? `Prix max : ${prixMax.toLocaleString()} DA` : `السعر الأقصى: ${prixMax.toLocaleString()} دج`}
              </div>
              <input type="range" min={200} max={10000} step={100} value={prixMax}
                onChange={e => setPrixMax(+e.target.value)}
                style={{ width: '100%', accentColor: '#C77D69' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#292929', cursor: 'pointer' }}>
                <input type="checkbox" checked={dispoDispo} onChange={e => setDispoDispo(e.target.checked)} style={{ accentColor: '#59364A' }} />
                {lang === 'fr' ? 'Disponibles' : 'المتاحات'}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#292929', cursor: 'pointer' }}>
                <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} style={{ accentColor: '#59364A' }} />
                {lang === 'fr' ? 'Profil vérifié ✓' : 'موثقة ✓'}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Catégories chips */}
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setCatIcon('')}
          style={{ padding: '7px 16px', borderRadius: 20, border: '2px solid ' + (!catIcon ? '#59364A' : '#e8ddd6'), background: !catIcon ? '#59364A' : '#fff', color: !catIcon ? '#FAF7F2' : '#292929', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}
        >
          {lang === 'fr' ? 'Toutes' : 'الكل'}
        </button>
        {categories.map(cat => (
          <button
            key={cat.icon}
            onClick={() => setCatIcon(catIcon === cat.icon ? '' : cat.icon)}
            style={{ padding: '7px 14px', borderRadius: 20, border: '2px solid ' + (catIcon === cat.icon ? '#C77D69' : '#e8ddd6'), background: catIcon === cat.icon ? '#C77D69' : '#fff', color: catIcon === cat.icon ? '#fff' : '#292929', fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {cat.icon} {lang === 'fr' ? cat.fr : cat.ar}
          </button>
        ))}
      </div>

      {/* Résultats */}
      <div style={{ padding: '16px 20px' }}>

        {/* État chargement */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 12 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #e8ddd6', borderTopColor: '#59364A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: '#999', fontSize: 13 }}>{lang === 'fr' ? 'Recherche en cours...' : 'جاري البحث...'}</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px', textAlign: 'center', color: '#dc2626', fontSize: 13 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
            {error}
            <button onClick={fetchServices} style={{ display: 'block', margin: '12px auto 0', background: '#59364A', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 20px', cursor: 'pointer', fontSize: 13 }}>
              {lang === 'fr' ? 'Réessayer' : 'حاولي مجدداً'}
            </button>
          </div>
        )}

        {/* État vide */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
            <div style={{ color: '#59364A', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {lang === 'fr' ? 'Aucune prestataire trouvée' : 'لا توجد نتائج'}
            </div>
            <div style={{ color: '#999', fontSize: 13, marginBottom: 20 }}>
              {lang === 'fr'
                ? 'Essayez une autre wilaya ou supprimez les filtres'
                : 'جربي ولاية أخرى أو أزيلي الفلاتر'}
            </div>
            <button
              onClick={() => { setCatIcon(''); setSearch(''); setDispoDispo(false); setVerifiedOnly(false); setPrixMax(5000); }}
              style={{ background: '#59364A', color: '#FAF7F2', border: 'none', borderRadius: 25, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              {lang === 'fr' ? 'Réinitialiser les filtres' : 'إعادة ضبط الفلاتر'}
            </button>
          </div>
        )}

        {/* Liste des services */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(s => {
              const prix = formatPrix(s);
              return (
                <Link
                  key={s.service_id}
                  href={`/profil/${s.service_id}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{ background: '#fff', borderRadius: 18, padding: '18px', boxShadow: '0 2px 12px rgba(89,54,74,0.07)', border: '1px solid #f0e8e0', transition: 'box-shadow 0.2s' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

                      {/* Avatar */}
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #59364A, #C77D69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                        {s.category_icon || '🌸'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Nom + badges */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div>
                            <div style={{ color: '#292929', fontSize: 15, fontWeight: 700 }}>{s.provider_name}</div>
                            <div style={{ color: '#666', fontSize: 13, marginTop: 2 }}>{s.title}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            {s.is_verified && (
                              <span style={{ background: '#59364A', color: '#FAF7F2', fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 20 }}>✓ VÉR</span>
                            )}
                            {s.is_available
                              ? <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 20 }}>DISPO</span>
                              : <span style={{ background: '#f3f4f6', color: '#9ca3af', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 20 }}>OCCUPÉE</span>
                            }
                          </div>
                        </div>

                        {/* Localisation */}
                        <div style={{ color: '#A8B5A2', fontSize: 12, marginTop: 6 }}>
                          📍 {s.commune ? `${s.commune}, ` : ''}{s.wilaya}
                          {s.is_remote && <span style={{ marginLeft: 8, color: '#C77D69' }}>🌐 {lang === 'fr' ? 'En ligne' : 'عن بُعد'}</span>}
                          {s.distance_km != null && <span style={{ marginLeft: 8 }}>· {s.distance_km} km</span>}
                        </div>

                        {/* Note + prix */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {s.review_count > 0 ? (
                              <>
                                <span style={{ color: '#f59e0b', fontSize: 13 }}>★</span>
                                <span style={{ color: '#292929', fontSize: 13, fontWeight: 700 }}>{s.avg_rating}</span>
                                <span style={{ color: '#999', fontSize: 12 }}>({s.review_count})</span>
                              </>
                            ) : (
                              <span style={{ color: '#999', fontSize: 12 }}>{lang === 'fr' ? 'Nouveau profil' : 'ملف جديد'}</span>
                            )}
                          </div>
                          {prix && (
                            <div style={{ color: '#59364A', fontSize: 14, fontWeight: 700 }}>
                              {prix}
                              {s.price_unit && <span style={{ color: '#999', fontSize: 11, fontWeight: 400 }}> / {s.price_unit}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Nav bas */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e8e0', display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', boxShadow: '0 -4px 20px rgba(89,54,74,0.08)' }}>
        {[
          { icon: '🏠', fr: 'Accueil',    ar: 'الرئيسية', href: '/',          active: false },
          { icon: '🔍', fr: 'Rechercher', ar: 'بحث',       href: '/rechercher', active: true  },
          { icon: '➕', fr: 'Publier',    ar: 'نشر',        href: '/publier',   active: false },
          { icon: '💬', fr: 'Messages',   ar: 'رسائل',      href: '/messages',  active: false },
          { icon: '👤', fr: 'Profil',     ar: 'حسابي',      href: '/profil/mon-profil', active: false },
        ].map((item, i) => (
          <Link key={i} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: item.active ? '#59364A' : '#bbb' }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: item.active ? 700 : 400 }}>{lang === 'fr' ? item.fr : item.ar}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
>>>>>>> 6a61080cb3429c590d3b6008d4b91683d925e01d

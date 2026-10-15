'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Lang = 'fr' | 'ar';
type Onglet = 'services' | 'avis' | 'galerie';

// `select('*')` : available_days / photo_urls n'existent qu'après la migration 005
type Service = {
  id: string;
  title_fr: string;
  description_fr: string | null;
  price_min: number | null;
  price_max: number | null;
  price_unit: string | null;
  wilaya: string | null;
  commune: string | null;
  is_active: boolean;
  available_days?: string[];
  photo_urls?: string[];
  categories: { name_fr: string; icon: string | null } | null;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  quality: number | null;
  communication: number | null;
  punctuality: number | null;
  created_at: string;
  reviewer: { display_name: string; commune: string | null } | null;
};

const DAY_LABELS: Record<string, { fr: string; ar: string }> = {
  dimanche: { fr: 'Dim', ar: 'الأحد' },
  lundi: { fr: 'Lun', ar: 'الإثنين' },
  mardi: { fr: 'Mar', ar: 'الثلاثاء' },
  mercredi: { fr: 'Mer', ar: 'الأربعاء' },
  jeudi: { fr: 'Jeu', ar: 'الخميس' },
  vendredi: { fr: 'Ven', ar: 'الجمعة' },
  samedi: { fr: 'Sam', ar: 'السبت' },
};

const average = (values: (number | null)[]) => {
  const nums = values.filter((v): v is number => typeof v === 'number');
  return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;
};

const formatPrice = (min: number | null, max: number | null) => {
  if (min && max && min !== max) return `${min.toLocaleString()} — ${max.toLocaleString()} DA`;
  const value = min ?? max;
  return value ? `${value.toLocaleString()} DA` : null;
};

const timeAgo = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-DZ', { day: 'numeric', month: 'long', year: 'numeric' });

export default function ProfilPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [lang, setLang] = useState<Lang>('fr');
  const isRTL = lang === 'ar';
  const [onglet, setOnglet] = useState<Onglet>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  // Page personnelle : connexion obligatoire
  useEffect(() => {
    if (!authLoading && !user) router.replace('/connexion?redirect=/profil');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function load(userId: string) {
      const [servicesRes, reviewsRes] = await Promise.all([
        supabase
          .from('services')
          .select('*, categories ( name_fr, icon )')
          .eq('provider_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select('id, rating, comment, quality, communication, punctuality, created_at, reviewer:profiles!reviewer_id ( display_name, commune )')
          .eq('provider_id', userId)
          .order('created_at', { ascending: false }),
      ]);
      if (!active) return;
      if (servicesRes.error || reviewsRes.error) setError(lang === 'fr' ? 'Certaines données n’ont pas pu être chargées.' : 'تعذر تحميل بعض البيانات.');
      setServices((servicesRes.data ?? []) as unknown as Service[]);
      setReviews((reviewsRes.data ?? []) as unknown as Review[]);
      setDataLoading(false);
    }

    load(user.id);
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  if (authLoading || !user) {
    return <div style={{ minHeight: '100vh', background: '#FAF7F2', padding: '48px 24px', textAlign: 'center', color: '#888' }}>Chargement...</div>;
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F2', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🌸</p>
        <h1 style={{ color: '#59364A', marginBottom: 8 }}>Complétez votre profil</h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Votre profil n’est pas encore créé.</p>
        <Link href="/inscription/profil" style={{ display: 'inline-block', background: '#59364A', color: '#fff', borderRadius: 25, padding: '14px 24px', fontWeight: 700, textDecoration: 'none' }}>
          Compléter mon profil
        </Link>
      </div>
    );
  }

  const noteGlobale = average(reviews.map(r => r.rating));
  const noteQualite = average(reviews.map(r => r.quality));
  const noteCommunication = average(reviews.map(r => r.communication));
  const notePonctualite = average(reviews.map(r => r.punctuality));
  const activeServices = services.filter(s => s.is_active);
  const galerie = services.flatMap(s => s.photo_urls ?? []);
  const categories = [...new Set(activeServices.map(s => s.categories ? `${s.categories.icon ?? ''} ${s.categories.name_fr}`.trim() : null).filter(Boolean))];
  const allMin = activeServices.map(s => s.price_min).filter((v): v is number => !!v);
  const allMax = activeServices.map(s => s.price_max ?? s.price_min).filter((v): v is number => !!v);
  const tarif = formatPrice(allMin.length ? Math.min(...allMin) : null, allMax.length ? Math.max(...allMax) : null);
  const membreSince = new Date(profile.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-DZ', { month: 'long', year: 'numeric' });

  const badges = [
    { ok: profile.trust_level >= 1, fr: '📱 Téléphone vérifié', ar: '📱 هاتف موثق' },
    { ok: profile.identity_verified || profile.trust_level >= 2, fr: '🪪 Identité vérifiée', ar: '🪪 هوية موثقة' },
    { ok: profile.trust_level >= 3, fr: '⭐ Profil de confiance', ar: '⭐ ملف موثوق' },
  ];

  const card = { background: '#fff', borderRadius: 16, padding: '16px' };
  const empty = (fr: string, ar: string) => (
    <div style={{ ...card, color: '#999', fontSize: 13, textAlign: 'center' }}>{lang === 'fr' ? fr : ar}</div>
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 80 }}>

      {/* Header */}
      <header style={{ background: '#59364A', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ color: '#FAF7F2', fontSize: 16, fontWeight: 700 }}>
          {lang === 'fr' ? 'Mon profil' : 'ملفي'}
        </span>
        <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>
          {lang === 'fr' ? 'عربي' : 'FR'}
        </button>
      </header>

      {/* Hero profil */}
      <div style={{ background: 'linear-gradient(180deg, #59364A 0%, #7a4a63 100%)', padding: '28px 20px 20px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #C77D69, #A8B5A2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff', border: '3px solid rgba(255,255,255,0.3)', overflow: 'hidden', flexShrink: 0 }}>
            {profile.avatar_url
              // eslint-disable-next-line @next/next/no-img-element -- URL Supabase Storage arbitraire
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : profile.display_name.charAt(0).toUpperCase()}
          </div>
          {/* Infos */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ color: '#FAF7F2', fontSize: 20, fontWeight: 900, margin: 0 }}>{profile.business_name || profile.display_name}</h1>
              {profile.identity_verified && <span style={{ background: '#C77D69', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>✓ {lang === 'fr' ? 'VÉRIFIÉE' : 'موثقة'}</span>}
            </div>
            {profile.business_name && <div style={{ color: 'rgba(250,247,242,0.7)', fontSize: 13, marginTop: 2 }}>{profile.display_name}</div>}
            {categories.length > 0 && <div style={{ color: 'rgba(250,247,242,0.7)', fontSize: 13, marginTop: 2 }}>{categories.join(' · ')}</div>}
            {(profile.commune || profile.wilaya) && (
              <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 12, marginTop: 2 }}>📍 {[profile.commune, profile.wilaya].filter(Boolean).join(', ')}</div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#FAF7F2', fontWeight: 800, fontSize: 16 }}>⭐ {noteGlobale ?? '—'}</div>
                <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 10 }}>{reviews.length} {lang === 'fr' ? 'avis' : 'تقييم'}</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#FAF7F2', fontWeight: 800, fontSize: 16 }}>{activeServices.length}</div>
                <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 10 }}>{lang === 'fr' ? 'services' : 'خدمات'}</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#FAF7F2', fontWeight: 800, fontSize: 16 }}>🏅 N{profile.trust_level}</div>
                <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 10 }}>{lang === 'fr' ? 'confiance' : 'ثقة'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Link href="/inscription/profil" style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 25, color: '#FAF7F2', fontWeight: 700, fontSize: 14, textAlign: 'center', textDecoration: 'none' }}>
            ✏️ {lang === 'fr' ? 'Modifier' : 'تعديل'}
          </Link>
          <Link href="/publier" style={{ flex: 1, padding: '12px', background: '#C77D69', borderRadius: 25, color: '#fff', fontWeight: 700, fontSize: 14, textAlign: 'center', textDecoration: 'none' }}>
            ➕ {lang === 'fr' ? 'Publier un service' : 'نشر خدمة'}
          </Link>
        </div>
      </div>

      {/* Tarif */}
      {tarif && (
        <div style={{ background: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0e8e0' }}>
          <span style={{ color: '#999', fontSize: 13 }}>{lang === 'fr' ? 'Tarifs indicatifs' : 'الأسعار التقريبية'}</span>
          <span style={{ color: '#59364A', fontWeight: 800, fontSize: 15 }}>{tarif}</span>
        </div>
      )}

      {/* Badges de confiance */}
      {badges.some(b => b.ok) && (
        <div style={{ padding: '16px 20px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {badges.filter(b => b.ok).map((b, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e8ddd6', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#59364A', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {lang === 'fr' ? b.fr : b.ar}
            </div>
          ))}
        </div>
      )}

      {/* Onglets */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '2px solid #f0e8e0' }}>
        {([['services', lang === 'fr' ? `🛠️ Services (${services.length})` : `🛠️ خدمات (${services.length})`], ['avis', lang === 'fr' ? `⭐ Avis (${reviews.length})` : `⭐ تقييمات (${reviews.length})`], ['galerie', lang === 'fr' ? `📸 Galerie (${galerie.length})` : `📸 معرض (${galerie.length})`]] as [Onglet, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setOnglet(id)} style={{ flex: 1, padding: '12px 4px', border: 'none', background: 'none', color: onglet === id ? '#59364A' : '#999', fontWeight: onglet === id ? 700 : 400, fontSize: 12, cursor: 'pointer', borderBottom: `3px solid ${onglet === id ? '#59364A' : 'transparent'}`, transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 12, padding: 12, marginBottom: 14, color: '#c0392b', fontSize: 13 }}>{error}</div>
        )}

        {dataLoading ? (
          <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: 24 }}>{lang === 'fr' ? 'Chargement...' : 'جار التحميل...'}</div>
        ) : (
          <>
            {/* ══ Onglet Services ══ */}
            {onglet === 'services' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={card}>
                  <div style={{ color: '#59364A', fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
                    {lang === 'fr' ? 'À propos' : 'نبذة عني'}
                  </div>
                  <p style={{ color: profile.bio ? '#555' : '#999', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    {profile.bio || (lang === 'fr' ? 'Ajoutez une présentation depuis « Modifier ».' : 'أضيفي نبذة من «تعديل».')}
                  </p>
                </div>

                {services.length === 0
                  ? empty('Vous n’avez pas encore publié de service.', 'لم تنشري أي خدمة بعد.')
                  : services.map(s => (
                    <div key={s.id} style={{ ...card, opacity: s.is_active ? 1 : 0.6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: '#292929', fontWeight: 700, fontSize: 15 }}>{s.title_fr}</div>
                          {s.categories && <div style={{ color: '#C77D69', fontSize: 12, marginTop: 2 }}>{s.categories.icon} {s.categories.name_fr}</div>}
                        </div>
                        <span style={{ background: s.is_active ? '#e8f5e9' : '#fafafa', color: s.is_active ? '#2e7d32' : '#999', fontSize: 10, padding: '3px 10px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                          {s.is_active ? (lang === 'fr' ? 'Actif' : 'نشط') : (lang === 'fr' ? 'Inactif' : 'غير نشط')}
                        </span>
                      </div>
                      {s.description_fr && <p style={{ color: '#555', fontSize: 13, lineHeight: 1.5, margin: '8px 0 0' }}>{s.description_fr}</p>}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
                        {formatPrice(s.price_min, s.price_max) && (
                          <span style={{ background: '#FAF7F2', color: '#59364A', borderRadius: 12, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
                            {formatPrice(s.price_min, s.price_max)}{s.price_unit ? ` / ${s.price_unit}` : ''}
                          </span>
                        )}
                        {(s.commune || s.wilaya) && <span style={{ color: '#999', fontSize: 12 }}>📍 {[s.commune, s.wilaya].filter(Boolean).join(', ')}</span>}
                      </div>
                      {!!s.available_days?.length && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                          {s.available_days.map(d => (
                            <span key={d} style={{ border: '1px solid #e8ddd6', borderRadius: 12, padding: '2px 8px', fontSize: 11, color: '#59364A' }}>
                              {DAY_LABELS[d]?.[lang] ?? d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                <div style={{ ...card, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#999', fontSize: 13 }}>{lang === 'fr' ? 'Membre DJARA depuis' : 'عضوة في DJARA منذ'}</span>
                  <span style={{ color: '#59364A', fontWeight: 700, fontSize: 13 }}>{membreSince}</span>
                </div>

                <button onClick={handleSignOut} style={{ ...card, padding: '14px 16px', border: 'none', color: '#C77D69', fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: isRTL ? 'right' : 'left' }}>
                  🚪 {lang === 'fr' ? 'Se déconnecter' : 'تسجيل الخروج'}
                </button>
              </div>
            )}

            {/* ══ Onglet Avis ══ */}
            {onglet === 'avis' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.length === 0 ? empty('Vous n’avez pas encore reçu d’avis.', 'لم تستلمي أي تقييم بعد.') : (
                  <>
                    <div style={{ ...card, display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#59364A', fontSize: 36, fontWeight: 900 }}>{noteGlobale}</div>
                        <div style={{ color: '#C77D69', fontSize: 16 }}>{'⭐'.repeat(Math.round(noteGlobale ?? 0))}</div>
                        <div style={{ color: '#999', fontSize: 11 }}>{reviews.length} {lang === 'fr' ? 'avis' : 'تقييم'}</div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                          { label: lang === 'fr' ? 'Qualité' : 'الجودة', val: noteQualite },
                          { label: lang === 'fr' ? 'Communication' : 'التواصل', val: noteCommunication },
                          { label: lang === 'fr' ? 'Ponctualité' : 'الالتزام', val: notePonctualite },
                        ].filter(item => item.val !== null).map((item, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ color: '#999', fontSize: 11, minWidth: 90 }}>{item.label}</span>
                            <div style={{ flex: 1, background: '#f0e8e0', borderRadius: 4, height: 6 }}>
                              <div style={{ width: `${((item.val ?? 0) / 5) * 100}%`, height: '100%', background: '#C77D69', borderRadius: 4 }} />
                            </div>
                            <span style={{ color: '#59364A', fontSize: 11, fontWeight: 700 }}>{item.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {reviews.map(avis => (
                      <div key={avis.id} style={card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <div style={{ color: '#292929', fontWeight: 700, fontSize: 14 }}>{avis.reviewer?.display_name ?? (lang === 'fr' ? 'Utilisatrice' : 'مستخدمة')}</div>
                            {avis.reviewer?.commune && <div style={{ color: '#999', fontSize: 11 }}>📍 {avis.reviewer.commune}</div>}
                          </div>
                          <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                            <div style={{ color: '#C77D69', fontSize: 14 }}>{'⭐'.repeat(avis.rating)}</div>
                            <div style={{ color: '#bbb', fontSize: 10 }}>{timeAgo(avis.created_at, lang)}</div>
                          </div>
                        </div>
                        {avis.comment && <p style={{ color: '#555', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{avis.comment}</p>}
                        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                          {[
                            { label: lang === 'fr' ? 'Qualité' : 'جودة', val: avis.quality },
                            { label: lang === 'fr' ? 'Comm.' : 'تواصل', val: avis.communication },
                            { label: lang === 'fr' ? 'Ponct.' : 'التزام', val: avis.punctuality },
                          ].filter(item => item.val !== null).map((item, i) => (
                            <div key={i} style={{ background: '#FAF7F2', borderRadius: 10, padding: '4px 10px', fontSize: 11, color: '#59364A' }}>
                              {item.label} {item.val}/5
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* ══ Onglet Galerie ══ */}
            {onglet === 'galerie' && (
              galerie.length === 0 ? empty('Ajoutez des photos en publiant un service.', 'أضيفي صوراً عند نشر خدمة.') : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                  {galerie.map((url, i) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#f0e8e0', display: 'block' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- URL Supabase Storage */}
                      <img src={url} alt={`Photo ${i + 1}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Nav bas */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e8e0', display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', boxShadow: '0 -4px 20px rgba(89,54,74,0.08)', zIndex: 50 }}>
        {[
          { icon: '🏠', fr: 'Accueil', ar: 'الرئيسية', href: '/' },
          { icon: '🔍', fr: 'Rechercher', ar: 'بحث', href: '/rechercher' },
          { icon: '➕', fr: 'Publier', ar: 'نشر', href: '/publier' },
          { icon: '💬', fr: 'Messages', ar: 'رسائل', href: '/messages' },
          { icon: '👤', fr: 'Profil', ar: 'حسابي', href: '/profil', active: true },
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

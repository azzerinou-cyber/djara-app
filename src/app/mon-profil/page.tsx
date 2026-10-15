'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

type Lang = 'fr' | 'ar';
type Onglet = 'profil' | 'services' | 'avis' | 'parametres';

interface ServiceRow {
  id: string;
  title: string;
  price_min: number | null;
  price_max: number | null;
  status: string;
}

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: { display_name: string } | null;
}

export default function MonProfilPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [lang, setLang] = useState<Lang>('fr');
  const isRTL = lang === 'ar';
  const [onglet, setOnglet] = useState<Onglet>('profil');
  const [disponible, setDisponible] = useState(true);
  const [profilVisible, setProfilVisible] = useState(true);
  const [modePrestataire, setModePrestataire] = useState(false);

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  // Redirection si non connectée
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/connexion');
    }
  }, [authLoading, user, router]);

  // Initialiser modePrestataire depuis le profil
  useEffect(() => {
    if (profile) {
      setModePrestataire(profile.profile_type === 'professionnelle');
    }
  }, [profile]);

  const fetchServices = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('services')
      .select('id, title, price_min, price_max, status')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false });
    setServices((data as ServiceRow[]) ?? []);
  }, [user]);

  // Persiste un champ de profil en base
  const updateProfileField = useCallback(async (fields: Record<string, unknown>) => {
    if (!user) return;
    await supabase.from('profiles').update(fields).eq('id', user.id);
  }, [user]);

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, reviewer:reviewer_id(display_name)')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    const rows = (data as unknown as ReviewRow[]) ?? [];
    setReviews(rows);
    if (rows.length > 0) {
      const avg = rows.reduce((s, r) => s + r.rating, 0) / rows.length;
      setAvgRating(Math.round(avg * 10) / 10);
    }
  }, [user]);

  useEffect(() => {
    if (!user || authLoading) return;
    setDataLoading(true);
    Promise.all([fetchServices(), fetchReviews()]).finally(() => setDataLoading(false));
  }, [user, authLoading, fetchServices, fetchReviews]);

  const handleSignOut = async () => {
    setSignOutLoading(true);
    await signOut();
    router.replace('/');
  };

  const t = {
    fr: {
      titre: 'Mon Profil',
      modifier: 'Modifier',
      profil: 'Profil',
      services: 'Services',
      avis: 'Avis',
      parametres: 'Paramètres',
      membre: 'Membre depuis',
      niveauConfiance: 'Niveau de confiance',
      niveau: ['', 'Téléphone vérifié', 'Identité vérifiée', 'Profil de confiance'],
      disponible: 'Disponible',
      indisponible: 'Indisponible',
      modePrestataire: 'Mode Prestataire',
      modeCherche: 'Je cherche',
      profilVisible: 'Profil visible',
      profilCache: 'Profil masqué',
      statistiques: 'Statistiques',
      totalAvis: 'Avis reçus',
      totalPrestations: 'Services',
      noteGlobale: 'Note globale',
      vuesProfile: 'Vues profil',
      mesServices: 'Mes services',
      ajouterService: '+ Ajouter un service',
      aucunService: "Vous n'avez pas encore ajouté de service.",
      avisRecus: 'Avis reçus',
      aucunAvis: "Vous n'avez pas encore reçu d'avis.",
      securite: 'Sécurité & Confidentialité',
      notifications: 'Notifications',
      langue: 'Langue',
      aide: 'Aide & Support',
      deconnexion: 'Se déconnecter',
      suppressionCompte: 'Supprimer mon compte',
      politiqueConf: 'Politique de confidentialité',
      cgv: "Conditions d'utilisation",
      verifierIdentite: 'Vérifier mon identité',
      verifierTel: 'Téléphone vérifié ✓',
      bio: 'À propos de moi',
      partager: 'Partager mon profil',
      voir: 'Voir mon profil public',
      chargement: 'Chargement...',
      actif: 'Actif',
      inactif: 'Inactif',
    },
    ar: {
      titre: 'ملفي الشخصي',
      modifier: 'تعديل',
      profil: 'الملف',
      services: 'الخدمات',
      avis: 'التقييمات',
      parametres: 'الإعدادات',
      membre: 'عضو منذ',
      niveauConfiance: 'مستوى الثقة',
      niveau: ['', 'هاتف موثق', 'هوية موثقة', 'ملف موثوق'],
      disponible: 'متاحة',
      indisponible: 'غير متاحة',
      modePrestataire: 'وضع مزودة الخدمة',
      modeCherche: 'أبحث عن خدمة',
      profilVisible: 'الملف مرئي',
      profilCache: 'الملف مخفي',
      statistiques: 'الإحصائيات',
      totalAvis: 'التقييمات',
      totalPrestations: 'الخدمات',
      noteGlobale: 'التقييم العام',
      vuesProfile: 'مشاهدات الملف',
      mesServices: 'خدماتي',
      ajouterService: '+ إضافة خدمة',
      aucunService: 'لم تضيفي أي خدمة بعد.',
      avisRecus: 'التقييمات المستلمة',
      aucunAvis: 'لم تستلمي أي تقييم بعد.',
      securite: 'الأمان والخصوصية',
      notifications: 'الإشعارات',
      langue: 'اللغة',
      aide: 'المساعدة والدعم',
      deconnexion: 'تسجيل الخروج',
      suppressionCompte: 'حذف حسابي',
      politiqueConf: 'سياسة الخصوصية',
      cgv: 'شروط الاستخدام',
      verifierIdentite: 'التحقق من هويتي',
      verifierTel: 'الهاتف موثق ✓',
      bio: 'نبذة عني',
      partager: 'مشاركة ملفي',
      voir: 'عرض ملفي العام',
      chargement: '...جاري التحميل',
      actif: 'نشط',
      inactif: 'غير نشط',
    },
  }[lang];

  // Écran de chargement pendant la résolution de l'auth
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌸</div>
          <p style={{ color: '#59364A', fontWeight: 600 }}>{t.chargement}</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const trustLevel = profile.trust_level ?? 1;
  const displayName = profile.display_name ?? '';
  const commune = profile.commune ?? '';
  const wilaya = profile.wilaya ?? '';
  const bio = profile.bio ?? '';
  const phone = profile.phone ?? '';
  const membreSince = new Date(profile.created_at).toLocaleDateString(
    lang === 'fr' ? 'fr-FR' : 'ar-DZ',
    { month: 'long', year: 'numeric' }
  );
  const activeServices = services.filter(s => s.status === 'active');

  const formatPrix = (min: number | null, max: number | null) => {
    if (!min && !max) return lang === 'fr' ? 'Prix à définir' : 'السعر يُحدد';
    if (min && max) return `${min.toLocaleString()}–${max.toLocaleString()} DA`;
    if (min) return `${lang === 'fr' ? 'À partir de' : 'ابتداءً من'} ${min.toLocaleString()} DA`;
    return `${lang === 'fr' ? "Jusqu'à" : 'حتى'} ${max!.toLocaleString()} DA`;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return lang === 'fr' ? "aujourd'hui" : 'اليوم';
    if (days === 1) return lang === 'fr' ? 'hier' : 'أمس';
    if (days < 7) return lang === 'fr' ? `il y a ${days} jours` : `منذ ${days} أيام`;
    if (days < 30) return lang === 'fr' ? `il y a ${Math.floor(days / 7)} semaine(s)` : `منذ ${Math.floor(days / 7)} أسبوع`;
    return lang === 'fr' ? `il y a ${Math.floor(days / 30)} mois` : `منذ ${Math.floor(days / 30)} شهر`;
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 100 }}>

      {/* Header */}
      <header style={{ background: '#59364A', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ color: '#FAF7F2', fontSize: 16, fontWeight: 800 }}>{t.titre}</span>
        <button
          onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}
        >
          {lang === 'fr' ? 'عربي' : 'FR'}
        </button>
      </header>

      {/* Hero profil */}
      <div style={{ background: 'linear-gradient(160deg, #59364A 0%, #7a4d68 100%)', padding: '24px 20px 28px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={displayName}
                style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)' }}
              />
            ) : (
              <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#FAF7F2', fontWeight: 800 }}>
                {displayName.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, background: '#C77D69', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid #59364A', cursor: 'pointer' }}>
              ✏️
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#FAF7F2', fontSize: 18, fontWeight: 900, margin: '0 0 2px' }}>
              {profile.business_name || displayName}
            </h1>
            {profile.business_name && (
              <div style={{ color: 'rgba(250,247,242,0.7)', fontSize: 12 }}>{displayName}</div>
            )}
            {(commune || wilaya) && (
              <div style={{ color: 'rgba(250,247,242,0.5)', fontSize: 11, marginTop: 2 }}>
                📍 {[commune, wilaya].filter(Boolean).join(', ')}
              </div>
            )}
            <div style={{ color: 'rgba(250,247,242,0.4)', fontSize: 11, marginTop: 2 }}>
              🗓 {t.membre} {membreSince}
            </div>
          </div>

          <Link
            href="/mon-profil/modifier"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#FAF7F2', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12, flexShrink: 0, textDecoration: 'none' }}
          >
            {t.modifier}
          </Link>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {/* disponible : pas de colonne profiles.is_available — indicateur visuel uniquement */}
          <span
            style={{ background: disponible ? 'rgba(76,175,80,0.25)' : 'rgba(255,255,255,0.1)', border: `1px solid ${disponible ? 'rgba(76,175,80,0.5)' : 'rgba(255,255,255,0.2)'}`, color: disponible ? '#81c784' : 'rgba(255,255,255,0.5)', fontSize: 11, padding: '5px 12px', borderRadius: 20 }}
          >
            {disponible ? `● ${t.disponible}` : `○ ${t.indisponible}`}
          </span>
          <button
            onClick={async () => {
              const next = !profilVisible;
              setProfilVisible(next);
              await updateProfileField({ is_active: next });
            }}
            style={{ background: profilVisible ? 'rgba(168,181,162,0.2)' : 'rgba(255,100,100,0.15)', border: `1px solid ${profilVisible ? 'rgba(168,181,162,0.4)' : 'rgba(255,100,100,0.3)'}`, color: profilVisible ? '#A8B5A2' : '#ef9a9a', fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer' }}
          >
            {profilVisible ? `👁 ${t.profilVisible}` : `🙈 ${t.profilCache}`}
          </button>
          <button
            onClick={async () => {
              const next = !modePrestataire;
              setModePrestataire(next);
              await updateProfileField({ profile_type: next ? 'professionnelle' : 'particuliere' });
            }}
            style={{ background: modePrestataire ? 'rgba(199,125,105,0.25)' : 'rgba(255,255,255,0.1)', border: `1px solid ${modePrestataire ? 'rgba(199,125,105,0.5)' : 'rgba(255,255,255,0.2)'}`, color: modePrestataire ? '#C77D69' : 'rgba(255,255,255,0.5)', fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer' }}
          >
            {modePrestataire ? `💼 ${t.modePrestataire}` : `🔍 ${t.modeCherche}`}
          </button>
        </div>

        {/* Badges de confiance */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[1, 2, 3].map(n => (
            <span
              key={n}
              style={{ background: n <= trustLevel ? 'rgba(168,181,162,0.3)' : 'rgba(255,255,255,0.05)', border: `1px solid ${n <= trustLevel ? '#A8B5A2' : 'rgba(255,255,255,0.1)'}`, color: n <= trustLevel ? '#c8d8c2' : 'rgba(255,255,255,0.2)', fontSize: 10, padding: '3px 10px', borderRadius: 20 }}
            >
              {n <= trustLevel ? '✓' : '○'} {t.niveau[n]}
            </span>
          ))}
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ background: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-around', borderBottom: '1px solid #f0e8e0' }}>
        {[
          { val: avgRating ?? '—', label: t.noteGlobale, icon: '⭐' },
          { val: reviews.length, label: t.totalAvis, icon: '💬' },
          { val: activeServices.length, label: t.totalPrestations, icon: '✅' },
          { val: trustLevel, label: t.niveauConfiance, icon: '🛡️' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontWeight: 900, color: '#59364A', fontSize: 16 }}>{s.val}</div>
            <div style={{ color: '#bbb', fontSize: 10 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Liens rapides */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
        <Link
          href={`/profil/${user.id}`}
          style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e8ddd6', borderRadius: 12, color: '#59364A', fontSize: 12, fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'block' }}
        >
          👁 {t.voir}
        </Link>
        <button
          onClick={() => { if (typeof navigator !== 'undefined') navigator.clipboard.writeText(`${window.location.origin}/profil/${user.id}`); }}
          style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e8ddd6', borderRadius: 12, color: '#59364A', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          🔗 {t.partager}
        </button>
      </div>

      {/* Onglets */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0e8e0', display: 'flex' }}>
        {(['profil', 'services', 'avis', 'parametres'] as Onglet[]).map(o => (
          <button
            key={o}
            onClick={() => setOnglet(o)}
            style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: onglet === o ? '2px solid #59364A' : '2px solid transparent', color: onglet === o ? '#59364A' : '#bbb', fontSize: 12, fontWeight: onglet === o ? 700 : 400, cursor: 'pointer' }}
          >
            {o === 'profil' ? t.profil : o === 'services' ? t.services : o === 'avis' ? t.avis : t.parametres}
          </button>
        ))}
      </div>

      {/* Contenu onglets */}
      <div style={{ padding: '16px' }}>

        {/* ONGLET PROFIL */}
        {onglet === 'profil' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
              <div style={{ color: '#59364A', fontWeight: 800, fontSize: 13, marginBottom: 8 }}>{t.bio}</div>
              {bio ? (
                <p style={{ color: '#555', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{bio}</p>
              ) : (
                <p style={{ color: '#bbb', fontSize: 13, fontStyle: 'italic', margin: 0 }}>
                  {lang === 'fr' ? 'Aucune description pour le moment.' : 'لا توجد نبذة حتى الآن.'}
                </p>
              )}
              <Link
                href="/mon-profil/modifier"
                style={{ marginTop: 10, display: 'block', background: 'none', border: '1px dashed #C77D69', color: '#C77D69', borderRadius: 10, padding: '8px 14px', fontSize: 12, textAlign: 'center', textDecoration: 'none' }}
              >
                ✏️ {t.modifier}
              </Link>
            </div>

            {phone && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
                <div style={{ color: '#59364A', fontWeight: 800, fontSize: 13, marginBottom: 10 }}>📱 {t.verifierTel}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#555', fontSize: 13 }}>{phone}</span>
                  <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: 11, padding: '3px 10px', borderRadius: 10 }}>✓ Vérifié</span>
                </div>
              </div>
            )}

            {!profile.identity_verified && (
              <div style={{ background: 'linear-gradient(135deg, #fff8f0, #fff3e8)', borderRadius: 16, padding: 16, border: '1px solid #f0d8c8' }}>
                <div style={{ color: '#59364A', fontWeight: 800, fontSize: 13, marginBottom: 6 }}>🔐 {t.verifierIdentite}</div>
                <p style={{ color: '#888', fontSize: 12, lineHeight: 1.5, margin: '0 0 10px' }}>
                  {lang === 'fr'
                    ? 'Augmentez la confiance de vos clientes en vérifiant votre identité. Vos documents sont traités de façon confidentielle.'
                    : 'زيدي ثقة زبوناتك عبر توثيق هويتك. وثائقك تُعالَج بسرية تامة.'}
                </p>
                <button style={{ background: '#59364A', color: '#FAF7F2', border: 'none', borderRadius: 20, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                  {t.verifierIdentite} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ONGLET SERVICES */}
        {onglet === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: '#59364A', fontWeight: 800, fontSize: 14 }}>{t.mesServices}</span>
              <Link href="/publier" style={{ background: '#C77D69', color: '#fff', borderRadius: 20, padding: '7px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                {t.ajouterService}
              </Link>
            </div>

            {dataLoading ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#bbb' }}>{t.chargement}</div>
            ) : services.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🌱</div>
                <p style={{ color: '#59364A', fontWeight: 700, margin: '0 0 6px' }}>
                  {lang === 'fr' ? 'Aucun service encore' : 'لا توجد خدمات بعد'}
                </p>
                <p style={{ color: '#999', fontSize: 13, margin: '0 0 14px' }}>{t.aucunService}</p>
                <Link href="/publier" style={{ background: '#59364A', color: '#FAF7F2', borderRadius: 20, padding: '10px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                  {t.ajouterService}
                </Link>
              </div>
            ) : (
              services.map(s => (
                <div key={s.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${s.status === 'active' ? '#f0e8e0' : '#f5f0f0'}` }}>
                  <div>
                    <div style={{ fontWeight: 700, color: s.status === 'active' ? '#292929' : '#bbb', fontSize: 14 }}>{s.title}</div>
                    <div style={{ color: '#C77D69', fontSize: 12, marginTop: 2 }}>{formatPrix(s.price_min, s.price_max)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ background: s.status === 'active' ? '#e8f5e9' : '#fafafa', color: s.status === 'active' ? '#2e7d32' : '#bbb', fontSize: 10, padding: '3px 10px', borderRadius: 10, border: `1px solid ${s.status === 'active' ? '#c8e6c9' : '#e0e0e0'}` }}>
                      {s.status === 'active' ? t.actif : t.inactif}
                    </span>
                    <Link href={`/publier/${s.id}`} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', textDecoration: 'none', color: '#292929', padding: '4px 8px' }}>✏️</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ONGLET AVIS */}
        {onglet === 'avis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.length > 0 && avgRating !== null && (
              <div style={{ background: '#fff', borderRadius: 16, padding: 16, display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#59364A' }}>{avgRating}</div>
                  <div style={{ color: '#C77D69', fontSize: 14 }}>{'★'.repeat(Math.round(avgRating))}</div>
                  <div style={{ color: '#bbb', fontSize: 11 }}>{reviews.length} {t.totalAvis}</div>
                </div>
                <div style={{ flex: 1, color: '#555', fontSize: 13 }}>
                  {lang === 'fr' ? 'Continuez à offrir un service de qualité !' : 'استمري في تقديم خدمة ممتازة!'}
                </div>
              </div>
            )}

            {dataLoading ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#bbb' }}>{t.chargement}</div>
            ) : reviews.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                <p style={{ color: '#59364A', fontWeight: 700, margin: '0 0 6px' }}>
                  {lang === 'fr' ? 'Aucun avis encore' : 'لا توجد تقييمات بعد'}
                </p>
                <p style={{ color: '#999', fontSize: 13, margin: 0 }}>{t.aucunAvis}</p>
              </div>
            ) : (
              reviews.map(a => (
                <div key={a.id} style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C77D69, #A8B5A2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>
                        {(a.reviewer?.display_name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#292929', fontSize: 13 }}>
                          {a.reviewer?.display_name ?? (lang === 'fr' ? 'Utilisatrice' : 'مستخدمة')}
                        </div>
                        <div style={{ color: '#bbb', fontSize: 11 }}>{timeAgo(a.created_at)}</div>
                      </div>
                    </div>
                    <div style={{ color: '#C77D69' }}>{'★'.repeat(a.rating)}</div>
                  </div>
                  {a.comment && (
                    <p style={{ color: '#555', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{a.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ONGLET PARAMÈTRES */}
        {onglet === 'parametres' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '🔔', label: t.notifications, href: '#' },
              { icon: '🌐', label: `${t.langue} (${lang === 'fr' ? 'Français' : 'العربية'})`, href: '#' },
              { icon: '🔒', label: t.securite, href: '#' },
              { icon: '❓', label: t.aide, href: '#' },
              { icon: '📄', label: t.politiqueConf, href: '/politique-confidentialite' },
              { icon: '📋', label: t.cgv, href: '/conditions-utilisation' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ color: '#292929', fontSize: 14 }}>{item.label}</span>
                </div>
                <span style={{ color: '#bbb' }}>›</span>
              </Link>
            ))}

            <div style={{ height: 1, background: '#f0e8e0', margin: '8px 0' }} />

            <button
              onClick={handleSignOut}
              disabled={signOutLoading}
              style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', cursor: signOutLoading ? 'not-allowed' : 'pointer', width: '100%', opacity: signOutLoading ? 0.6 : 1 }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>🚪</span>
                <span style={{ color: '#C77D69', fontSize: 14, fontWeight: 600 }}>
                  {signOutLoading ? '...' : t.deconnexion}
                </span>
              </div>
              <span style={{ color: '#bbb' }}>›</span>
            </button>

            <div style={{ background: '#fff3f3', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid #ffcccc' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>🗑</span>
                <span style={{ color: '#e53935', fontSize: 13 }}>{t.suppressionCompte}</span>
              </div>
              <span style={{ color: '#bbb' }}>›</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: 16, color: '#bbb', fontSize: 11 }}>
              DJARA v1.0.0 — {lang === 'fr' ? 'Le talent des femmes, tout près de vous' : 'موهبة المرأة، قريبة منك'}
            </div>
          </div>
        )}
      </div>

      <BottomNav lang={lang} />
    </div>
  );
}

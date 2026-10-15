'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Lang = 'fr' | 'ar';

interface Service {
  id: string;
  title: string;
  category: string;
  price_min: number | null;
  price_max: number | null;
  wilaya: string;
  commune: string;
  provider_id: string;
  profiles?: {
    display_name: string | null;
  } | null;
}

const CATEGORIES = [
  { icon: '🍳', slug: 'cuisine', fr: 'Cuisine & Pâtisserie', ar: 'الطبخ والحلويات' },
  { icon: '💄', slug: 'beaute', fr: 'Beauté & Soins', ar: 'الجمال والعناية' },
  { icon: '📚', slug: 'education', fr: 'Cours & Soutien', ar: 'دروس ودعم' },
  { icon: '🧵', slug: 'couture', fr: 'Couture & Broderie', ar: 'الخياطة والتطريز' },
  { icon: '💻', slug: 'digital', fr: 'Digital & Création', ar: 'الرقمي والإبداع' },
  { icon: '🎉', slug: 'evenements', fr: 'Événements', ar: 'الفعاليات' },
];

const VALEURS = [
  { icon: '🛡️', fr: 'Profils vérifiés — votre sécurité avant tout', ar: 'ملفات موثقة — أمانك أولاً' },
  { icon: '📍', fr: 'Femmes qualifiées dans votre quartier', ar: 'خبيرات في حيّك' },
  { icon: '💬', fr: 'Messagerie sécurisée intégrée', ar: 'مراسلة آمنة داخل التطبيق' },
  { icon: '🤝', fr: 'Entre femmes — un espace de confiance', ar: 'بين النساء — فضاء من الثقة' },
];

export default function HomePage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('fr');
  const [search, setSearch] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPrenom, setUserPrenom] = useState<string | null>(null);
  const [totalServices, setTotalServices] = useState(0);
  const isRTL = lang === 'ar';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Services récents actifs
      const { data, error, count } = await supabase
        .from('services')
        .select(`
          id, title, category, price_min, price_max, wilaya, commune, provider_id,
          profiles!services_provider_id_fkey(display_name)
        `, { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data) {
        setServices(data as Service[]);
        setTotalServices(count ?? 0);
      }

      // Utilisatrice connectée
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
        if (profile?.display_name) {
          setUserPrenom(profile.display_name.split(' ')[0]);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/rechercher?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/rechercher');
    }
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/rechercher?categorie=${slug}`);
  };

  const formatPrix = (min: number | null, max: number | null) => {
    if (!min && !max) return lang === 'fr' ? 'Prix à définir' : 'السعر يُحدد';
    if (min && max) return `${min.toLocaleString()}–${max.toLocaleString()} DA`;
    if (min) return `À partir de ${min.toLocaleString()} DA`;
    return `Jusqu'à ${max!.toLocaleString()} DA`;
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 80 }}>

      {/* Header */}
      <header style={{ background: '#fff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(89,54,74,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🌸</span>
          <span style={{ color: '#59364A', fontSize: 21, fontWeight: 900, letterSpacing: 1 }}>DJARA</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            style={{ background: '#FAF7F2', border: '1px solid #e8ddd6', color: '#59364A', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            {lang === 'fr' ? 'عربي' : 'FR'}
          </button>
          {userPrenom ? (
            <Link href="/profil" style={{ background: '#59364A', color: '#FAF7F2', borderRadius: 25, padding: '7px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 700 }}>
              {userPrenom}
            </Link>
          ) : (
            <Link href="/auth/connexion" style={{ background: '#59364A', color: '#FAF7F2', borderRadius: 25, padding: '7px 16px', fontSize: 13, textDecoration: 'none', fontWeight: 700 }}>
              {lang === 'fr' ? 'Connexion' : 'دخول'}
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(150deg, #59364A 0%, #7a4a63 50%, #C77D69 100%)', padding: '48px 20px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(199,125,105,0.15)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 130, height: 130, background: 'rgba(168,181,162,0.1)', borderRadius: '50%' }} />

        {userPrenom ? (
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 30, padding: '5px 14px', color: '#FAF7F2', fontSize: 13, marginBottom: 16, backdropFilter: 'blur(10px)' }}>
            👋 {lang === 'fr' ? `Bonjour ${userPrenom} !` : `مرحباً ${userPrenom}!`}
          </div>
        ) : (
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', borderRadius: 30, padding: '5px 14px', color: '#FAF7F2', fontSize: 13, marginBottom: 16, backdropFilter: 'blur(10px)' }}>
            🌸 {lang === 'fr' ? 'La communauté féminine en Algérie' : 'مجتمع المرأة الجزائرية'}
          </div>
        )}

        <h1 style={{ color: '#FAF7F2', fontSize: 30, fontWeight: 900, margin: '0 0 8px', lineHeight: 1.2 }}>
          {lang === 'fr' ? 'Ton talent mérite' : 'موهبتك تستحق'}
        </h1>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 16px', lineHeight: 1.2, background: 'linear-gradient(90deg, #FAF7F2, #C77D69, #A8B5A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {lang === 'fr' ? "d'être reconnu." : 'الاعتراف.'}
        </h1>
        <p style={{ color: 'rgba(250,247,242,0.85)', fontSize: 15, margin: '0 0 24px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
          {lang === 'fr'
            ? 'DJARA connecte les femmes algériennes — pour offrir, trouver et valoriser les savoir-faire.'
            : 'جارة تربط المرأة الجزائرية — لتقديم المواهب وإيجادها وتقديرها.'}
        </p>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6, maxWidth: 440, margin: '0 auto', background: 'rgba(255,255,255,0.15)', borderRadius: 30, padding: 5, backdropFilter: 'blur(10px)' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'fr' ? '🔍 Coiffure, cuisine, couture...' : '🔍 ابحثي عن خدمة...'}
            style={{ flex: 1, padding: '11px 16px', borderRadius: 25, border: 'none', fontSize: 14, outline: 'none', background: '#fff', color: '#292929' }}
          />
          <button type="submit" style={{ background: '#C77D69', border: 'none', borderRadius: 25, padding: '11px 20px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            {lang === 'fr' ? 'Chercher' : 'بحث'}
          </button>
        </form>

        {/* Stats dynamiques */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 28 }}>
          {[
            { n: loading ? '…' : totalServices.toString(), l: lang === 'fr' ? 'Services actifs' : 'خدمة نشطة' },
            { n: '58', l: lang === 'fr' ? 'Wilayas' : 'ولاية' },
            { n: '100%', l: lang === 'fr' ? 'Entre femmes' : 'بين النساء' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: '#FAF7F2', fontSize: 20, fontWeight: 900 }}>{s.n}</div>
              <div style={{ color: 'rgba(250,247,242,0.7)', fontSize: 11 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>

        {/* Catégories */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: '#292929', fontSize: 17, fontWeight: 800, margin: '0 0 4px' }}>
            {lang === 'fr' ? 'Que cherchez-vous ?' : 'ماذا تبحثين عنه؟'}
          </h2>
          <p style={{ color: '#999', fontSize: 13, margin: '0 0 14px' }}>
            {lang === 'fr' ? 'Des expertes près de chez vous' : 'خبيرات بالقرب منك'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => handleCategoryClick(cat.slug)}
                style={{ background: '#fff', borderRadius: 14, padding: '16px 8px', textAlign: 'center', boxShadow: '0 2px 10px rgba(89,54,74,0.07)', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.15s', width: '100%' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#C77D69'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: 28, marginBottom: 5 }}>{cat.icon}</div>
                <div style={{ color: '#59364A', fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>{lang === 'fr' ? cat.fr : cat.ar}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Services récents */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h2 style={{ color: '#292929', fontSize: 17, fontWeight: 800, margin: 0 }}>
                {lang === 'fr' ? 'Services disponibles' : 'الخدمات المتاحة'}
              </h2>
              <p style={{ color: '#999', fontSize: 13, margin: '2px 0 0' }}>
                {lang === 'fr' ? 'Publiés récemment' : 'منشورة مؤخراً'}
              </p>
            </div>
            <Link href="/rechercher" style={{ color: '#C77D69', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              {lang === 'fr' ? 'Voir tout →' : 'عرض الكل →'}
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 16, height: 80, opacity: 0.5 }} />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, padding: '32px 20px', textAlign: 'center', boxShadow: '0 2px 10px rgba(89,54,74,0.06)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
              <p style={{ color: '#59364A', fontWeight: 700, margin: '0 0 6px' }}>
                {lang === 'fr' ? 'La communauté se construit !' : 'المجتمع في بداياته!'}
              </p>
              <p style={{ color: '#999', fontSize: 13, margin: '0 0 16px' }}>
                {lang === 'fr' ? 'Soyez la première à proposer un service dans votre région.' : 'كوني أول من يقدم خدمة في منطقتك.'}
              </p>
              <Link href="/auth/inscription" style={{ background: '#59364A', color: '#FAF7F2', borderRadius: 25, padding: '10px 20px', fontSize: 13, textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>
                {lang === 'fr' ? 'Publier un service' : 'انشري خدمة'}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {services.map(svc => (
                <Link
                  key={svc.id}
                  href={`/profil/${svc.provider_id}`}
                  style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 2px 10px rgba(89,54,74,0.06)', textDecoration: 'none', display: 'block', border: '1px solid #f0e8e0', transition: 'transform 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#292929', fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{svc.title}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ background: '#FAF7F2', color: '#59364A', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                          {svc.category}
                        </span>
                        <span style={{ color: '#999', fontSize: 12 }}>
                          📍 {svc.commune}, {svc.wilaya}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ color: '#C77D69', fontSize: 13, fontWeight: 800 }}>
                        {formatPrix(svc.price_min, svc.price_max)}
                      </div>
                      {svc.profiles?.display_name && (
                        <div style={{ color: '#bbb', fontSize: 11, marginTop: 2 }}>
                          par {svc.profiles.display_name}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA double */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          <Link href="/rechercher" style={{ background: '#59364A', borderRadius: 16, padding: '18px 14px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 26, marginBottom: 5 }}>🔍</div>
            <div style={{ color: '#FAF7F2', fontSize: 14, fontWeight: 700 }}>{lang === 'fr' ? 'Je cherche' : 'أبحث'}</div>
            <div style={{ color: 'rgba(250,247,242,0.7)', fontSize: 11, marginTop: 2 }}>{lang === 'fr' ? 'un service' : 'عن خدمة'}</div>
          </Link>
          <Link href={userPrenom ? '/publier' : '/auth/inscription'} style={{ background: 'linear-gradient(135deg, #C77D69, #e09080)', borderRadius: 16, padding: '18px 14px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 26, marginBottom: 5 }}>✨</div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{lang === 'fr' ? 'Je propose' : 'أقدم'}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 }}>{lang === 'fr' ? 'mes talents' : 'مواهبي'}</div>
          </Link>
        </div>

        {/* Pourquoi DJARA */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '18px', boxShadow: '0 2px 10px rgba(89,54,74,0.06)', marginBottom: 8 }}>
          <h3 style={{ color: '#59364A', fontSize: 15, fontWeight: 800, margin: '0 0 14px', textAlign: 'center' }}>
            {lang === 'fr' ? 'Pourquoi DJARA ?' : 'لماذا جارة؟'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {VALEURS.map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, minWidth: 28 }}>{v.icon}</span>
                <span style={{ color: '#292929', fontSize: 13 }}>{lang === 'fr' ? v.fr : v.ar}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav bas */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e8e0', display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', boxShadow: '0 -4px 20px rgba(89,54,74,0.08)', zIndex: 100 }}>
        {[
          { icon: '🏠', fr: 'Accueil', ar: 'الرئيسية', href: '/', active: true },
          { icon: '🔍', fr: 'Rechercher', ar: 'بحث', href: '/rechercher', active: false },
          { icon: '➕', fr: 'Publier', ar: 'نشر', href: userPrenom ? '/publier' : '/auth/connexion', active: false },
          { icon: '💬', fr: 'Messages', ar: 'رسائل', href: '/messages', active: false },
          { icon: '👤', fr: 'Profil', ar: 'حسابي', href: userPrenom ? '/profil' : '/auth/connexion', active: false },
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

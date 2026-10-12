'use client';
import { useState } from 'react';
import Link from 'next/link';

type Lang = 'fr' | 'ar';

const categories = [
  { icon: '🍳', fr: 'Cuisine & Pâtisserie', ar: 'الطبخ والحلويات' },
  { icon: '💄', fr: 'Beauté & Soins', ar: 'الجمال والعناية' },
  { icon: '📚', fr: 'Cours & Soutien', ar: 'دروس ودعم' },
  { icon: '🧵', fr: 'Couture & Broderie', ar: 'الخياطة والتطريز' },
  { icon: '💻', fr: 'Digital & Création', ar: 'الرقمي والإبداع' },
  { icon: '🎉', fr: 'Événements', ar: 'الفعاليات' },
];

const temoignages = [
  { nom: 'Yasmine, Alger', texte: 'Grâce à DJARA, j\'ai trouvé une coiffeuse exceptionnelle à 5 min de chez moi.', note: '⭐⭐⭐⭐⭐' },
  { nom: 'Nadia, Oran', texte: 'J\'ai lancé mon activité de pâtisserie. Mes premières clientes sont venues via DJARA.', note: '⭐⭐⭐⭐⭐' },
];

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('fr');
  const isRTL = lang === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 12px rgba(89,54,74,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>🌸</span>
          <span style={{ color: '#59364A', fontSize: 22, fontWeight: 900, letterSpacing: 1 }}>DJARA</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} style={{ background: '#FAF7F2', border: '1px solid #e8ddd6', color: '#59364A', borderRadius: 20, padding: '5px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {lang === 'fr' ? 'عربي' : 'FR'}
          </button>
          <Link href="/auth/connexion" style={{ background: '#59364A', color: '#FAF7F2', borderRadius: 25, padding: '8px 18px', fontSize: 13, textDecoration: 'none', fontWeight: 700 }}>
            {lang === 'fr' ? 'Connexion' : 'دخول'}
          </Link>
        </div>
      </header>

      {/* Hero — Slogan fort */}
      <section style={{ background: 'linear-gradient(150deg, #59364A 0%, #7a4a63 50%, #C77D69 100%)', padding: '56px 24px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(199,125,105,0.15)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, background: 'rgba(168,181,162,0.1)', borderRadius: '50%' }} />
        
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', borderRadius: 30, padding: '6px 16px', color: '#FAF7F2', fontSize: 13, marginBottom: 20, backdropFilter: 'blur(10px)' }}>
          🌸 {lang === 'fr' ? 'La communauté féminine en Algérie' : 'مجتمع المرأة الجزائرية'}
        </div>

        <h1 style={{ color: '#FAF7F2', fontSize: 32, fontWeight: 900, margin: '0 0 12px', lineHeight: 1.2 }}>
          {lang === 'fr' ? 'Ton talent mérite' : 'موهبتك تستحق'}
        </h1>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: '0 0 20px', lineHeight: 1.2, background: 'linear-gradient(90deg, #FAF7F2, #C77D69, #A8B5A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {lang === 'fr' ? "d'être reconnu." : 'الاعتراف.'}
        </h1>
        <p style={{ color: 'rgba(250,247,242,0.85)', fontSize: 16, margin: '0 0 8px', maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
          {lang === 'fr'
            ? 'DJARA connecte les femmes algériennes — pour offrir, trouver et valoriser les savoir-faire de toute une génération.'
            : 'جارة تربط المرأة الجزائرية — لتقديم المواهب وإيجادها وتقديرها.'}
        </p>
        <p style={{ color: '#C77D69', fontSize: 13, fontWeight: 700, margin: '0 0 28px', fontStyle: 'italic' }}>
          {lang === 'fr' ? '« Chaque femme est une ressource. »' : '« كل امرأة كنز. »'}
        </p>

        {/* Recherche */}
        <div style={{ display: 'flex', gap: 8, maxWidth: 440, margin: '0 auto', background: 'rgba(255,255,255,0.15)', borderRadius: 30, padding: 6, backdropFilter: 'blur(10px)' }}>
          <input
            placeholder={lang === 'fr' ? '🔍 Coiffure, cuisine, couture...' : '🔍 ابحثي عن خدمة...'}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 25, border: 'none', fontSize: 14, outline: 'none', background: '#fff', color: '#292929' }}
          />
          <button style={{ background: '#C77D69', border: 'none', borderRadius: 25, padding: '12px 22px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' }}>
            {lang === 'fr' ? 'Rechercher' : 'بحث'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 32 }}>
          {[
            { n: '2 400+', l: lang === 'fr' ? 'Femmes actives' : 'امرأة نشطة' },
            { n: '58', l: lang === 'fr' ? 'Wilayas' : 'ولاية' },
            { n: '4.9★', l: lang === 'fr' ? 'Note moyenne' : 'التقييم' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: '#FAF7F2', fontSize: 22, fontWeight: 900 }}>{s.n}</div>
              <div style={{ color: 'rgba(250,247,242,0.7)', fontSize: 11 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ padding: '28px 20px', maxWidth: 600, margin: '0 auto' }}>

        {/* Catégories */}
        <h2 style={{ color: '#292929', fontSize: 18, fontWeight: 800, margin: '0 0 4px' }}>
          {lang === 'fr' ? 'Que cherchez-vous ?' : 'ماذا تبحثين عنه؟'}
        </h2>
        <p style={{ color: '#999', fontSize: 13, margin: '0 0 16px' }}>
          {lang === 'fr' ? 'Des expertes près de chez vous' : 'خبيرات بالقرب منك'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 32 }}>
          {categories.map((cat, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '18px 8px', textAlign: 'center', boxShadow: '0 2px 12px rgba(89,54,74,0.07)', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = '#C77D69')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'transparent')}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{cat.icon}</div>
              <div style={{ color: '#59364A', fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>{lang === 'fr' ? cat.fr : cat.ar}</div>
            </div>
          ))}
        </div>

        {/* Témoignages */}
        <h2 style={{ color: '#292929', fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>
          {lang === 'fr' ? 'Elles témoignent' : 'شهاداتهن'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {temoignages.map((t, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '18px', boxShadow: '0 2px 12px rgba(89,54,74,0.07)', borderLeft: '4px solid #C77D69' }}>
              <div style={{ color: '#292929', fontSize: 14, fontStyle: 'italic', marginBottom: 8 }}>"{t.texte}"</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#59364A', fontSize: 12, fontWeight: 700 }}>{t.nom}</span>
                <span style={{ fontSize: 12 }}>{t.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA double */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <Link href="/rechercher" style={{ background: '#59364A', borderRadius: 18, padding: '20px 16px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🔍</div>
            <div style={{ color: '#FAF7F2', fontSize: 14, fontWeight: 700 }}>{lang === 'fr' ? 'Je cherche' : 'أبحث'}</div>
            <div style={{ color: 'rgba(250,247,242,0.7)', fontSize: 11, marginTop: 4 }}>{lang === 'fr' ? 'un service' : 'عن خدمة'}</div>
          </Link>
          <Link href="/auth/inscription" style={{ background: 'linear-gradient(135deg, #C77D69, #e09080)', borderRadius: 18, padding: '20px 16px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>✨</div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{lang === 'fr' ? 'Je propose' : 'أقدم'}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 }}>{lang === 'fr' ? 'mes talents' : 'مواهبي'}</div>
          </Link>
        </div>

        {/* Valeurs */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(89,54,74,0.06)' }}>
          <h3 style={{ color: '#59364A', fontSize: 15, fontWeight: 800, margin: '0 0 14px', textAlign: 'center' }}>
            {lang === 'fr' ? 'Pourquoi DJARA ?' : 'لماذا جارة؟'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🛡️', fr: 'Profils vérifiés — votre sécurité avant tout', ar: 'ملفات موثقة — أمانك أولاً' },
              { icon: '📍', fr: 'Femmes qualifiées dans votre quartier', ar: 'خبيرات في حيّك' },
              { icon: '💬', fr: 'Messagerie sécurisée intégrée', ar: 'مراسلة آمنة داخل التطبيق' },
              { icon: '🤝', fr: 'Entre femmes — un espace de confiance', ar: 'بين النساء — فضاء من الثقة' },
            ].map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, minWidth: 28 }}>{v.icon}</span>
                <span style={{ color: '#292929', fontSize: 13 }}>{lang === 'fr' ? v.fr : v.ar}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav bas */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e8e0', display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', boxShadow: '0 -4px 20px rgba(89,54,74,0.08)' }}>
        {[
          { icon: '🏠', fr: 'Accueil', ar: 'الرئيسية', href: '/', active: true },
          { icon: '🔍', fr: 'Rechercher', ar: 'بحث', href: '/rechercher', active: false },
          { icon: '➕', fr: 'Publier', ar: 'نشر', href: '/publier', active: false },
          { icon: '💬', fr: 'Messages', ar: 'رسائل', href: '/messages', active: false },
          { icon: '👤', fr: 'Profil', ar: 'حسابي', href: '/profil', active: false },
        ].map((item, i) => (
          <Link key={i} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: item.active ? '#59364A' : '#bbb' }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: item.active ? 700 : 400 }}>{lang === 'fr' ? item.fr : item.ar}</span>
          </Link>
        ))}
      </nav>
      <div style={{ height: 80 }} />
    </div>
  );
}
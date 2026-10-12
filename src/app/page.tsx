'use client';
import { useState } from 'react';
import Link from 'next/link';

type Lang = 'fr' | 'ar';

const categories = [
  { icon: '🍳', fr: 'Maison & Quotidien', ar: 'المنزل والحياة اليومية' },
  { icon: '💄', fr: 'Beauté & Bien-être', ar: 'الجمال والعناية' },
  { icon: '📚', fr: 'Éducation', ar: 'التعليم' },
  { icon: '🧵', fr: 'Création & Artisanat', ar: 'الإبداع والحرف' },
  { icon: '💻', fr: 'Digital', ar: 'الرقمي' },
  { icon: '🎉', fr: 'Événements', ar: 'الفعاليات' },
];

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('fr');
  const isRTL = lang === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <header style={{ background: '#59364A', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#FAF7F2', fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>DJARA</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>
            {lang === 'fr' ? 'عربي' : 'FR'}
          </button>
          <Link href="/auth/connexion" style={{ background: '#C77D69', color: '#fff', borderRadius: 20, padding: '6px 14px', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
            {lang === 'fr' ? 'Connexion' : 'دخول'}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #59364A 0%, #C77D69 100%)', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ color: '#FAF7F2', fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>
          {lang === 'fr' ? 'Le talent des femmes,' : 'موهبة المرأة،'}
        </h1>
        <h1 style={{ color: '#C77D69', fontSize: 26, fontWeight: 800, margin: '0 0 16px', background: 'linear-gradient(90deg,#FAF7F2,#A8B5A2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {lang === 'fr' ? 'tout près de vous.' : 'قريبة منك.'}
        </h1>
        <p style={{ color: 'rgba(250,247,242,0.8)', fontSize: 15, margin: '0 0 24px' }}>
          {lang === 'fr' ? 'Trouvez une femme de confiance à proximité' : 'ابحثي عن امرأة موثوقة بالقرب منك'}
        </p>
        {/* Barre de recherche */}
        <div style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
          <input placeholder={lang === 'fr' ? '🔍 Rechercher un service...' : '🔍 ابحثي عن خدمة...'} style={{ flex: 1, padding: '12px 16px', borderRadius: 25, border: 'none', fontSize: 14, outline: 'none' }} />
          <button style={{ background: '#C77D69', border: 'none', borderRadius: 25, padding: '12px 20px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            {lang === 'fr' ? 'Go' : 'بحث'}
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>

        {/* Catégories */}
        <h2 style={{ color: '#292929', fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>
          {lang === 'fr' ? 'Catégories' : 'الفئات'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {categories.map((cat, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '16px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(89,54,74,0.08)', cursor: 'pointer' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{cat.icon}</div>
              <div style={{ color: '#59364A', fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{lang === 'fr' ? cat.fr : cat.ar}</div>
            </div>
          ))}
        </div>

        {/* CTA Inscription */}
        <div style={{ background: 'linear-gradient(135deg, #59364A, #C77D69)', borderRadius: 20, padding: '24px 20px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
          <h3 style={{ color: '#FAF7F2', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
            {lang === 'fr' ? 'Vous avez un talent ?' : 'لديك موهبة؟'}
          </h3>
          <p style={{ color: 'rgba(250,247,242,0.8)', fontSize: 14, margin: '0 0 16px' }}>
            {lang === 'fr' ? 'Proposez vos services et rejoignez la communauté DJARA' : 'قدمي خدماتك وانضمي إلى مجتمع جارة'}
          </p>
          <Link href="/auth/inscription" style={{ display: 'inline-block', background: '#FAF7F2', color: '#59364A', borderRadius: 25, padding: '12px 28px', fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
            {lang === 'fr' ? "S'inscrire gratuitement" : 'التسجيل مجاناً'}
          </Link>
        </div>

        {/* Valeurs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: '🛡️', fr: 'Sécurisé', ar: 'آمن' },
            { icon: '📍', fr: 'À proximité', ar: 'قريب منك' },
            { icon: '⭐', fr: 'Évaluations', ar: 'تقييمات' },
            { icon: '🤝', fr: 'Entre femmes', ar: 'بين النساء' },
          ].map((v, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 8px rgba(89,54,74,0.06)' }}>
              <span style={{ fontSize: 22 }}>{v.icon}</span>
              <span style={{ color: '#292929', fontSize: 13, fontWeight: 600 }}>{lang === 'fr' ? v.fr : v.ar}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation bas */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e8e0', display: 'flex', justifyContent: 'space-around', padding: '10px 0', boxShadow: '0 -4px 20px rgba(89,54,74,0.08)' }}>
        {[
          { icon: '🏠', fr: 'Accueil', ar: 'الرئيسية', href: '/' },
          { icon: '🔍', fr: 'Rechercher', ar: 'بحث', href: '/rechercher' },
          { icon: '➕', fr: 'Publier', ar: 'نشر', href: '/publier' },
          { icon: '💬', fr: 'Messages', ar: 'رسائل', href: '/messages' },
          { icon: '👤', fr: 'Profil', ar: 'حسابي', href: '/profil' },
        ].map((item, i) => (
          <Link key={i} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: i === 0 ? '#59364A' : '#999' }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: i === 0 ? 700 : 400 }}>{lang === 'fr' ? item.fr : item.ar}</span>
          </Link>
        ))}
      </nav>

      <div style={{ height: 80 }} />
    </div>
  );
}
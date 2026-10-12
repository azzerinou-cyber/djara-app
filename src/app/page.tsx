'use client';
import { useState } from 'react';

const categories = [
  { emoji: '🏠', fr: 'Maison & Quotidien', ar: 'المنزل', color: '#FDF0EB' },
  { emoji: '💄', fr: 'Beauté & Bien-être', ar: 'الجمال', color: '#FDF0F5' },
  { emoji: '📚', fr: 'Éducation', ar: 'التعليم', color: '#EFF5FB' },
  { emoji: '🧵', fr: 'Artisanat', ar: 'الحرف', color: '#F0F7EE' },
  { emoji: '💻', fr: 'Digital', ar: 'الرقمي', color: '#F5F0FB' },
  { emoji: '🎉', fr: 'Événements', ar: 'المناسبات', color: '#FDF5E6' },
];

const providers = [
  { name: 'Amina B.', service: 'Coiffure & Henné', wilaya: 'Alger', rating: 4.9, reviews: 47, badge: '✓', emoji: '💇‍♀️' },
  { name: 'Fatima Z.', service: 'Pâtisserie traditionnelle', wilaya: 'Oran', rating: 4.8, reviews: 32, badge: '✓', emoji: '🍰' },
  { name: 'Sara M.', service: 'Soutien scolaire', wilaya: 'Constantine', rating: 5.0, reviews: 28, badge: '✓', emoji: '📖' },
  { name: 'Nadia K.', service: 'Broderie & Couture', wilaya: 'Tizi Ouzou', rating: 4.7, reviews: 19, badge: '✓', emoji: '🧶' },
];

export default function Home() {
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const [search, setSearch] = useState('');
  const isRTL = lang === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#292929' }}>

      {/* HEADER */}
      <header style={{ background: 'white', borderBottom: '1px solid #f0ece6', position: 'sticky', top: 0, zIndex: 100, padding: '0 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>🌸</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#59364A' }}>DJARA</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="/rechercher" style={{ color: '#59364A', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{lang === 'fr' ? 'Rechercher' : 'بحث'}</a>
            <a href="/publier" style={{ color: '#59364A', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{lang === 'fr' ? 'Proposer' : 'نشر'}</a>
            <a href="/messages" style={{ color: '#59364A', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{lang === 'fr' ? 'Messages' : 'رسائل'}</a>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['fr', 'ar'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: '4px 10px', borderRadius: 16, border: 'none', background: lang === l ? '#59364A' : '#f0ece6', color: lang === l ? 'white' : '#59364A', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>{l === 'fr' ? 'FR' : 'ع'}</button>
              ))}
            </div>
            <a href="/auth/inscription" style={{ background: 'linear-gradient(135deg,#59364A,#C77D69)', color: 'white', textDecoration: 'none', padding: '8px 20px', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>
              {lang === 'fr' ? 'Rejoindre' : 'انضمي'}
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg,#59364A 0%,#7a4a65 60%,#C77D69 100%)', padding: '80px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 16px', fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 24, backdropFilter: 'blur(10px)' }}>
            🌸 {lang === 'fr' ? 'La communauté féminine en Algérie' : 'المجتمع النسائي في الجزائر'}
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, color: 'white', margin: '0 0 20px', lineHeight: 1.15 }}>
            {lang === 'fr' ? <>Le talent des femmes,<br /><span style={{ color: '#f5c6b8' }}>tout près de vous</span></> : <>موهبة المرأة،<br /><span style={{ color: '#f5c6b8' }}>بالقرب منك</span></>}
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', margin: '0 0 40px', lineHeight: 1.6 }}>
            {lang === 'fr' ? 'Trouvez une femme de confiance près de chez vous ou proposez vos compétences à votre communauté.' : 'ابحثي عن امرأة موثوقة بالقرب منك أو قدمي مهاراتك لمجتمعك.'}
          </p>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: 8, maxWidth: 560, margin: '0 auto 32px', background: 'white', borderRadius: 16, padding: '8px 8px 8px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'fr' ? '🔍  Coiffure, cuisine, couture...' : '🔍  ابحثي عن خدمة...'}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: '#292929' }}
            />
            <a href={`/rechercher?q=${search}`} style={{ background: 'linear-gradient(135deg,#59364A,#C77D69)', color: 'white', padding: '12px 24px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
              {lang === 'fr' ? 'Rechercher' : 'بحث'}
            </a>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {[
              { n: '2 400+', l: lang === 'fr' ? 'Femmes inscrites' : 'نساء مسجلات' },
              { n: '58', l: lang === 'fr' ? 'Wilayas couvertes' : 'ولاية' },
              { n: '4.9★', l: lang === 'fr' ? 'Note moyenne' : 'التقييم المتوسط' },
            ].map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: '64px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#59364A', margin: '0 0 8px' }}>
            {lang === 'fr' ? 'Explorez les services' : 'استكشفي الخدمات'}
          </h2>
          <p style={{ color: '#888', fontSize: 16 }}>{lang === 'fr' ? 'Des compétences pour chaque besoin' : 'مهارات لكل احتياج'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {categories.map(c => (
            <a key={c.fr} href={`/rechercher?cat=${c.fr}`} style={{ textDecoration: 'none', background: c.color, borderRadius: 20, padding: '28px 16px', textAlign: 'center', border: '1px solid rgba(89,54,74,0.08)', transition: 'transform 0.2s', cursor: 'pointer', display: 'block' }}
              onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{c.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#59364A' }}>{lang === 'fr' ? c.fr : c.ar}</div>
            </a>
          ))}
        </div>
      </section>

      {/* PROVIDERS */}
      <section style={{ padding: '0 20px 64px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#59364A', margin: '0 0 4px' }}>
              {lang === 'fr' ? 'Profils vérifiés' : 'ملفات موثقة'}
            </h2>
            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>{lang === 'fr' ? 'Des femmes de confiance près de vous' : 'نساء موثوقات بالقرب منك'}</p>
          </div>
          <a href="/rechercher" style={{ color: '#C77D69', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            {lang === 'fr' ? 'Voir tout →' : '← عرض الكل'}
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {providers.map(p => (
            <div key={p.name} style={{ background: 'white', borderRadius: 20, padding: '24px', border: '1px solid #f0ece6', boxShadow: '0 2px 16px rgba(89,54,74,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#59364A,#C77D69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{p.emoji}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#292929' }}>{p.name}</span>
                    <span style={{ background: '#A8B5A2', color: 'white', borderRadius: 8, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{p.badge}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>📍 {p.wilaya}</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#59364A', fontWeight: 600, margin: '0 0 12px' }}>{p.service}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: '#C77D69', fontWeight: 700 }}>⭐ {p.rating} <span style={{ color: '#bbb', fontWeight: 400 }}>({p.reviews})</span></div>
                <a href={`/profil/${p.name}`} style={{ background: '#59364A', color: 'white', textDecoration: 'none', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                  {lang === 'fr' ? 'Voir' : 'عرض'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ background: 'linear-gradient(135deg,#59364A,#C77D69)', padding: '64px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌸</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', margin: '0 0 16px' }}>
            {lang === 'fr' ? 'Vous avez un talent à partager ?' : 'لديك موهبة تريدين مشاركتها؟'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, margin: '0 0 32px' }}>
            {lang === 'fr' ? 'Rejoignez des milliers de femmes qui valorisent leurs compétences sur DJARA.' : 'انضمي إلى آلاف النساء اللواتي يُقدِّرن مهاراتهن على جارة.'}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/inscription" style={{ background: 'white', color: '#59364A', textDecoration: 'none', padding: '14px 32px', borderRadius: 14, fontWeight: 700, fontSize: 16 }}>
              {lang === 'fr' ? '✨ Je propose mes services' : '✨ أقدم خدماتي'}
            </a>
            <a href="/rechercher" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', padding: '14px 32px', borderRadius: 14, fontWeight: 700, fontSize: 16, border: '2px solid rgba(255,255,255,0.4)' }}>
              {lang === 'fr' ? 'Je cherche un service' : 'أبحث عن خدمة'}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#2d1f27', color: 'rgba(255,255,255,0.6)', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>🌸 <span style={{ fontWeight: 700, color: 'white' }}>DJARA</span></div>
        <p style={{ margin: '0 0 16px', fontSize: 13 }}>{lang === 'fr' ? 'Le talent des femmes, tout près de vous.' : 'موهبة المرأة، بالقرب منك.'}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 12 }}>
          <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Confidentialité</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Conditions</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Contact</a>
        </div>
        <p style={{ margin: '16px 0 0', fontSize: 11 }}>© 2026 DJARA — Algérie 🇩🇿</p>
      </footer>
    </div>
  );
}
'use client';
import { useState } from 'react';
import Link from 'next/link';

type Lang = 'fr' | 'ar';
type Onglet = 'services' | 'avis' | 'galerie';

const mockProfil = {
  prenom: 'Yasmine',
  nomPro: 'Yasmine Coiffure',
  commune: 'Bab El Oued',
  wilaya: 'Alger',
  bio: 'Coiffeuse professionnelle avec 8 ans d\'expérience. Spécialiste des chignons de mariée, lissages et colorations. Je me déplace à domicile dans tout Alger.',
  categorie: '💄 Beauté & Bien-être',
  specialites: ['Coiffure à domicile', 'Chignons de mariée', 'Lissage', 'Coloration', 'Soins capillaires'],
  tarifMin: 800,
  tarifMax: 3000,
  tarifType: 'prestation',
  disponible: true,
  deplacement: true,
  distanceMax: '25 km',
  badge: true,
  niveauConfiance: 3,
  noteGlobale: 4.9,
  totalAvis: 47,
  totalPrestations: 61,
  membreSince: 'Mars 2024',
};

const mockAvis = [
  { id: 1, prenom: 'Nadia B.', commune: 'El Harrach', note: 5, commentaire: 'Yasmine est exceptionnelle ! Elle est venue à la maison pour le mariage de ma fille. Chignon parfait, tout le monde a demandé son contact.', date: 'Il y a 3 jours', ponctualite: 5, communication: 5, qualite: 5 },
  { id: 2, prenom: 'Houria M.', commune: 'Kouba', note: 5, commentaire: 'Professionnelle, douce et très talentueuse. Je la recommande les yeux fermés pour tout type de coiffure.', date: 'Il y a 1 semaine', ponctualite: 5, communication: 5, qualite: 5 },
  { id: 3, prenom: 'Souad K.', commune: 'Birkhadem', note: 4, commentaire: 'Très bon travail, légèrement en retard mais elle a rattrapé le temps. Résultat magnifique.', date: 'Il y a 2 semaines', ponctualite: 4, communication: 5, qualite: 5 },
];

const mockGalerie = ['🖼️', '🖼️', '🖼️', '🖼️', '🖼️', '🖼️'];

export default function ProfilPage() {
  const [lang, setLang] = useState<Lang>('fr');
  const isRTL = lang === 'ar';
  const [onglet, setOnglet] = useState<Onglet>('services');
  const [showContact, setShowContact] = useState(false);

  const badges = [
    { ok: mockProfil.niveauConfiance >= 1, fr: '📱 Téléphone vérifié', ar: '📱 هاتف موثق' },
    { ok: mockProfil.niveauConfiance >= 2, fr: '🪪 Identité vérifiée', ar: '🪪 هوية موثقة' },
    { ok: mockProfil.niveauConfiance >= 3, fr: '⭐ Profil de confiance', ar: '⭐ ملف موثوق' },
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 80 }}>

      {/* Header */}
      <header style={{ background: '#59364A', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/rechercher" style={{ color: 'rgba(250,247,242,0.7)', fontSize: 20, textDecoration: 'none' }}>←</Link>
          <span style={{ color: '#FAF7F2', fontSize: 16, fontWeight: 700 }}>
            {lang === 'fr' ? 'Profil prestataire' : 'ملف الخدمة'}
          </span>
        </div>
        <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>
          {lang === 'fr' ? 'عربي' : 'FR'}
        </button>
      </header>

      {/* Hero profil */}
      <div style={{ background: 'linear-gradient(180deg, #59364A 0%, #7a4a63 100%)', padding: '28px 20px 20px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #C77D69, #A8B5A2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, border: '3px solid rgba(255,255,255,0.3)' }}>
              👩
            </div>
            {mockProfil.disponible && (
              <div style={{ position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, background: '#4caf50', borderRadius: '50%', border: '2px solid #59364A' }} />
            )}
          </div>
          {/* Infos */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ color: '#FAF7F2', fontSize: 20, fontWeight: 900, margin: 0 }}>{mockProfil.nomPro}</h1>
              {mockProfil.badge && <span style={{ background: '#C77D69', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>✓ VÉRIFIÉ</span>}
            </div>
            <div style={{ color: 'rgba(250,247,242,0.7)', fontSize: 13, marginTop: 2 }}>{mockProfil.categorie}</div>
            <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 12, marginTop: 2 }}>📍 {mockProfil.commune}, {mockProfil.wilaya}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#FAF7F2', fontWeight: 800, fontSize: 16 }}>⭐ {mockProfil.noteGlobale}</div>
                <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 10 }}>{mockProfil.totalAvis} {lang === 'fr' ? 'avis' : 'تقييم'}</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#FAF7F2', fontWeight: 800, fontSize: 16 }}>{mockProfil.totalPrestations}</div>
                <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 10 }}>{lang === 'fr' ? 'prestations' : 'خدمة'}</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#FAF7F2', fontWeight: 800, fontSize: 16 }}>🏅 N{mockProfil.niveauConfiance}</div>
                <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 10 }}>{lang === 'fr' ? 'confiance' : 'ثقة'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={() => setShowContact(true)} style={{ flex: 2, padding: '12px', background: '#C77D69', border: 'none', borderRadius: 25, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            💬 {lang === 'fr' ? 'Contacter' : 'تواصل'}
          </button>
          <Link href="/publier" style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 25, color: '#FAF7F2', fontWeight: 700, fontSize: 14, textAlign: 'center', textDecoration: 'none' }}>
            📅 {lang === 'fr' ? 'Réserver' : 'حجز'}
          </Link>
        </div>
      </div>

      {/* Disponibilité + tarif */}
      <div style={{ background: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0e8e0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: mockProfil.disponible ? '#4caf50' : '#bbb' }} />
          <span style={{ color: mockProfil.disponible ? '#2e7d32' : '#999', fontSize: 13, fontWeight: 600 }}>
            {mockProfil.disponible ? (lang === 'fr' ? 'Disponible maintenant' : 'متاحة الآن') : (lang === 'fr' ? 'Non disponible' : 'غير متاحة')}
          </span>
        </div>
        <div style={{ color: '#59364A', fontWeight: 800, fontSize: 15 }}>
          {mockProfil.tarifMin.toLocaleString()} — {mockProfil.tarifMax.toLocaleString()} DA
          <span style={{ color: '#999', fontSize: 11, fontWeight: 400 }}> / {lang === 'fr' ? 'prestation' : 'خدمة'}</span>
        </div>
      </div>

      {/* Badges de confiance */}
      <div style={{ padding: '16px 20px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {badges.filter(b => b.ok).map((b, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e8ddd6', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#59364A', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {lang === 'fr' ? b.fr : b.ar}
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '2px solid #f0e8e0' }}>
        {([['services', lang === 'fr' ? '🛠️ Services' : '🛠️ خدمات'], ['avis', lang === 'fr' ? `⭐ Avis (${mockProfil.totalAvis})` : `⭐ تقييمات (${mockProfil.totalAvis})`], ['galerie', lang === 'fr' ? '📸 Galerie' : '📸 معرض']] as [Onglet, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setOnglet(id)} style={{ flex: 1, padding: '12px 4px', border: 'none', background: 'none', color: onglet === id ? '#59364A' : '#999', fontWeight: onglet === id ? 700 : 400, fontSize: 12, cursor: 'pointer', borderBottom: `3px solid ${onglet === id ? '#59364A' : 'transparent'}`, transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px' }}>

        {/* ══ Onglet Services ══ */}
        {onglet === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Bio */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px' }}>
              <div style={{ color: '#59364A', fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
                {lang === 'fr' ? 'À propos' : 'نبذة عني'}
              </div>
              <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{mockProfil.bio}</p>
            </div>

            {/* Spécialités */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px' }}>
              <div style={{ color: '#59364A', fontWeight: 800, fontSize: 14, marginBottom: 10 }}>
                {lang === 'fr' ? 'Spécialités' : 'التخصصات'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {mockProfil.specialites.map((s, i) => (
                  <span key={i} style={{ background: '#FAF7F2', border: '1px solid #e8ddd6', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: '#59364A' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Déplacement */}
            {mockProfil.deplacement && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 24 }}>🚗</span>
                <div>
                  <div style={{ color: '#292929', fontWeight: 700, fontSize: 14 }}>
                    {lang === 'fr' ? 'Se déplace à domicile' : 'تتنقل إلى المنزل'}
                  </div>
                  <div style={{ color: '#999', fontSize: 12 }}>
                    {lang === 'fr' ? `Dans un rayon de ${mockProfil.distanceMax}` : `في نطاق ${mockProfil.distanceMax}`}
                  </div>
                </div>
              </div>
            )}

            {/* Membre depuis */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#999', fontSize: 13 }}>
                {lang === 'fr' ? 'Membre DJARA depuis' : 'عضوة في DJARA منذ'}
              </span>
              <span style={{ color: '#59364A', fontWeight: 700, fontSize: 13 }}>{mockProfil.membreSince}</span>
            </div>

            {/* Sécurité */}
            <div style={{ background: '#fff3e0', borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18 }}>🔒</span>
              <div style={{ color: '#e65100', fontSize: 12, lineHeight: 1.5 }}>
                {lang === 'fr'
                  ? 'Pour votre sécurité, les échanges et paiements se font uniquement via DJARA. Ne communiquez jamais vos coordonnées bancaires en dehors de l\'application.'
                  : 'لأمانك، تتم جميع الاتصالات والمدفوعات عبر DJARA فقط. لا تشاركي معلوماتك المصرفية خارج التطبيق.'}
              </div>
            </div>
          </div>
        )}

        {/* ══ Onglet Avis ══ */}
        {onglet === 'avis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Résumé notes */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#59364A', fontSize: 36, fontWeight: 900 }}>{mockProfil.noteGlobale}</div>
                <div style={{ color: '#C77D69', fontSize: 16 }}>{'⭐'.repeat(5)}</div>
                <div style={{ color: '#999', fontSize: 11 }}>{mockProfil.totalAvis} {lang === 'fr' ? 'avis' : 'تقييم'}</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: lang === 'fr' ? 'Qualité' : 'الجودة', val: 4.9 },
                  { label: lang === 'fr' ? 'Communication' : 'التواصل', val: 5.0 },
                  { label: lang === 'fr' ? 'Ponctualité' : 'الالتزام', val: 4.8 },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: '#999', fontSize: 11, minWidth: 90 }}>{item.label}</span>
                    <div style={{ flex: 1, background: '#f0e8e0', borderRadius: 4, height: 6 }}>
                      <div style={{ width: `${(item.val / 5) * 100}%`, height: '100%', background: '#C77D69', borderRadius: 4 }} />
                    </div>
                    <span style={{ color: '#59364A', fontSize: 11, fontWeight: 700 }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liste avis */}
            {mockAvis.map(avis => (
              <div key={avis.id} style={{ background: '#fff', borderRadius: 16, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ color: '#292929', fontWeight: 700, fontSize: 14 }}>{avis.prenom}</div>
                    <div style={{ color: '#999', fontSize: 11 }}>📍 {avis.commune}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#C77D69', fontSize: 14 }}>{'⭐'.repeat(avis.note)}</div>
                    <div style={{ color: '#bbb', fontSize: 10 }}>{avis.date}</div>
                  </div>
                </div>
                <p style={{ color: '#555', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{avis.commentaire}</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  {[
                    { label: lang === 'fr' ? 'Qualité' : 'جودة', val: avis.qualite },
                    { label: lang === 'fr' ? 'Comm.' : 'تواصل', val: avis.communication },
                    { label: lang === 'fr' ? 'Ponct.' : 'التزام', val: avis.ponctualite },
                  ].map((item, i) => (
                    <div key={i} style={{ background: '#FAF7F2', borderRadius: 10, padding: '4px 10px', fontSize: 11, color: '#59364A' }}>
                      {item.label} {item.val}/5
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ Onglet Galerie ══ */}
        {onglet === 'galerie' && (
          <div>
            <div style={{ color: '#999', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
              {lang === 'fr' ? 'Réalisations de Yasmine' : 'أعمال ياسمين'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
              {mockGalerie.map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', background: 'linear-gradient(135deg, #e8ddd6, #f0e8e0)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {['💇‍♀️', '👰', '✂️', '💄', '🎀', '💅'][i % 6]}
                </div>
              ))}
            </div>
            <div style={{ color: '#bbb', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
              {lang === 'fr' ? 'Les vraies photos seront chargées depuis Supabase Storage' : 'سيتم تحميل الصور الحقيقية من Supabase'}
            </div>
          </div>
        )}
      </div>

      {/* Modal Contact */}
      {showContact && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: '#FAF7F2', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%' }}>
            <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ color: '#292929', fontSize: 18, fontWeight: 900, margin: '0 0 4px' }}>
              {lang === 'fr' ? 'Contacter Yasmine' : 'التواصل مع ياسمين'}
            </h3>
            <p style={{ color: '#999', fontSize: 13, margin: '0 0 20px' }}>
              {lang === 'fr' ? 'Les échanges se font en toute sécurité via la messagerie DJARA.' : 'تتم المحادثات بأمان عبر رسائل DJARA.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/messages" style={{ background: '#59364A', color: '#FAF7F2', borderRadius: 25, padding: '14px', textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                💬 {lang === 'fr' ? 'Envoyer un message' : 'إرسال رسالة'}
              </Link>
              <Link href="/publier" style={{ background: '#C77D69', color: '#FAF7F2', borderRadius: 25, padding: '14px', textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                📅 {lang === 'fr' ? 'Demander un devis' : 'طلب عرض سعر'}
              </Link>
              <button onClick={() => setShowContact(false)} style={{ background: 'transparent', border: 'none', color: '#999', fontSize: 14, cursor: 'pointer', padding: '10px' }}>
                {lang === 'fr' ? 'Annuler' : 'إلغاء'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nav bas */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e8e0', display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', boxShadow: '0 -4px 20px rgba(89,54,74,0.08)', zIndex: 50 }}>
        {[
          { icon: '🏠', fr: 'Accueil', ar: 'الرئيسية', href: '/' },
          { icon: '🔍', fr: 'Rechercher', ar: 'بحث', href: '/rechercher' },
          { icon: '➕', fr: 'Publier', ar: 'نشر', href: '/publier' },
          { icon: '💬', fr: 'Messages', ar: 'رسائل', href: '/messages' },
          { icon: '👤', fr: 'Profil', ar: 'حسابي', href: '/profil', active: true },
        ].map((item, i) => (
          <Link key={i} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: (item as {active?:boolean}).active ? '#59364A' : '#bbb' }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: (item as {active?:boolean}).active ? 700 : 400 }}>{lang === 'fr' ? item.fr : item.ar}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Lang = 'fr' | 'ar';
type Onglet = 'services' | 'avis' | 'galerie';

const mockProfiles: Record<string, {
  prenom: string; nomPro: string; commune: string; wilaya: string;
  bio: string; categorie: string; specialites: string[];
  tarifMin: number; tarifMax: number; tarifType: string;
  disponible: boolean; deplacement: boolean; distanceMax: string;
  badge: boolean; niveauConfiance: number;
  noteGlobale: number; totalAvis: number; totalPrestations: number;
  membreSince: string; avatar: string;
}> = {
  '1': {
    prenom: 'Yasmine', nomPro: 'Yasmine Coiffure', commune: 'Bab El Oued', wilaya: 'Alger',
    bio: 'Coiffeuse professionnelle avec 8 ans d\'expérience. Spécialisée dans les chignons de mariée, les coiffures traditionnelles et les soins capillaires naturels. Je me déplace à domicile dans tout Alger.',
    categorie: '💄 Beauté & Bien-être', specialites: ['Coiffure à domicile', 'Chignons de mariée', 'Soins capillaires', 'Henné'],
    tarifMin: 800, tarifMax: 3000, tarifType: 'prestation',
    disponible: true, deplacement: true, distanceMax: '25 km',
    badge: true, niveauConfiance: 3, noteGlobale: 4.9, totalAvis: 47, totalPrestations: 61, membreSince: 'Mars 2024', avatar: '👩',
  },
  '2': {
    prenom: 'Nadia', nomPro: 'Nadia Pâtisserie', commune: 'Hydra', wilaya: 'Alger',
    bio: 'Pâtissière passionnée, autodidacte depuis 10 ans. Gâteaux traditionnels algériens, pièces montées et pâtisseries orientales pour tous vos événements.',
    categorie: '🍳 Maison & Quotidien', specialites: ['Gâteaux traditionnels', 'Pièces montées', 'Makroud', 'Baklawa'],
    tarifMin: 1500, tarifMax: 8000, tarifType: 'prestation',
    disponible: true, deplacement: false, distanceMax: '',
    badge: true, niveauConfiance: 2, noteGlobale: 4.7, totalAvis: 32, totalPrestations: 44, membreSince: 'Juin 2024', avatar: '👩‍🍳',
  },
  '3': {
    prenom: 'Houria', nomPro: 'Prof Houria', commune: 'El Biar', wilaya: 'Alger',
    bio: 'Enseignante en mathématiques et physique, 15 ans d\'expérience. Cours particuliers du primaire au lycée, préparation BEM et BAC.',
    categorie: '📚 Éducation', specialites: ['Mathématiques', 'Physique-Chimie', 'Soutien BEM', 'Prépa BAC'],
    tarifMin: 600, tarifMax: 1200, tarifType: 'heure',
    disponible: false, deplacement: true, distanceMax: '10 km',
    badge: false, niveauConfiance: 2, noteGlobale: 4.8, totalAvis: 28, totalPrestations: 115, membreSince: 'Janvier 2024', avatar: '👩‍🏫',
  },
  '4': {
    prenom: 'Samia', nomPro: 'Samia Couture', commune: 'Kouba', wilaya: 'Alger',
    bio: 'Couturière et broderie traditionnelle. Création de robes kabyles, tenues de cérémonie et retouches. Travail soigné et délais respectés.',
    categorie: '🧵 Création & Artisanat', specialites: ['Robes kabyles', 'Broderie traditionnelle', 'Retouches', 'Tenues de cérémonie'],
    tarifMin: 2000, tarifMax: 15000, tarifType: 'prestation',
    disponible: true, deplacement: false, distanceMax: '',
    badge: true, niveauConfiance: 3, noteGlobale: 5.0, totalAvis: 19, totalPrestations: 23, membreSince: 'Septembre 2024', avatar: '👩‍🎨',
  },
};

const mockAvis = [
  { id: 1, prenom: 'Fatima', note: 5, commentaire: 'Travail magnifique, je suis ravie ! Très professionnelle et ponctuelle.', date: 'Il y a 2 jours', ponctualite: 5, communication: 5, qualite: 5 },
  { id: 2, prenom: 'Amina', note: 5, commentaire: 'Je recommande vivement. Ma fille était superbe pour son mariage.', date: 'Il y a 1 semaine', ponctualite: 4, communication: 5, qualite: 5 },
  { id: 3, prenom: 'Karima', note: 4, commentaire: 'Très bon travail, résultat conforme à mes attentes.', date: 'Il y a 2 semaines', ponctualite: 4, communication: 4, qualite: 5 },
];

const galerie = ['🎨', '✨', '💅', '🌸', '💄', '👑', '🌟', '💫', '🎀'];

export default function ProfilDynamiquePage() {
  const params = useParams();
  const id = params?.id as string;
  const profil = mockProfiles[id] || mockProfiles['1'];

  const [lang, setLang] = useState<Lang>('fr');
  const isRTL = lang === 'ar';
  const [onglet, setOnglet] = useState<Onglet>('services');
  const [contactModal, setContactModal] = useState(false);

  const t = {
    fr: {
      disponible: 'Disponible', indisponible: 'Indisponible',
      avis: 'avis', prestations: 'prestations', membre: 'Membre depuis',
      services: 'Services', avisTab: 'Avis', galerie: 'Galerie',
      bio: 'À propos', specialites: 'Spécialités',
      tarif: 'Tarif indicatif', deplacement: 'Se déplace jusqu\'à',
      contact: 'Contacter', demande: 'Faire une demande',
      securite: 'Pour votre sécurité, les échanges se font uniquement via DJARA.',
      adresse: 'L\'adresse exacte n\'est jamais affichée publiquement.',
      niveau: ['', 'Téléphone vérifié', 'Identité vérifiée', 'Profil de confiance'],
      ponctualite: 'Ponctualité', communication: 'Communication', qualite: 'Qualité',
      retour: '← Retour',
    },
    ar: {
      disponible: 'متاحة', indisponible: 'غير متاحة',
      avis: 'تقييم', prestations: 'خدمة', membre: 'عضو منذ',
      services: 'الخدمات', avisTab: 'التقييمات', galerie: 'المعرض',
      bio: 'نبذة عني', specialites: 'التخصصات',
      tarif: 'السعر التقريبي', deplacement: 'تنتقل حتى',
      contact: 'تواصلي', demande: 'طلب خدمة',
      securite: 'لأمانك، التواصل والدفع يتم فقط عبر DJARA.',
      adresse: 'عنوانك الدقيق لن يُعرض للعموم أبداً.',
      niveau: ['', 'هاتف موثق', 'هوية موثقة', 'ملف موثوق'],
      ponctualite: 'الالتزام بالوقت', communication: 'التواصل', qualite: 'جودة الخدمة',
      retour: 'رجوع →',
    },
  }[lang];

  const StarBar = ({ label, val }: { label: string; val: number }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: '#999', width: 90, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, background: '#f0e8e0', borderRadius: 2 }}>
        <div style={{ width: `${(val / 5) * 100}%`, height: '100%', background: '#C77D69', borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: '#666', width: 20 }}>{val}</span>
    </div>
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 100 }}>

      <header style={{ background: '#59364A', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/rechercher" style={{ color: '#FAF7F2', textDecoration: 'none', fontSize: 14 }}>{t.retour}</Link>
        <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>
          {lang === 'fr' ? 'عربي' : 'FR'}
        </button>
      </header>

      <div style={{ background: 'linear-gradient(160deg, #59364A 0%, #7a4d68 100%)', padding: '24px 20px 32px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 }}>{profil.avatar}</div>
            {profil.disponible && <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, background: '#4caf50', borderRadius: '50%', border: '2px solid #59364A' }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ color: '#FAF7F2', fontSize: 20, fontWeight: 900, margin: 0 }}>{profil.nomPro}</h1>
              {profil.badge && <span style={{ background: '#C77D69', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>✓ VÉRIFIÉ</span>}
            </div>
            <div style={{ color: 'rgba(250,247,242,0.7)', fontSize: 13, marginTop: 2 }}>{profil.categorie}</div>
            <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 12, marginTop: 2 }}>📍 {profil.commune}, {profil.wilaya}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              {[
                { val: profil.noteGlobale, label: '★ Note' },
                { val: profil.totalAvis, label: t.avis },
                { val: profil.totalPrestations, label: t.prestations },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ color: '#FAF7F2', fontWeight: 900, fontSize: 16 }}>{s.val}</div>
                  <div style={{ color: 'rgba(250,247,242,0.5)', fontSize: 10 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
          {[1, 2, 3].map(n => (
            <span key={n} style={{ background: n <= profil.niveauConfiance ? 'rgba(168,181,162,0.3)' : 'rgba(255,255,255,0.05)', border: `1px solid ${n <= profil.niveauConfiance ? '#A8B5A2' : 'rgba(255,255,255,0.1)'}`, color: n <= profil.niveauConfiance ? '#c8d8c2' : 'rgba(255,255,255,0.2)', fontSize: 10, padding: '3px 10px', borderRadius: 20 }}>
              {n <= profil.niveauConfiance ? '✓' : '○'} {t.niveau[n]}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <span style={{ background: profil.disponible ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.1)', color: profil.disponible ? '#81c784' : 'rgba(255,255,255,0.4)', fontSize: 12, padding: '4px 12px', borderRadius: 20, border: `1px solid ${profil.disponible ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.15)'}` }}>
            {profil.disponible ? '● ' + t.disponible : '○ ' + t.indisponible}
          </span>
        </div>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #f0e8e0', display: 'flex' }}>
        {(['services', 'avis', 'galerie'] as Onglet[]).map(o => (
          <button key={o} onClick={() => setOnglet(o)} style={{ flex: 1, padding: '14px 0', background: 'none', border: 'none', borderBottom: onglet === o ? '2px solid #59364A' : '2px solid transparent', color: onglet === o ? '#59364A' : '#999', fontSize: 13, fontWeight: onglet === o ? 700 : 400, cursor: 'pointer' }}>
            {o === 'services' ? t.services : o === 'avis' ? t.avisTab : t.galerie}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 16px' }}>
        {onglet === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
              <div style={{ color: '#59364A', fontWeight: 800, fontSize: 14, marginBottom: 8 }}>{t.bio}</div>
              <p style={{ color: '#555', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{profil.bio}</p>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
              <div style={{ color: '#59364A', fontWeight: 800, fontSize: 14, marginBottom: 10 }}>{t.specialites}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profil.specialites.map((s, i) => (
                  <span key={i} style={{ background: '#FAF7F2', border: '1px solid #e8ddd6', color: '#59364A', fontSize: 12, padding: '5px 12px', borderRadius: 20 }}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
              <div style={{ color: '#59364A', fontWeight: 800, fontSize: 14, marginBottom: 10 }}>💰 {t.tarif}</div>
              <div style={{ color: '#292929', fontSize: 18, fontWeight: 900 }}>{profil.tarifMin.toLocaleString()} – {profil.tarifMax.toLocaleString()} DA</div>
              <div style={{ color: '#999', fontSize: 12, marginTop: 2 }}>par {profil.tarifType}</div>
              {profil.deplacement && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: '#FAF7F2', borderRadius: 10, fontSize: 13, color: '#555' }}>
                  🚗 {t.deplacement} <strong>{profil.distanceMax}</strong>
                </div>
              )}
            </div>
            <div style={{ background: '#e8f5e9', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <span style={{ color: '#2e7d32', fontSize: 12, lineHeight: 1.5 }}>{t.adresse}</span>
            </div>
            <div style={{ color: '#999', fontSize: 11, textAlign: 'center' }}>{t.membre} {profil.membreSince}</div>
          </div>
        )}

        {onglet === 'avis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: '#59364A' }}>{profil.noteGlobale}</div>
                  <div style={{ color: '#C77D69', fontSize: 16 }}>{'★'.repeat(Math.round(profil.noteGlobale))}</div>
                  <div style={{ color: '#999', fontSize: 11 }}>{profil.totalAvis} {t.avis}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <StarBar label={t.ponctualite} val={4.8} />
                  <StarBar label={t.communication} val={4.9} />
                  <StarBar label={t.qualite} val={5.0} />
                </div>
              </div>
            </div>
            {mockAvis.map(a => (
              <div key={a.id} style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #C77D69, #A8B5A2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>{a.prenom[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#292929', fontSize: 14 }}>{a.prenom}</div>
                      <div style={{ color: '#bbb', fontSize: 11 }}>{a.date}</div>
                    </div>
                  </div>
                  <div style={{ color: '#C77D69', fontSize: 14 }}>{'★'.repeat(a.note)}</div>
                </div>
                <p style={{ color: '#555', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{a.commentaire}</p>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {[{ k: t.ponctualite, v: a.ponctualite }, { k: t.communication, v: a.communication }, { k: t.qualite, v: a.qualite }].map((x, i) => (
                    <span key={i} style={{ background: '#FAF7F2', fontSize: 10, padding: '2px 8px', borderRadius: 10, color: '#666' }}>{x.k} {x.v}/5</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {onglet === 'galerie' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
              {galerie.map((emoji, i) => (
                <div key={i} style={{ aspectRatio: '1', background: 'linear-gradient(135deg, #f0e8e0, #e8ddd6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{emoji}</div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 16, color: '#bbb', fontSize: 12 }}>
              {lang === 'fr' ? 'Photos de réalisations' : 'صور الأعمال'}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e8e0', padding: '12px 16px', display: 'flex', gap: 10, zIndex: 50 }}>
        <button onClick={() => setContactModal(true)} style={{ flex: 1, padding: '13px', background: '#FAF7F2', border: '2px solid #59364A', borderRadius: 25, color: '#59364A', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          💬 {t.contact}
        </button>
        <Link href="/messages" style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, #59364A, #7a4d68)', borderRadius: 25, color: '#FAF7F2', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
          ✨ {t.demande}
        </Link>
      </div>

      {contactModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div onClick={() => setContactModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px' }}>
            <div style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 40 }}>{profil.avatar}</div>
              <div style={{ fontWeight: 800, color: '#292929', fontSize: 16 }}>{profil.nomPro}</div>
              <div style={{ color: '#999', fontSize: 13 }}>{profil.commune}</div>
            </div>
            <div style={{ background: '#fff3e0', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8 }}>
              <span>🔒</span>
              <span style={{ color: '#e65100', fontSize: 12 }}>{t.securite}</span>
            </div>
            <Link href="/messages" style={{ display: 'block', width: '100%', padding: '14px', background: '#59364A', borderRadius: 25, color: '#FAF7F2', fontSize: 15, fontWeight: 700, textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
              💬 {lang === 'fr' ? 'Envoyer un message' : 'إرسال رسالة'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
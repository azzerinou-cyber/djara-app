'use client';
import { useState } from 'react';
import Link from 'next/link';

type Lang = 'fr' | 'ar';
type Onglet = 'profil' | 'services' | 'avis' | 'parametres';

export default function MonProfilPage() {
  const [lang, setLang] = useState<Lang>('fr');
  const isRTL = lang === 'ar';
  const [onglet, setOnglet] = useState<Onglet>('profil');
  const [modePrestataire, setModePrestataire] = useState(true);
  const [disponible, setDisponible] = useState(true);
  const [profilVisible, setProfilVisible] = useState(true);

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
      totalPrestations: 'Prestations',
      noteGlobale: 'Note globale',
      vuesProfile: 'Vues profil',
      mesServices: 'Mes services',
      ajouterService: '+ Ajouter un service',
      aucunService: 'Vous n\'avez pas encore ajouté de service.',
      avisRecus: 'Avis reçus',
      aucunAvis: 'Vous n\'avez pas encore reçu d\'avis.',
      securite: 'Sécurité & Confidentialité',
      notifications: 'Notifications',
      langue: 'Langue',
      aide: 'Aide & Support',
      deconnexion: 'Se déconnecter',
      suppressionCompte: 'Supprimer mon compte',
      politiqueConf: 'Politique de confidentialité',
      cgv: 'Conditions d\'utilisation',
      verifierIdentite: 'Vérifier mon identité',
      verifierTel: 'Téléphone vérifié ✓',
      bio: 'À propos de moi',
      editBio: 'Décrivez vos compétences et votre expérience...',
      retour: '← Retour',
      partager: 'Partager mon profil',
      voir: 'Voir mon profil public',
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
      editBio: 'صفي مهاراتك وخبراتك...',
      retour: 'رجوع →',
      partager: 'مشاركة ملفي',
      voir: 'عرض ملفي العام',
    },
  }[lang];

  const mockUser = {
    prenom: 'Yasmine',
    nomPro: 'Yasmine Coiffure',
    commune: 'Bab El Oued',
    wilaya: 'Alger',
    categorie: '💄 Beauté & Bien-être',
    avatar: '👩',
    niveauConfiance: 2,
    noteGlobale: 4.9,
    totalAvis: 12,
    totalPrestations: 18,
    vuesProfile: 143,
    membreSince: 'Mars 2024',
    bio: 'Coiffeuse professionnelle avec 8 ans d\'expérience. Spécialisée dans les chignons de mariée et les soins capillaires naturels.',
    telephone: '+213 6** *** **47',
  };

  const mockServices = [
    { id: 1, titre: 'Coiffure à domicile', tarif: '800 – 2000 DA', actif: true },
    { id: 2, titre: 'Chignons de mariée', tarif: '2000 – 5000 DA', actif: true },
    { id: 3, titre: 'Soins capillaires', tarif: '600 – 1500 DA', actif: false },
  ];

  const mockAvis = [
    { id: 1, prenom: 'Fatima', note: 5, commentaire: 'Travail magnifique !', date: 'Il y a 3 jours' },
    { id: 2, prenom: 'Amina', note: 5, commentaire: 'Très professionnelle.', date: 'Il y a 1 semaine' },
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 100 }}>

      {/* Header */}
      <header style={{ background: '#59364A', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ color: '#FAF7F2', fontSize: 16, fontWeight: 800 }}>{t.titre}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>
            {lang === 'fr' ? 'عربي' : 'FR'}
          </button>
        </div>
      </header>

      {/* Hero profil */}
      <div style={{ background: 'linear-gradient(160deg, #59364A 0%, #7a4d68 100%)', padding: '24px 20px 28px' }}>
        {/* Avatar + infos */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, cursor: 'pointer' }}>
              {mockUser.avatar}
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, background: '#C77D69', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid #59364A', cursor: 'pointer' }}>✏️</div>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#FAF7F2', fontSize: 18, fontWeight: 900, margin: '0 0 2px' }}>{mockUser.prenom}</h1>
            <div style={{ color: 'rgba(250,247,242,0.7)', fontSize: 12 }}>{mockUser.categorie}</div>
            <div style={{ color: 'rgba(250,247,242,0.5)', fontSize: 11, marginTop: 2 }}>📍 {mockUser.commune}, {mockUser.wilaya}</div>
            <div style={{ color: 'rgba(250,247,242,0.4)', fontSize: 11, marginTop: 2 }}>🗓 {t.membre} {mockUser.membreSince}</div>
          </div>
          <button style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#FAF7F2', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>
            {t.modifier}
          </button>
        </div>

        {/* Toggles disponibilité + visibilité */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <button onClick={() => setDisponible(!disponible)} style={{ background: disponible ? 'rgba(76,175,80,0.25)' : 'rgba(255,255,255,0.1)', border: `1px solid ${disponible ? 'rgba(76,175,80,0.5)' : 'rgba(255,255,255,0.2)'}`, color: disponible ? '#81c784' : 'rgba(255,255,255,0.5)', fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer' }}>
            {disponible ? '● ' + t.disponible : '○ ' + t.indisponible}
          </button>
          <button onClick={() => setProfilVisible(!profilVisible)} style={{ background: profilVisible ? 'rgba(168,181,162,0.2)' : 'rgba(255,100,100,0.15)', border: `1px solid ${profilVisible ? 'rgba(168,181,162,0.4)' : 'rgba(255,100,100,0.3)'}`, color: profilVisible ? '#A8B5A2' : '#ef9a9a', fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer' }}>
            {profilVisible ? '👁 ' + t.profilVisible : '🙈 ' + t.profilCache}
          </button>
          <button onClick={() => setModePrestataire(!modePrestataire)} style={{ background: modePrestataire ? 'rgba(199,125,105,0.25)' : 'rgba(255,255,255,0.1)', border: `1px solid ${modePrestataire ? 'rgba(199,125,105,0.5)' : 'rgba(255,255,255,0.2)'}`, color: modePrestataire ? '#C77D69' : 'rgba(255,255,255,0.5)', fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer' }}>
            {modePrestataire ? '💼 ' + t.modePrestataire : '🔍 ' + t.modeCherche}
          </button>
        </div>

        {/* Niveau de confiance */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[1, 2, 3].map(n => (
            <span key={n} style={{ background: n <= mockUser.niveauConfiance ? 'rgba(168,181,162,0.3)' : 'rgba(255,255,255,0.05)', border: `1px solid ${n <= mockUser.niveauConfiance ? '#A8B5A2' : 'rgba(255,255,255,0.1)'}`, color: n <= mockUser.niveauConfiance ? '#c8d8c2' : 'rgba(255,255,255,0.2)', fontSize: 10, padding: '3px 10px', borderRadius: 20 }}>
              {n <= mockUser.niveauConfiance ? '✓' : '○'} {t.niveau[n]}
            </span>
          ))}
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ background: '#fff', margin: '0', padding: '16px 20px', display: 'flex', justifyContent: 'space-around', borderBottom: '1px solid #f0e8e0' }}>
        {[
          { val: mockUser.noteGlobale, label: t.noteGlobale, icon: '⭐' },
          { val: mockUser.totalAvis, label: t.totalAvis, icon: '💬' },
          { val: mockUser.totalPrestations, label: t.totalPrestations, icon: '✅' },
          { val: mockUser.vuesProfile, label: t.vuesProfile, icon: '👁' },
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
        <Link href="/profil/1" style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e8ddd6', borderRadius: 12, color: '#59364A', fontSize: 12, fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
          👁 {t.voir}
        </Link>
        <button style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e8ddd6', borderRadius: 12, color: '#59364A', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          🔗 {t.partager}
        </button>
      </div>

      {/* Onglets */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0e8e0', display: 'flex' }}>
        {(['profil', 'services', 'avis', 'parametres'] as Onglet[]).map(o => (
          <button key={o} onClick={() => setOnglet(o)} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', borderBottom: onglet === o ? '2px solid #59364A' : '2px solid transparent', color: onglet === o ? '#59364A' : '#bbb', fontSize: 12, fontWeight: onglet === o ? 700 : 400, cursor: 'pointer' }}>
            {o === 'profil' ? t.profil : o === 'services' ? t.services : o === 'avis' ? t.avis : t.parametres}
          </button>
        ))}
      </div>

      {/* Contenu onglets */}
      <div style={{ padding: '16px' }}>

        {/* PROFIL */}
        {onglet === 'profil' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
              <div style={{ color: '#59364A', fontWeight: 800, fontSize: 13, marginBottom: 8 }}>{t.bio}</div>
              <p style={{ color: '#555', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{mockUser.bio}</p>
              <button style={{ marginTop: 10, background: 'none', border: '1px dashed #C77D69', color: '#C77D69', borderRadius: 10, padding: '8px 14px', fontSize: 12, cursor: 'pointer', width: '100%' }}>
                ✏️ {t.modifier}
              </button>
            </div>

            {/* Téléphone */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 16 }}>
              <div style={{ color: '#59364A', fontWeight: 800, fontSize: 13, marginBottom: 10 }}>📱 {t.verifierTel}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#555', fontSize: 13 }}>{mockUser.telephone}</span>
                <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: 11, padding: '3px 10px', borderRadius: 10 }}>✓ Vérifié</span>
              </div>
            </div>

            {/* Vérification identité */}
            <div style={{ background: 'linear-gradient(135deg, #fff8f0, #fff3e8)', borderRadius: 16, padding: 16, border: '1px solid #f0d8c8' }}>
              <div style={{ color: '#59364A', fontWeight: 800, fontSize: 13, marginBottom: 6 }}>🔐 {t.verifierIdentite}</div>
              <p style={{ color: '#888', fontSize: 12, lineHeight: 1.5, margin: '0 0 10px' }}>
                {lang === 'fr' ? 'Augmentez la confiance de vos clientes en vérifiant votre identité. Vos documents sont traités de façon confidentielle.' : 'زيدي ثقة زبوناتك عبر توثيق هويتك. وثائقك تُعالَج بسرية تامة.'}
              </p>
              <button style={{ background: '#59364A', color: '#FAF7F2', border: 'none', borderRadius: 20, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                {t.verifierIdentite} →
              </button>
            </div>
          </div>
        )}

        {/* SERVICES */}
        {onglet === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: '#59364A', fontWeight: 800, fontSize: 14 }}>{t.mesServices}</span>
              <Link href="/publier" style={{ background: '#C77D69', color: '#fff', borderRadius: 20, padding: '7px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                {t.ajouterService}
              </Link>
            </div>
            {mockServices.map(s => (
              <div key={s.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${s.actif ? '#f0e8e0' : '#f5f0f0'}` }}>
                <div>
                  <div style={{ fontWeight: 700, color: s.actif ? '#292929' : '#bbb', fontSize: 14 }}>{s.titre}</div>
                  <div style={{ color: '#C77D69', fontSize: 12, marginTop: 2 }}>{s.tarif}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ background: s.actif ? '#e8f5e9' : '#fafafa', color: s.actif ? '#2e7d32' : '#bbb', fontSize: 10, padding: '3px 10px', borderRadius: 10, border: `1px solid ${s.actif ? '#c8e6c9' : '#e0e0e0'}` }}>
                    {s.actif ? (lang === 'fr' ? 'Actif' : 'نشط') : (lang === 'fr' ? 'Inactif' : 'غير نشط')}
                  </span>
                  <button style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer' }}>⋯</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AVIS */}
        {onglet === 'avis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#59364A' }}>{mockUser.noteGlobale}</div>
                <div style={{ color: '#C77D69', fontSize: 14 }}>★★★★★</div>
                <div style={{ color: '#bbb', fontSize: 11 }}>{mockUser.totalAvis} {t.totalAvis}</div>
              </div>
              <div style={{ flex: 1, color: '#555', fontSize: 13 }}>
                {lang === 'fr' ? 'Votre réputation est excellente. Continuez comme ça !' : 'سمعتك ممتازة، استمري هكذا!'}
              </div>
            </div>
            {mockAvis.map(a => (
              <div key={a.id} style={{ background: '#fff', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C77D69, #A8B5A2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>{a.prenom[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#292929', fontSize: 13 }}>{a.prenom}</div>
                      <div style={{ color: '#bbb', fontSize: 11 }}>{a.date}</div>
                    </div>
                  </div>
                  <div style={{ color: '#C77D69' }}>{'★'.repeat(a.note)}</div>
                </div>
                <p style={{ color: '#555', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{a.commentaire}</p>
              </div>
            ))}
          </div>
        )}

        {/* PARAMÈTRES */}
        {onglet === 'parametres' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '🔔', label: t.notifications, arrow: true },
              { icon: '🌐', label: t.langue + ` (${lang === 'fr' ? 'Français' : 'العربية'})`, arrow: true },
              { icon: '🔒', label: t.securite, arrow: true },
              { icon: '❓', label: t.aide, arrow: true },
              { icon: '📄', label: t.politiqueConf, arrow: true },
              { icon: '📋', label: t.cgv, arrow: true },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ color: '#292929', fontSize: 14 }}>{item.label}</span>
                </div>
                <span style={{ color: '#bbb' }}>›</span>
              </div>
            ))}

            <div style={{ height: 1, background: '#f0e8e0', margin: '8px 0' }} />

            <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>🚪</span>
                <span style={{ color: '#C77D69', fontSize: 14, fontWeight: 600 }}>{t.deconnexion}</span>
              </div>
              <span style={{ color: '#bbb' }}>›</span>
            </div>

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

      {/* Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e8e0', display: 'flex', zIndex: 50 }}>
        {[
          { href: '/', icon: '🏠', label: lang === 'fr' ? 'Accueil' : 'الرئيسية' },
          { href: '/rechercher', icon: '🔍', label: lang === 'fr' ? 'Rechercher' : 'بحث' },
          { href: '/publier', icon: '➕', label: lang === 'fr' ? 'Publier' : 'نشر' },
          { href: '/messages', icon: '💬', label: lang === 'fr' ? 'Messages' : 'رسائل' },
          { href: '/mon-profil', icon: '👤', label: lang === 'fr' ? 'Profil' : 'ملفي', active: true },
        ].map((item, i) => (
          <Link key={i} href={item.href} style={{ flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', background: item.active ? '#fdf6f9' : 'none', borderTop: item.active ? '2px solid #59364A' : '2px solid transparent' }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: item.active ? '#59364A' : '#bbb', fontWeight: item.active ? 700 : 400 }}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
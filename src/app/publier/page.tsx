'use client';
import { useState } from 'react';
import Link from 'next/link';

type Lang = 'fr' | 'ar';
type Etape = 1 | 2 | 3;

const categories = [
  { icon: '🍳', fr: 'Maison & Quotidien', ar: 'المنزل والحياة اليومية', sousCategories: { fr: ['Cuisine traditionnelle', 'Pâtisserie', 'Couture', 'Repassage', 'Organisation domicile', 'Aide ménagère'], ar: ['طبخ تقليدي', 'حلويات', 'خياطة', 'كي الملابس', 'تنظيم المنزل', 'مساعدة منزلية'] } },
  { icon: '💄', fr: 'Beauté & Bien-être', ar: 'الجمال والعناية', sousCategories: { fr: ['Coiffure', 'Maquillage', 'Soins esthétiques', 'Henné', 'Onglerie'], ar: ['تصفيف شعر', 'مكياج', 'عناية بالجمال', 'حناء', 'تزيين أظافر'] } },
  { icon: '📚', fr: 'Éducation', ar: 'التعليم', sousCategories: { fr: ['Soutien scolaire', 'Cours de langues', 'Initiation informatique', 'Accompagnement devoirs', 'Formation artisanale'], ar: ['دعم مدرسي', 'دروس لغات', 'إعلام آلي', 'مساعدة واجبات', 'تكوين حرفي'] } },
  { icon: '🧵', fr: 'Création & Artisanat', ar: 'الإبداع والحرف', sousCategories: { fr: ['Broderie', 'Couture traditionnelle', 'Création vêtements', 'Décoration', 'Artisanat local'], ar: ['تطريز', 'خياطة تقليدية', 'تصميم ملابس', 'ديكور', 'حرف محلية'] } },
  { icon: '💻', fr: 'Digital & Entrepreneuriat', ar: 'الرقمي والمقاولاتية', sousCategories: { fr: ['Community management', 'Création graphique', 'Assistance administrative', 'Sites internet', 'Photographie', 'Montage vidéo'], ar: ['إدارة مجتمعات', 'تصميم جرافيك', 'مساعدة إدارية', 'مواقع ويب', 'تصوير', 'مونتاج'] } },
  { icon: '🎉', fr: 'Événements', ar: 'الفعاليات', sousCategories: { fr: ['Organisation fêtes', 'Décoration événements', 'Pâtisserie événementielle', 'Préparation cérémonies'], ar: ['تنظيم حفلات', 'ديكور فعاليات', 'حلويات مناسبات', 'تحضير مراسم'] } },
];

const wilayas = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira',
  'Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda',
  'Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M\'Sila','Mascara',
  'Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf',
  'Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma',
  'Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal',
  'Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet','El M\'Ghair','El Meniaa'
];

export default function PublierPage() {
  const [lang, setLang] = useState<Lang>('fr');
  const isRTL = lang === 'ar';
  const [etape, setEtape] = useState<Etape>(1);
  const [catSelect, setCatSelect] = useState('');
  const [sousCat, setSousCat] = useState('');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [tarifMin, setTarifMin] = useState('');
  const [tarifMax, setTarifMax] = useState('');
  const [tarifType, setTarifType] = useState<'heure' | 'prestation' | 'journee'>('prestation');
  const [wilaya, setWilaya] = useState('Alger');
  const [commune, setCommune] = useState('');
  const [deplacement, setDeplacement] = useState(false);
  const [distanceMax, setDistanceMax] = useState('10 km');
  const [disponible, setDisponible] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const catSelectObj = categories.find(c => c.icon === catSelect);
  const canNext1 = catSelect && sousCat;
  const canNext2 = titre.length >= 5 && description.length >= 20 && tarifMin;
  const canSubmit = wilaya && commune.length >= 2;

  if (submitted) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ fontSize: 70, marginBottom: 16 }}>🌸</div>
        <h2 style={{ color: '#59364A', fontSize: 22, fontWeight: 900, textAlign: 'center', margin: '0 0 12px' }}>
          {lang === 'fr' ? 'Annonce publiée !' : 'تم النشر!'}
        </h2>
        <p style={{ color: '#666', fontSize: 14, textAlign: 'center', maxWidth: 300, margin: '0 0 24px' }}>
          {lang === 'fr' ? 'Votre service est maintenant visible par les femmes de votre région.' : 'خدمتك أصبحت مرئية للنساء في منطقتك.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}>
          <Link href="/rechercher" style={{ background: '#59364A', color: '#FAF7F2', borderRadius: 25, padding: '14px', textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
            {lang === 'fr' ? '🔍 Voir les annonces' : '🔍 رؤية الإعلانات'}
          </Link>
          <button onClick={() => { setSubmitted(false); setEtape(1); setCatSelect(''); setSousCat(''); setTitre(''); setDescription(''); setTarifMin(''); setTarifMax(''); setCommune(''); }} style={{ background: '#fff', color: '#59364A', border: '2px solid #59364A', borderRadius: 25, padding: '14px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            {lang === 'fr' ? '➕ Publier un autre service' : '➕ نشر خدمة أخرى'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 80 }}>

      {/* Header */}
      <header style={{ background: '#59364A', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ color: '#FAF7F2', fontSize: 18, fontWeight: 900 }}>✨ {lang === 'fr' ? 'Proposer un service' : 'نشر خدمة'}</div>
          <div style={{ color: 'rgba(250,247,242,0.6)', fontSize: 11 }}>{lang === 'fr' ? `Étape ${etape} sur 3` : `الخطوة ${etape} من 3`}</div>
        </div>
        <button onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FAF7F2', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}>
          {lang === 'fr' ? 'عربي' : 'FR'}
        </button>
      </header>

      {/* Barre de progression */}
      <div style={{ background: '#fff', height: 6, boxShadow: '0 2px 4px rgba(89,54,74,0.06)' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, #59364A, #C77D69)', width: `${(etape / 3) * 100}%`, transition: 'width 0.4s ease', borderRadius: '0 4px 4px 0' }} />
      </div>

      <div style={{ padding: '20px' }}>

        {/* ══ ÉTAPE 1 — Catégorie ══ */}
        {etape === 1 && (
          <div>
            <h2 style={{ color: '#292929', fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>
              {lang === 'fr' ? 'Quel service proposez-vous ?' : 'ما هي الخدمة التي تقدمينها؟'}
            </h2>
            <p style={{ color: '#999', fontSize: 13, margin: '0 0 20px' }}>
              {lang === 'fr' ? 'Choisissez une catégorie puis une spécialité' : 'اختاري فئة ثم تخصصاً'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {categories.map(cat => (
                <button key={cat.icon} onClick={() => { setCatSelect(cat.icon); setSousCat(''); }} style={{ background: catSelect === cat.icon ? '#59364A' : '#fff', border: '2px solid ' + (catSelect === cat.icon ? '#59364A' : '#e8ddd6'), borderRadius: 16, padding: '16px 12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{cat.icon}</div>
                  <div style={{ color: catSelect === cat.icon ? '#FAF7F2' : '#292929', fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>
                    {lang === 'fr' ? cat.fr : cat.ar}
                  </div>
                </button>
              ))}
            </div>

            {catSelectObj && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
                <div style={{ color: '#59364A', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                  {lang === 'fr' ? 'Choisissez votre spécialité :' : 'اختاري تخصصك:'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(lang === 'fr' ? catSelectObj.sousCategories.fr : catSelectObj.sousCategories.ar).map((sc, i) => (
                    <button key={i} onClick={() => setSousCat(sc)} style={{ padding: '8px 14px', borderRadius: 20, border: '2px solid ' + (sousCat === sc ? '#C77D69' : '#e8ddd6'), background: sousCat === sc ? '#C77D69' : '#FAF7F2', color: sousCat === sc ? '#fff' : '#292929', fontSize: 13, cursor: 'pointer', fontWeight: sousCat === sc ? 700 : 400 }}>
                      {sc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => canNext1 && setEtape(2)} style={{ width: '100%', padding: '16px', background: canNext1 ? '#59364A' : '#ddd', color: '#FAF7F2', border: 'none', borderRadius: 25, fontSize: 16, fontWeight: 700, cursor: canNext1 ? 'pointer' : 'not-allowed' }}>
              {lang === 'fr' ? 'Continuer →' : 'متابعة →'}
            </button>
          </div>
        )}

        {/* ══ ÉTAPE 2 — Détails ══ */}
        {etape === 2 && (
          <div>
            <h2 style={{ color: '#292929', fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>
              {lang === 'fr' ? 'Décrivez votre service' : 'صفي خدمتك'}
            </h2>
            <p style={{ color: '#999', fontSize: 13, margin: '0 0 20px' }}>
              {lang === 'fr' ? 'Plus votre description est précise, plus vous attirerez de clientes' : 'كلما كان وصفك دقيقاً، جذبت أكثر'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', color: '#59364A', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  {lang === 'fr' ? 'Titre de l\'annonce *' : 'عنوان الإعلان *'}
                </label>
                <input value={titre} onChange={e => setTitre(e.target.value)} maxLength={60}
                  placeholder={lang === 'fr' ? 'Ex: Coiffure à domicile — spécialiste chignons' : 'مثال: تصفيف شعر في المنزل'}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 16, border: '2px solid ' + (titre.length > 0 && titre.length < 5 ? '#e74c3c' : '#e8ddd6'), fontSize: 14, outline: 'none', color: '#292929', boxSizing: 'border-box', background: '#fff' }} />
                <div style={{ color: '#999', fontSize: 11, marginTop: 4, textAlign: 'right' }}>{titre.length}/60</div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#59364A', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  {lang === 'fr' ? 'Description détaillée *' : 'وصف تفصيلي *'}
                </label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={500} rows={5}
                  placeholder={lang === 'fr' ? 'Décrivez votre expérience, vos méthodes, ce qui vous rend unique...' : 'صفي تجربتك، أساليبك، ما يميزك...'}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 16, border: '2px solid #e8ddd6', fontSize: 14, outline: 'none', color: '#292929', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit', background: '#fff' }} />
                <div style={{ color: description.length < 20 ? '#e74c3c' : '#999', fontSize: 11, marginTop: 4, textAlign: 'right' }}>{description.length}/500 {description.length < 20 ? (lang === 'fr' ? '(20 min)' : '(20 حرف كحد أدنى)') : ''}</div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#59364A', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                  {lang === 'fr' ? 'Tarif *' : 'السعر *'}
                </label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {(['prestation', 'heure', 'journee'] as const).map(t => (
                    <button key={t} onClick={() => setTarifType(t)} style={{ flex: 1, padding: '8px', borderRadius: 12, border: '2px solid ' + (tarifType === t ? '#59364A' : '#e8ddd6'), background: tarifType === t ? '#59364A' : '#fff', color: tarifType === t ? '#FAF7F2' : '#666', fontSize: 12, cursor: 'pointer', fontWeight: tarifType === t ? 700 : 400 }}>
                      {lang === 'fr' ? { prestation: 'Par prestation', heure: 'Par heure', journee: 'Par journée' }[t] : { prestation: 'للخدمة', heure: 'للساعة', journee: 'لليوم' }[t]}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={tarifMin} onChange={e => setTarifMin(e.target.value.replace(/\D/g, ''))} placeholder={lang === 'fr' ? 'Min (DA)' : 'الحد الأدنى'}
                    style={{ flex: 1, padding: '12px 14px', borderRadius: 14, border: '2px solid #e8ddd6', fontSize: 14, outline: 'none', color: '#292929', background: '#fff' }} />
                  <span style={{ color: '#999', fontSize: 18 }}>—</span>
                  <input value={tarifMax} onChange={e => setTarifMax(e.target.value.replace(/\D/g, ''))} placeholder={lang === 'fr' ? 'Max (DA)' : 'الحد الأقصى (اختياري)'}
                    style={{ flex: 1, padding: '12px 14px', borderRadius: 14, border: '2px solid #e8ddd6', fontSize: 14, outline: 'none', color: '#292929', background: '#fff' }} />
                </div>
                <div style={{ color: '#A8B5A2', fontSize: 11, marginTop: 6 }}>
                  💡 {lang === 'fr' ? 'Le tarif maximum est optionnel. Soyez honnête pour attirer les bonnes clientes.' : 'السعر الأقصى اختياري. كوني صادقة لجذب العميلات المناسبات.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setEtape(1)} style={{ flex: 1, padding: '14px', background: '#fff', color: '#59364A', border: '2px solid #59364A', borderRadius: 25, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                ← {lang === 'fr' ? 'Retour' : 'رجوع'}
              </button>
              <button onClick={() => canNext2 && setEtape(3)} style={{ flex: 2, padding: '14px', background: canNext2 ? '#59364A' : '#ddd', color: '#FAF7F2', border: 'none', borderRadius: 25, fontSize: 15, fontWeight: 700, cursor: canNext2 ? 'pointer' : 'not-allowed' }}>
                {lang === 'fr' ? 'Continuer →' : 'متابعة →'}
              </button>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 3 — Localisation ══ */}
        {etape === 3 && (
          <div>
            <h2 style={{ color: '#292929', fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>
              {lang === 'fr' ? 'Où exercez-vous ?' : 'أين تعملين؟'}
            </h2>
            <p style={{ color: '#999', fontSize: 13, margin: '0 0 4px' }}>
              {lang === 'fr' ? 'Votre adresse exacte ne sera jamais affichée publiquement.' : 'عنوانك الدقيق لن يظهر للعموم أبداً.'}
            </p>
            <div style={{ background: '#e8f5e9', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <span style={{ color: '#2e7d32', fontSize: 12, fontWeight: 600 }}>
                {lang === 'fr' ? 'Seule votre commune sera visible. Votre sécurité est notre priorité.' : 'فقط بلديتك ستكون مرئية. أمانك هو أولويتنا.'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', color: '#59364A', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  {lang === 'fr' ? 'Wilaya *' : 'الولاية *'}
                </label>
                <select value={wilaya} onChange={e => setWilaya(e.target.value)} style={{ width: '100%', padding: '13px 16px', borderRadius: 16, border: '2px solid #e8ddd6', fontSize: 14, color: '#292929', outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                  {wilayas.map(w => <option key={w}>{w}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#59364A', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  {lang === 'fr' ? 'Commune *' : 'البلدية *'}
                </label>
                <input value={commune} onChange={e => setCommune(e.target.value)}
                  placeholder={lang === 'fr' ? 'Votre commune (ex: Bab El Oued)' : 'بلديتك (مثال: باب الوادي)'}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 16, border: '2px solid #e8ddd6', fontSize: 14, outline: 'none', color: '#292929', boxSizing: 'border-box', background: '#fff' }} />
              </div>

              <div style={{ background: '#fff', borderRadius: 16, padding: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={deplacement} onChange={e => setDeplacement(e.target.checked)} style={{ width: 20, height: 20, accentColor: '#59364A' }} />
                  <div>
                    <div style={{ color: '#292929', fontWeight: 700, fontSize: 14 }}>
                      {lang === 'fr' ? 'Je me déplace chez la cliente' : 'أتنقل إلى منزل العميلة'}
                    </div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      {lang === 'fr' ? 'Vous pouvez vous déplacer dans un rayon donné' : 'يمكنك التنقل في نطاق معين'}
                    </div>
                  </div>
                </label>
                {deplacement && (
                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: 'block', color: '#59364A', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                      {lang === 'fr' ? 'Distance maximale :' : 'المسافة القصوى:'}
                    </label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['5 km', '10 km', '25 km', '50 km'].map(d => (
                        <button key={d} onClick={() => setDistanceMax(d)} style={{ padding: '6px 14px', borderRadius: 20, border: '2px solid ' + (distanceMax === d ? '#C77D69' : '#e8ddd6'), background: distanceMax === d ? '#C77D69' : '#FAF7F2', color: distanceMax === d ? '#fff' : '#666', fontSize: 13, cursor: 'pointer' }}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', borderRadius: 16, padding: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ color: '#292929', fontWeight: 700, fontSize: 14 }}>
                      {lang === 'fr' ? 'Disponible maintenant' : 'متاحة الآن'}
                    </div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      {lang === 'fr' ? 'Votre statut visible sur votre profil' : 'حالتك مرئية على ملفك'}
                    </div>
                  </div>
                  <div onClick={() => setDisponible(!disponible)} style={{ width: 44, height: 24, borderRadius: 12, background: disponible ? '#59364A' : '#ddd', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                    <div style={{ position: 'absolute', top: 3, left: disponible ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </div>
                </label>
              </div>
            </div>

            {/* Récap avant publication */}
            {canSubmit && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginTop: 16, border: '2px solid #A8B5A2' }}>
                <div style={{ color: '#59364A', fontWeight: 800, fontSize: 14, marginBottom: 10 }}>
                  ✅ {lang === 'fr' ? 'Récapitulatif de votre annonce' : 'ملخص إعلانك'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { l: lang === 'fr' ? 'Catégorie' : 'الفئة', v: `${catSelect} ${sousCat}` },
                    { l: lang === 'fr' ? 'Titre' : 'العنوان', v: titre },
                    { l: lang === 'fr' ? 'Tarif' : 'السعر', v: `${tarifMin}${tarifMax ? ' — ' + tarifMax : ''} DA` },
                    { l: lang === 'fr' ? 'Zone' : 'المنطقة', v: `${commune}, ${wilaya}` },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                      <span style={{ color: '#999', minWidth: 80 }}>{item.l} :</span>
                      <span style={{ color: '#292929', fontWeight: 600 }}>{item.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setEtape(2)} style={{ flex: 1, padding: '14px', background: '#fff', color: '#59364A', border: '2px solid #59364A', borderRadius: 25, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                ← {lang === 'fr' ? 'Retour' : 'رجوع'}
              </button>
              <button onClick={() => canSubmit && setSubmitted(true)} style={{ flex: 2, padding: '14px', background: canSubmit ? 'linear-gradient(135deg, #59364A, #C77D69)' : '#ddd', color: '#FAF7F2', border: 'none', borderRadius: 25, fontSize: 15, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
                🌸 {lang === 'fr' ? 'Publier mon service' : 'نشر خدمتي'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nav bas */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f0e8e0', display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', boxShadow: '0 -4px 20px rgba(89,54,74,0.08)', zIndex: 50 }}>
        {[
          { icon: '🏠', fr: 'Accueil', ar: 'الرئيسية', href: '/' },
          { icon: '🔍', fr: 'Rechercher', ar: 'بحث', href: '/rechercher' },
          { icon: '➕', fr: 'Publier', ar: 'نشر', href: '/publier', active: true },
          { icon: '💬', fr: 'Messages', ar: 'رسائل', href: '/messages' },
          { icon: '👤', fr: 'Profil', ar: 'حسابي', href: '/profil' },
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
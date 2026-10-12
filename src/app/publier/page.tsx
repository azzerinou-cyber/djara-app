'use client';
import { useState } from 'react';

type Lang = 'fr' | 'ar';

const categories = [
  { icon: '🏠', fr: 'Maison & Quotidien', ar: 'المنزل والحياة اليومية' },
  { icon: '💄', fr: 'Beauté & Bien-être', ar: 'الجمال والعناية' },
  { icon: '📚', fr: 'Éducation & Transmission', ar: 'التعليم والتدريس' },
  { icon: '🎨', fr: 'Création & Artisanat', ar: 'الإبداع والحرف' },
  { icon: '💻', fr: 'Digital & Entrepreneuriat', ar: 'الرقمي وريادة الأعمال' },
  { icon: '🎉', fr: 'Événements', ar: 'الأحداث والمناسبات' },
];

const steps = ['category', 'details', 'location', 'preview'] as const;
type Step = typeof steps[number];

export default function Publier() {
  const [lang, setLang] = useState<Lang>('fr');
  const [step, setStep] = useState<Step>('category');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', priceType: 'heure', availability: '' });
  const [serviceType, setServiceType] = useState<string[]>([]);
  const isRTL = lang === 'ar';

  const toggleType = (t: string) => setServiceType(prev =>
    prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
  );

  const stepIndex = steps.indexOf(step);

  const T = {
    fr: {
      title: 'Publier un service',
      steps: ['Catégorie', 'Détails', 'Localisation', 'Aperçu'],
      step1Title: 'Quelle est votre spécialité ?',
      step1Sub: 'Choisissez la catégorie qui correspond le mieux à votre savoir-faire.',
      next: 'Continuer',
      back: 'Retour',
      step2Title: 'Décrivez votre service',
      titleLabel: 'Titre de votre service',
      titlePh: 'Ex : Coiffure à domicile, tresses et lissage',
      descLabel: 'Description',
      descPh: 'Décrivez votre expérience, vos compétences et ce que vous proposez...',
      priceLabel: 'Tarif indicatif',
      pricePh: '1500',
      priceTypes: ['heure', 'séance', 'prestation', 'kg', 'pièce'],
      availLabel: 'Disponibilités',
      availPh: 'Ex : Lundi au vendredi, 9h-18h',
      step3Title: 'Votre zone de service',
      step3Sub: 'Indiquez où vous proposez vos services.',
      atHome: 'À domicile (chez la cliente)',
      atMine: 'Chez moi',
      remote: 'À distance',
      step4Title: 'Aperçu de votre annonce',
      step4Sub: 'Vérifiez avant de publier.',
      publish: '🚀 Publier mon service',
      publishSub: 'Votre annonce sera visible après vérification.',
      priceLabel2: 'Tarif',
      notice: '✅ Votre annonce sera examinée par notre équipe avant publication. Délai : 24h maximum.',
      titleDefault: 'Titre de votre service',
      descDefault: 'Votre description apparaîtra ici.',
    },
    ar: {
      title: 'نشر خدمة',
      steps: ['التصنيف', 'التفاصيل', 'الموقع', 'معاينة'],
      step1Title: 'ما هو تخصصك؟',
      step1Sub: 'اختاري الفئة التي تناسب مهارتك.',
      next: 'متابعة',
      back: 'رجوع',
      step2Title: 'صفي خدمتك',
      titleLabel: 'عنوان خدمتك',
      titlePh: 'مثال: تصفيف شعر في المنزل',
      descLabel: 'وصف الخدمة',
      descPh: 'صفي تجربتك ومهاراتك وما تقدمينه...',
      priceLabel: 'السعر التقريبي',
      pricePh: '1500',
      priceTypes: ['ساعة', 'جلسة', 'خدمة', 'كغ', 'قطعة'],
      availLabel: 'أوقات التوفر',
      availPh: 'مثال: الإثنين إلى الجمعة، 9ص-6م',
      step3Title: 'منطقة الخدمة',
      step3Sub: 'حددي أين تقدمين خدماتك.',
      atHome: 'عند العميلة',
      atMine: 'عندي في المنزل',
      remote: 'عن بُعد',
      step4Title: 'معاينة إعلانك',
      step4Sub: 'تحققي قبل النشر.',
      publish: '🚀 نشر خدمتي',
      publishSub: 'سيكون إعلانك مرئياً بعد المراجعة.',
      priceLabel2: 'السعر',
      notice: '✅ سيتم مراجعة إعلانك من قِبل فريقنا قبل النشر. المدة: 24 ساعة كحد أقصى.',
      titleDefault: 'عنوان خدمتك',
      descDefault: 'وصفك سيظهر هنا.',
    },
  }[lang];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#FAF7F2', paddingBottom: 100 }}>

      <div style={{ background: 'white', padding: '16px', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#292929', margin: 0 }}>{T.title}</h1>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['fr', 'ar'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ background: lang === l ? '#59364A' : '#f5f5f5', color: lang === l ? 'white' : '#888', border: 'none', padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ height: 4, width: '100%', borderRadius: 9999, background: i <= stepIndex ? '#59364A' : '#e5e7eb', transition: 'all 0.3s' }} />
              <span style={{ fontSize: 10, color: i <= stepIndex ? '#59364A' : '#aaa', fontWeight: i === stepIndex ? 700 : 400 }}>{T.steps[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {step === 'category' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#292929', margin: '0 0 6px' }}>{T.step1Title}</h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>{T.step1Sub}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categories.map((cat, i) => (
                <button key={i} onClick={() => setSelectedCat(i)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', borderRadius: 14, border: '2px solid', borderColor: selectedCat === i ? '#59364A' : '#e5e7eb', background: selectedCat === i ? 'rgba(89,54,74,0.05)' : 'white', cursor: 'pointer', textAlign: isRTL ? 'right' : 'left', transition: 'all 0.2s', width: '100%' }}>
                  <span style={{ fontSize: 28 }}>{cat.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: selectedCat === i ? '#59364A' : '#292929' }}>{isRTL ? cat.ar : cat.fr}</span>
                  {selectedCat === i && <span style={{ marginLeft: 'auto', color: '#59364A', fontSize: 18 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#292929', margin: 0 }}>{T.step2Title}</h2>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>{T.titleLabel}</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder={T.titlePh} className="input-field" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>{T.descLabel}</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder={T.descPh} rows={4}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', fontSize: 14, color: '#292929', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>{T.priceLabel}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder={T.pricePh} type="number" className="input-field" />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#888', fontWeight: 600 }}>DA</span>
                </div>
                <select value={form.priceType} onChange={e => setForm({ ...form, priceType: e.target.value })}
                  style={{ padding: '12px', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', fontSize: 13, color: '#292929' }}>
                  {T.priceTypes.map(pt => <option key={pt}>{pt}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>{T.availLabel}</label>
              <input value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}
                placeholder={T.availPh} className="input-field" />
            </div>
          </div>
        )}

        {step === 'location' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#292929', margin: '0 0 6px' }}>{T.step3Title}</h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>{T.step3Sub}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'atHome', icon: '🏘️', label: T.atHome },
                { key: 'atMine', icon: '🏠', label: T.atMine },
                { key: 'remote', icon: '💻', label: T.remote },
              ].map(opt => (
                <button key={opt.key} onClick={() => toggleType(opt.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', borderRadius: 14, border: '2px solid', borderColor: serviceType.includes(opt.key) ? '#59364A' : '#e5e7eb', background: serviceType.includes(opt.key) ? 'rgba(89,54,74,0.05)' : 'white', cursor: 'pointer', textAlign: isRTL ? 'right' : 'left', width: '100%' }}>
                  <span style={{ fontSize: 28 }}>{opt.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: serviceType.includes(opt.key) ? '#59364A' : '#292929' }}>{opt.label}</span>
                  {serviceType.includes(opt.key) && <span style={{ marginLeft: 'auto', color: '#59364A', fontSize: 18 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#292929', margin: '0 0 4px' }}>{T.step4Title}</h2>
              <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{T.step4Sub}</p>
            </div>
            <div className="card" style={{ border: '2px solid rgba(89,54,74,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(89,54,74,0.1), rgba(199,125,105,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                  {selectedCat !== null ? categories[selectedCat].icon : '✨'}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#292929', margin: 0 }}>{form.title || T.titleDefault}</p>
                  <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>{selectedCat !== null ? (isRTL ? categories[selectedCat].ar : categories[selectedCat].fr) : ''}</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: '0 0 12px' }}>{form.description || T.descDefault}</p>
              {form.price && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#888' }}>{T.priceLabel2}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#C77D69' }}>{form.price} DA / {form.priceType}</span>
                </div>
              )}
            </div>
            <div style={{ background: 'rgba(168,181,162,0.15)', borderRadius: 12, padding: 14, border: '1px solid rgba(168,181,162,0.3)' }}>
              <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.6 }}>{T.notice}</p>
            </div>
            <button className="btn-primary" style={{ padding: '16px', fontSize: 16, borderRadius: 14 }}>{T.publish}</button>
            <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', margin: 0 }}>{T.publishSub}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {stepIndex > 0 && (
            <button onClick={() => setStep(steps[stepIndex - 1])} className="btn-outline" style={{ flex: 1 }}>{T.back}</button>
          )}
          {step !== 'preview' && (
            <button onClick={() => setStep(steps[stepIndex + 1])}
              className="btn-primary" style={{ flex: 1, opacity: step === 'category' && selectedCat === null ? 0.5 : 1 }}
              disabled={step === 'category' && selectedCat === null}>
              {T.next}
            </button>
          )}
        </div>
      </div>

      <div className="bottom-nav">
        {[
          { icon: '🏠', label: lang === 'fr' ? 'Accueil' : 'الرئيسية', href: '/' },
          { icon: '🔍', label: lang === 'fr' ? 'Rechercher' : 'بحث', href: '/rechercher' },
          { icon: '➕', label: lang === 'fr' ? 'Publier' : 'نشر', href: '/publier', special: true, active: true },
          { icon: '💬', label: lang === 'fr' ? 'Messages' : 'رسائل', href: '/messages' },
          { icon: '👤', label: lang === 'fr' ? 'Profil' : 'ملفي', href: '/profil' },
        ].map((item, i) => (
          <a key={i} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', flex: 1 }}>
            {item.special ? (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #59364A, #C77D69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white', boxShadow: '0 4px 12px rgba(89,54,74,0.4)', marginTop: -20 }}>
                {item.icon}
              </div>
            ) : (
              <span style={{ fontSize: 22 }}>{item.icon}</span>
            )}
            <span style={{ fontSize: 10, fontWeight: item.active ? 700 : 500, color: item.active ? '#59364A' : '#888' }}>{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
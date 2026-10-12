'use client';
import { useState } from 'react';

type Lang = 'fr' | 'ar';

const T = {
  fr: {
    tagline: 'Le talent des femmes, tout près de vous',
    createAccount: 'Créer mon compte',
    joinDjara: 'Rejoindre DJARA',
    firstName: 'Prénom ou pseudonyme',
    phone: 'Numéro de téléphone',
    phonePlaceholder: '0555 000 000',
    wilaya: 'Wilaya',
    selectWilaya: 'Sélectionner votre wilaya',
    password: 'Mot de passe',
    passwordPlaceholder: 'Minimum 8 caractères',
    signUp: "S'inscrire",
    alreadyAccount: 'Déjà un compte ?',
    login: 'Se connecter',
    acceptTerms: "En continuant, j'accepte les",
    terms: "conditions d'utilisation",
    and: 'et la',
    privacy: 'politique de confidentialité',
    verifyPhone: 'Vérifier votre numéro',
    otpSent: 'Un code a été envoyé au',
    verify: 'Vérifier',
    resendCode: 'Renvoyer le code',
    resendIn: 'Renvoyer dans',
    seconds: 's',
  },
  ar: {
    tagline: 'موهبة المرأة، قريبة منك',
    createAccount: 'إنشاء حسابي',
    joinDjara: 'انضمي إلى جارة',
    firstName: 'الاسم أو اللقب',
    phone: 'رقم الهاتف',
    phonePlaceholder: '0555 000 000',
    wilaya: 'الولاية',
    selectWilaya: 'اختاري ولايتك',
    password: 'كلمة المرور',
    passwordPlaceholder: '8 أحرف على الأقل',
    signUp: 'إنشاء الحساب',
    alreadyAccount: 'لديك حساب؟',
    login: 'تسجيل الدخول',
    acceptTerms: 'بالمتابعة، أوافق على',
    terms: 'شروط الاستخدام',
    and: 'و',
    privacy: 'سياسة الخصوصية',
    verifyPhone: 'تأكيد رقم هاتفك',
    otpSent: 'تم إرسال رمز إلى',
    verify: 'تأكيد',
    resendCode: 'إعادة إرسال الرمز',
    resendIn: 'إعادة الإرسال خلال',
    seconds: 'ث',
  }
};

const wilayas = [
  '01 - Adrar','02 - Chlef','03 - Laghouat','04 - Oum El Bouaghi',
  '05 - Batna','06 - Béjaïa','07 - Biskra','08 - Béchar',
  '09 - Blida','10 - Bouira','16 - Alger','25 - Constantine','31 - Oran',
];

export default function Inscription() {
  const [lang, setLang] = useState<Lang>('fr');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [form, setForm] = useState({ firstName: '', phone: '', wilaya: '', password: '' });
  const [countdown, setCountdown] = useState(0);
  const tr = T[lang];
  const isRTL = lang === 'ar';

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(interval); return 0; } return p - 1; });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('otp');
    startCountdown();
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #59364A 0%, #7a4d65 40%, #FAF7F2 100%)' }}>

      {/* Switcher langue */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0' }}>
        {(['fr', 'ar'] as Lang[]).map(l => (
          <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? 'white' : 'rgba(255,255,255,0.2)', color: lang === l ? '#59364A' : 'white', border: 'none', padding: '6px 14px', borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 8 }}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 32px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 36 }}>🌸</span>
        </div>
        <h1 style={{ color: 'white', fontSize: 34, fontWeight: 800, margin: 0 }}>DJARA</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 6 }}>{tr.tagline}</p>
      </div>

      {/* Carte blanche */}
      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', flex: 1, padding: '32px 24px' }}>

        {step === 'form' ? (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#292929', margin: '0 0 4px' }}>{tr.createAccount}</h2>
            <p style={{ fontSize: 13, color: '#999', margin: '0 0 24px' }}>{tr.joinDjara}</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: tr.firstName, key: 'firstName', type: 'text', placeholder: tr.firstName },
                { label: tr.phone, key: 'phone', type: 'tel', placeholder: tr.phonePlaceholder },
                { label: tr.password, key: 'password', type: 'password', placeholder: tr.passwordPlaceholder },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#59364A', display: 'block', marginBottom: 6 }}>{field.label}</label>
                  <input className="input-field" type={field.type} placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })} required />
                </div>
              ))}

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#59364A', display: 'block', marginBottom: 6 }}>{tr.wilaya}</label>
                <select className="input-field" value={form.wilaya} onChange={e => setForm({ ...form, wilaya: e.target.value })} required>
                  <option value="">{tr.selectWilaya}</option>
                  {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: 8, width: '100%', padding: 14 }}>
                {tr.signUp}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 20 }}>
              {tr.acceptTerms} <span style={{ color: '#59364A', fontWeight: 600 }}>{tr.terms}</span> {tr.and} <span style={{ color: '#59364A', fontWeight: 600 }}>{tr.privacy}</span>
            </p>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#999', marginTop: 12 }}>
              {tr.alreadyAccount} <span style={{ color: '#C77D69', fontWeight: 700, cursor: 'pointer' }}>{tr.login}</span>
            </p>
          </>
        ) : (
          <>
            <button onClick={() => setStep('form')} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#59364A', marginBottom: 16 }}>←</button>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#292929', margin: '0 0 8px' }}>{tr.verifyPhone}</h2>
            <p style={{ fontSize: 13, color: '#999', margin: '0 0 4px' }}>{tr.otpSent}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#59364A', margin: '0 0 32px' }}>{form.phone}</p>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
              {[0,1,2,3,4,5].map(i => (
                <input key={i} maxLength={1}
                  style={{ width: 46, height: 54, borderRadius: 12, border: '2px solid #e5e7eb', textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#59364A', outline: 'none' }}
                  onChange={e => { if (e.target.value && e.target.nextElementSibling) (e.target.nextElementSibling as HTMLInputElement).focus(); }} />
              ))}
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: 14 }}>{tr.verify}</button>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#999', marginTop: 20 }}>
              {countdown > 0
                ? `${tr.resendIn} ${countdown}${tr.seconds}`
                : <span style={{ color: '#C77D69', fontWeight: 600, cursor: 'pointer' }} onClick={startCountdown}>{tr.resendCode}</span>}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Lang = 'fr' | 'ar';

const t = {
  fr: {
    title: 'Bon retour !',
    subtitle: 'Connectez-vous à DJARA',
    phone: 'Numéro de téléphone',
    phonePlaceholder: '0555 123 456',
    sendOtp: 'Recevoir le code',
    otpTitle: 'Code de vérification',
    otpSubtitle: 'Entrez le code reçu par SMS',
    verify: 'Se connecter',
    loading: 'Chargement...',
    back: '← Retour',
    noAccount: 'Pas encore membre ?',
    register: "S'inscrire",
  },
  ar: {
    title: 'مرحباً بعودتك!',
    subtitle: 'تسجيل الدخول إلى جارة',
    phone: 'رقم الهاتف',
    phonePlaceholder: '0555 123 456',
    sendOtp: 'استلام الرمز',
    otpTitle: 'رمز التحقق',
    otpSubtitle: 'أدخلي الرمز المستلم عبر SMS',
    verify: 'تسجيل الدخول',
    loading: 'جاري التحميل...',
    back: 'رجوع →',
    noAccount: 'لست عضوة بعد؟',
    register: 'التسجيل',
  },
};

export default function ConnexionPage() {
  const [lang, setLang] = useState<Lang>('fr');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRTL = lang === 'ar';
  const text = t[lang];

  const handleSendOtp = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    try {
      const formattedPhone = phone.startsWith('0') ? '+213' + phone.slice(1) : phone;
      const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
      if (error) throw error;
      setStep('otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi du code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setError('');
    try {
      const formattedPhone = phone.startsWith('0') ? '+213' + phone.slice(1) : phone;
      const { error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: 'sms' });
      if (error) throw error;
      window.location.href = '/';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Code incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #59364A 0%, #7a4a65 50%, #C77D69 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
        {(['fr', 'ar'] as Lang[]).map(l => (
          <button key={l} onClick={() => setLang(l)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none',
            background: lang === l ? 'white' : 'rgba(255,255,255,0.3)',
            color: lang === l ? '#59364A' : 'white', fontWeight: 600, cursor: 'pointer', fontSize: 13,
          }}>{l === 'fr' ? 'FR' : 'ع'}</button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🌸</div>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, margin: 0 }}>DJARA</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '4px 0 0' }}>{text.subtitle}</p>
      </div>

      <div style={{
        background: 'white', borderRadius: 24, padding: '32px 28px',
        width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
            {error}
          </div>
        )}

        {step === 'phone' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#292929', margin: '0 0 20px' }}>{text.title}</h2>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#59364A', display: 'block', marginBottom: 6 }}>{text.phone}</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={text.phonePlaceholder}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16, outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
            />
            <button onClick={handleSendOtp} disabled={loading || !phone.trim()} style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: phone.trim() ? '#59364A' : '#e5e7eb',
              color: phone.trim() ? 'white' : '#9ca3af',
              fontWeight: 700, fontSize: 16, cursor: phone.trim() ? 'pointer' : 'not-allowed',
            }}>{loading ? text.loading : text.sendOtp}</button>
          </div>
        )}

        {step === 'otp' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#292929', margin: '0 0 6px' }}>{text.otpTitle}</h2>
            <p style={{ color: '#888', fontSize: 14, margin: '0 0 24px' }}>{text.otpSubtitle}</p>
            <input type="number" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 24, letterSpacing: 8, textAlign: 'center', outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
            />
            <button onClick={handleVerifyOtp} disabled={loading || otp.length < 4} style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: otp.length >= 4 ? '#59364A' : '#e5e7eb',
              color: otp.length >= 4 ? 'white' : '#9ca3af',
              fontWeight: 700, fontSize: 16, cursor: otp.length >= 4 ? 'pointer' : 'not-allowed', marginBottom: 12,
            }}>{loading ? text.loading : text.verify}</button>
            <button onClick={() => setStep('phone')} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '2px solid #e5e7eb', background: 'white', color: '#888', fontWeight: 600, cursor: 'pointer' }}>{text.back}</button>
          </div>
        )}

        {step === 'phone' && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
            {text.noAccount} <a href="/auth/inscription" style={{ color: '#59364A', fontWeight: 700, textDecoration: 'none' }}>{text.register}</a>
          </p>
        )}
      </div>
    </div>
  );
}
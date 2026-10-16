'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Lang = 'fr' | 'ar'
type Step = 'request' | 'sent'

const t = {
  fr: {
    titre: 'Mot de passe oublié',
    sousTitre: 'Saisissez votre adresse e-mail. Nous vous enverrons un lien pour réinitialiser votre mot de passe.',
    email: 'Adresse e-mail',
    emailPlaceholder: 'votre@email.com',
    envoyer: 'Envoyer le lien',
    envoi: 'Envoi en cours...',
    retour: 'Retour à la connexion',
    erreurEmail: 'Veuillez saisir une adresse e-mail valide.',
    erreurGeneral: 'Une erreur est survenue. Vérifiez votre adresse e-mail et réessayez.',
    // Étape 2 : confirmation
    envoye: 'E-mail envoyé !',
    instructionsSent: 'Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation dans quelques minutes.',
    verifierSpam: 'Pensez à vérifier vos spams.',
    retourConnexion: 'Retour à la connexion',
    renvoyer: 'Renvoyer le lien',
    renvoyerNote: 'Vous n\'avez pas reçu l\'e-mail ?',
  },
  ar: {
    titre: 'نسيت كلمة المرور',
    sousTitre: 'أدخلي عنوان بريدك الإلكتروني. سنرسل لك رابطاً لإعادة تعيين كلمة المرور.',
    email: 'عنوان البريد الإلكتروني',
    emailPlaceholder: 'بريدك@example.com',
    envoyer: 'إرسال الرابط',
    envoi: '...جاري الإرسال',
    retour: 'العودة إلى تسجيل الدخول',
    erreurEmail: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
    erreurGeneral: 'حدث خطأ. تحقق من عنوان البريد وأعيدي المحاولة.',
    envoye: '!تم إرسال البريد الإلكتروني',
    instructionsSent: 'إذا كان يوجد حساب بهذا العنوان، ستتلقين رابط إعادة التعيين خلال دقائق.',
    verifierSpam: 'تحققي من مجلد الرسائل غير المرغوب فيها.',
    retourConnexion: 'العودة إلى تسجيل الدخول',
    renvoyer: 'إعادة إرسال الرابط',
    renvoyerNote: 'لم تتلقي البريد الإلكتروني؟',
  },
}

const COLORS = {
  prune: '#59364A',
  terracotta: '#C77D69',
  ivoire: '#FAF7F2',
  sauge: '#A8B5A2',
  anthracite: '#292929',
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function MotDePasseOubliePage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('fr')
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tx = t[lang]
  const isRTL = lang === 'ar'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidEmail(email)) {
      setError(tx.erreurEmail)
      return
    }

    setLoading(true)
    try {
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          // L'URL de redirection après clic sur le lien e-mail
          // Doit être configurée dans Supabase Dashboard → Auth → URL Configuration → Redirect URLs
          redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
        }
      )

      // Supabase ne révèle pas si l'e-mail existe ou non (protection contre l'énumération)
      // On affiche toujours la confirmation, même si l'e-mail n'est pas trouvé
      if (supabaseError && supabaseError.status !== 400) {
        // 400 = user not found (ne pas exposer), autres erreurs = problème technique
        throw supabaseError
      }

      setStep('sent')
    } catch (err: unknown) {
      console.error('[resetPassword]', err)
      setError(tx.erreurGeneral)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      })
    } catch {
      // Silencieux — même comportement que l'envoi initial
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: `linear-gradient(160deg, ${COLORS.ivoire} 0%, #f0e8f0 100%)`,
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px',
      }}
    >
      {/* ── LANG TOGGLE ─────────────────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', justifyContent: 'flex-end', paddingTop: 20, gap: 6 }}>
        {(['fr', 'ar'] as Lang[]).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              background: lang === l ? COLORS.prune : 'rgba(89,54,74,0.12)',
              border: 'none', borderRadius: 8,
              padding: '4px 12px', color: lang === l ? '#fff' : COLORS.prune,
              cursor: 'pointer', fontSize: 12, fontWeight: lang === l ? 700 : 400,
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── LOGO / MARQUE ───────────────────────────────────────────── */}
      <div style={{ marginTop: 48, marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(89,54,74,0.3)',
        }}>
          <span style={{ fontSize: 32 }}>🔑</span>
        </div>
        <div style={{ fontWeight: 900, fontSize: 26, color: COLORS.prune, letterSpacing: '-0.5px' }}>DJARA</div>
        <div style={{ fontSize: 11, color: COLORS.terracotta, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
          Le talent des femmes, tout près de vous
        </div>
      </div>

      {/* ── CARD ────────────────────────────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#fff',
        borderRadius: 24,
        padding: '32px 28px',
        boxShadow: '0 4px 32px rgba(89,54,74,0.12)',
      }}>

        {step === 'request' ? (
          /* ── STEP 1 : FORMULAIRE ─────────────────────────────────── */
          <>
            <h1 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 800, color: COLORS.anthracite }}>
              {tx.titre}
            </h1>
            <p style={{ margin: '0 0 28px', fontSize: 14, color: '#777', lineHeight: 1.6 }}>
              {tx.sousTitre}
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8 }}>
                  {tx.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder={tx.emailPlaceholder}
                  autoComplete="email"
                  inputMode="email"
                  required
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 14,
                    border: error ? '2px solid #DC2626' : '1.5px solid #e0d8d0',
                    fontSize: 15, color: COLORS.anthracite, fontFamily: 'inherit',
                    outline: 'none', boxSizing: 'border-box',
                    background: '#FAFAFA',
                    direction: 'ltr', // l'e-mail reste toujours LTR
                  }}
                />
                {error && (
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: '#DC2626' }}>{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                style={{
                  width: '100%', padding: '15px',
                  background: loading || !email
                    ? '#ccc'
                    : `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`,
                  color: '#fff', border: 'none', borderRadius: 14,
                  fontSize: 15, fontWeight: 700, cursor: loading || !email ? 'not-allowed' : 'pointer',
                  boxShadow: !loading && email ? '0 4px 16px rgba(89,54,74,0.3)' : 'none',
                }}
              >
                {loading ? tx.envoi : tx.envoyer}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button
                onClick={() => router.push('/connexion')}
                style={{ background: 'none', border: 'none', color: COLORS.prune, fontSize: 14, cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
              >
                ← {tx.retour}
              </button>
            </div>
          </>
        ) : (
          /* ── STEP 2 : CONFIRMATION ──────────────────────────────── */
          <>
            <div style={{ textAlign: 'center', paddingBottom: 8 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
              <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 800, color: COLORS.anthracite }}>
                {tx.envoye}
              </h2>
              <p style={{ margin: '0 0 10px', fontSize: 14, color: '#555', lineHeight: 1.7 }}>
                {tx.instructionsSent}
              </p>
              <p style={{ margin: '0 0 28px', fontSize: 13, color: '#999', fontStyle: 'italic' }}>
                {tx.verifierSpam}
              </p>

              {/* E-mail affiché en LTR même en mode AR */}
              <div style={{
                background: '#FAF7F2', borderRadius: 12, padding: '12px 16px',
                marginBottom: 28, fontSize: 14, fontWeight: 600, color: COLORS.prune,
                direction: 'ltr',
              }}>
                {email}
              </div>

              <button
                onClick={() => router.push('/connexion')}
                style={{
                  width: '100%', padding: '15px',
                  background: `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`,
                  color: '#fff', border: 'none', borderRadius: 14,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(89,54,74,0.3)',
                  marginBottom: 16,
                }}
              >
                {tx.retourConnexion}
              </button>

              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#999' }}>{tx.renvoyerNote}</p>
              <button
                onClick={handleResend}
                disabled={loading}
                style={{
                  background: 'none', border: 'none',
                  color: COLORS.terracotta, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600, textDecoration: 'underline',
                }}
              >
                {loading ? '...' : tx.renvoyer}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <p style={{ marginTop: 32, marginBottom: 32, fontSize: 12, color: '#bbb', textAlign: 'center' }}>
        © 2024 DJARA — Sécurisé & confidentiel
      </p>
    </div>
  )
}

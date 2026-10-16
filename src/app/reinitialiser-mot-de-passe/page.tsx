'use client'

/**
 * /reinitialiser-mot-de-passe
 *
 * Route de callback après clic sur le lien de réinitialisation de mot de passe.
 * Supabase redirige ici avec des tokens dans le hash de l'URL (#access_token=...&type=recovery).
 * Cette page :
 *   1. Écoute onAuthStateChange pour détecter l'événement PASSWORD_RECOVERY
 *   2. Affiche un formulaire pour définir un nouveau mot de passe
 *   3. Appelle supabase.auth.updateUser({ password }) pour mettre à jour
 *   4. Redirige vers /connexion avec un message de succès
 *
 * Sécurité :
 *   - Le token est géré par le SDK Supabase côté client (hash URL, jamais exposé en query param)
 *   - La session temporaire PASSWORD_RECOVERY est limitée dans le temps
 *   - La page signale clairement si le lien est expiré ou invalide
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Lang = 'fr' | 'ar'
type Step = 'loading' | 'form' | 'success' | 'error'

const t = {
  fr: {
    chargement: 'Vérification du lien…',
    titre: 'Nouveau mot de passe',
    sousTitre: 'Choisissez un mot de passe sécurisé pour votre compte DJARA.',
    mdp: 'Nouveau mot de passe',
    mdpPlaceholder: 'Au moins 8 caractères',
    mdpConfirm: 'Confirmer le mot de passe',
    mdpConfirmPlaceholder: 'Répétez le mot de passe',
    enregistrer: 'Enregistrer le mot de passe',
    enregistrement: 'Enregistrement…',
    succes: 'Mot de passe mis à jour !',
    succesDetail: 'Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.',
    allerConnexion: 'Se connecter',
    erreurLien: 'Lien invalide ou expiré',
    erreurLienDetail: 'Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.',
    demanderLien: 'Demander un nouveau lien',
    erreurCourt: 'Le mot de passe doit contenir au moins 8 caractères.',
    erreurCorrespondance: 'Les mots de passe ne correspondent pas.',
    erreurGeneral: 'Une erreur est survenue. Veuillez réessayer.',
    requisMin: '8 caractères minimum',
    requisMaj: 'Une majuscule',
    requisChiffre: 'Un chiffre',
  },
  ar: {
    chargement: '...التحقق من الرابط',
    titre: 'كلمة مرور جديدة',
    sousTitre: 'اختاري كلمة مرور آمنة لحسابك في جارة.',
    mdp: 'كلمة المرور الجديدة',
    mdpPlaceholder: '8 أحرف على الأقل',
    mdpConfirm: 'تأكيد كلمة المرور',
    mdpConfirmPlaceholder: 'أعيدي إدخال كلمة المرور',
    enregistrer: 'حفظ كلمة المرور',
    enregistrement: '...جاري الحفظ',
    succes: '!تم تحديث كلمة المرور',
    succesDetail: 'تم تغيير كلمة مرورك بنجاح. يمكنك الآن تسجيل الدخول.',
    allerConnexion: 'تسجيل الدخول',
    erreurLien: 'رابط غير صالح أو منتهي الصلاحية',
    erreurLienDetail: 'رابط إعادة التعيين هذا غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.',
    demanderLien: 'طلب رابط جديد',
    erreurCourt: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.',
    erreurCorrespondance: 'كلمتا المرور غير متطابقتين.',
    erreurGeneral: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    requisMin: '8 أحرف على الأقل',
    requisMaj: 'حرف كبير واحد',
    requisChiffre: 'رقم واحد',
  },
}

const COLORS = {
  prune: '#59364A',
  terracotta: '#C77D69',
  ivoire: '#FAF7F2',
  sauge: '#A8B5A2',
  anthracite: '#292929',
}

/** Évalue la force d'un mot de passe : 0–3 */
function passwordStrength(pwd: string): number {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  return score
}

const STRENGTH_COLORS = ['#DC2626', '#F59E0B', '#10B981']
const STRENGTH_LABELS = { fr: ['Faible', 'Moyen', 'Fort'], ar: ['ضعيف', 'متوسط', 'قوي'] }

export default function ReinitialiserMotDePassePage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('fr')
  const [step, setStep] = useState<Step>('loading')
  const [mdp, setMdp] = useState('')
  const [mdpConfirm, setMdpConfirm] = useState('')
  const [showMdp, setShowMdp] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tx = t[lang]
  const isRTL = lang === 'ar'
  const strength = passwordStrength(mdp)

  // ── Écouter l'événement PASSWORD_RECOVERY de Supabase ──────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Le SDK a parsé le token depuis le hash et ouvert une session temporaire
        setStep('form')
      } else if (event === 'SIGNED_IN' && session) {
        // Peut arriver si la page est rechargée après que le token a déjà été consommé
        setStep('form')
      }
    })

    // Timeout : si aucun événement PASSWORD_RECOVERY dans les 5s → lien invalide
    const timeout = setTimeout(() => {
      setStep(prev => prev === 'loading' ? 'error' : prev)
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  // ── Soumettre le nouveau mot de passe ───────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mdp.length < 8) {
      setError(tx.erreurCourt)
      return
    }
    if (mdp !== mdpConfirm) {
      setError(tx.erreurCorrespondance)
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: mdp })
      if (updateError) throw updateError

      // Déconnexion propre après le changement pour forcer une nouvelle connexion explicite
      await supabase.auth.signOut()
      setStep('success')
    } catch (err: unknown) {
      console.error('[updatePassword]', err)
      setError(tx.erreurGeneral)
    } finally {
      setLoading(false)
    }
  }

  // ── Critères de force du mot de passe ──────────────────────────────────────
  const criteria = [
    { label: tx.requisMin, met: mdp.length >= 8 },
    { label: tx.requisMaj, met: /[A-Z]/.test(mdp) },
    { label: tx.requisChiffre, met: /[0-9]/.test(mdp) },
  ]

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

      {/* ── LOGO ────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 48, marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(89,54,74,0.3)',
        }}>
          <span style={{ fontSize: 32 }}>🔐</span>
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

        {/* ── ÉTAT : CHARGEMENT ──────────────────────────────────────── */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ color: '#999', fontSize: 14 }}>{tx.chargement}</p>
          </div>
        )}

        {/* ── ÉTAT : FORMULAIRE ──────────────────────────────────────── */}
        {step === 'form' && (
          <>
            <h1 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 800, color: COLORS.anthracite }}>
              {tx.titre}
            </h1>
            <p style={{ margin: '0 0 28px', fontSize: 14, color: '#777', lineHeight: 1.6 }}>
              {tx.sousTitre}
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Nouveau mot de passe */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8 }}>
                  {tx.mdp}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showMdp ? 'text' : 'password'}
                    value={mdp}
                    onChange={e => { setMdp(e.target.value); setError('') }}
                    placeholder={tx.mdpPlaceholder}
                    autoComplete="new-password"
                    required
                    style={{
                      width: '100%', padding: '14px 44px 14px 16px', borderRadius: 14,
                      border: error && !mdp ? '2px solid #DC2626' : '1.5px solid #e0d8d0',
                      fontSize: 15, color: COLORS.anthracite, fontFamily: 'inherit',
                      outline: 'none', boxSizing: 'border-box', background: '#FAFAFA',
                      direction: 'ltr',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMdp(v => !v)}
                    style={{
                      position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0,
                    }}
                    aria-label={showMdp ? 'Masquer' : 'Afficher'}
                  >
                    {showMdp ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Barre de force */}
                {mdp.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i < strength ? STRENGTH_COLORS[strength - 1] : '#E5E7EB',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: STRENGTH_COLORS[strength - 1] || '#9CA3AF', fontWeight: 600 }}>
                      {mdp.length > 0 && STRENGTH_LABELS[lang][strength - 1]}
                    </div>
                  </div>
                )}

                {/* Critères */}
                {mdp.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {criteria.map((c, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, color: c.met ? '#10B981' : '#9CA3AF',
                      }}>
                        <span>{c.met ? '✓' : '○'}</span>
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmer mot de passe */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8 }}>
                  {tx.mdpConfirm}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={mdpConfirm}
                    onChange={e => { setMdpConfirm(e.target.value); setError('') }}
                    placeholder={tx.mdpConfirmPlaceholder}
                    autoComplete="new-password"
                    required
                    style={{
                      width: '100%', padding: '14px 44px 14px 16px', borderRadius: 14,
                      border: mdpConfirm && mdp !== mdpConfirm
                        ? '2px solid #DC2626'
                        : '1.5px solid #e0d8d0',
                      fontSize: 15, color: COLORS.anthracite, fontFamily: 'inherit',
                      outline: 'none', boxSizing: 'border-box', background: '#FAFAFA',
                      direction: 'ltr',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    style={{
                      position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0,
                    }}
                    aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                  >
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Correspondance en temps réel */}
                {mdpConfirm.length > 0 && mdp !== mdpConfirm && (
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#DC2626' }}>
                    {tx.erreurCorrespondance}
                  </p>
                )}
              </div>

              {error && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
                  padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#DC2626',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !mdp || !mdpConfirm || mdp !== mdpConfirm || mdp.length < 8}
                style={{
                  width: '100%', padding: '15px',
                  background: loading || !mdp || !mdpConfirm || mdp !== mdpConfirm || mdp.length < 8
                    ? '#ccc'
                    : `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`,
                  color: '#fff', border: 'none', borderRadius: 14,
                  fontSize: 15, fontWeight: 700,
                  cursor: loading || !mdp || !mdpConfirm || mdp !== mdpConfirm || mdp.length < 8
                    ? 'not-allowed' : 'pointer',
                  boxShadow: !loading && mdp && mdpConfirm && mdp === mdpConfirm && mdp.length >= 8
                    ? '0 4px 16px rgba(89,54,74,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? tx.enregistrement : tx.enregistrer}
              </button>
            </form>
          </>
        )}

        {/* ── ÉTAT : SUCCÈS ──────────────────────────────────────────── */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 800, color: COLORS.anthracite }}>
              {tx.succes}
            </h2>
            <p style={{ margin: '0 0 32px', fontSize: 14, color: '#555', lineHeight: 1.7 }}>
              {tx.succesDetail}
            </p>
            <button
              onClick={() => router.push('/connexion')}
              style={{
                width: '100%', padding: '15px',
                background: `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`,
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(89,54,74,0.3)',
              }}
            >
              {tx.allerConnexion}
            </button>
          </div>
        )}

        {/* ── ÉTAT : ERREUR (lien invalide/expiré) ──────────────────── */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: COLORS.anthracite }}>
              {tx.erreurLien}
            </h2>
            <p style={{ margin: '0 0 32px', fontSize: 14, color: '#555', lineHeight: 1.7 }}>
              {tx.erreurLienDetail}
            </p>
            <button
              onClick={() => router.push('/mot-de-passe-oublie')}
              style={{
                width: '100%', padding: '15px',
                background: `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`,
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(89,54,74,0.3)',
              }}
            >
              {tx.demanderLien}
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <p style={{ marginTop: 32, marginBottom: 32, fontSize: 12, color: '#bbb', textAlign: 'center' }}>
        © 2024 DJARA — Sécurisé & confidentiel
      </p>
    </div>
  )
}

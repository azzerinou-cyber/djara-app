'use client'

import { useEffect, useState, type CSSProperties, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const IDENTITY_BUCKET = 'identity-documents'
const IDENTITY_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const IDENTITY_MAX_SIZE = 5 * 1024 * 1024

type Mode = '' | 'cherche' | 'propose'

export default function InscriptionProfilPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('')
  const [form, setForm] = useState({
    display_name: '',
    phone: '',
    wilaya: '',
    commune: '',
    bio: '',
    business_name: '',
    commerce_number: '',
    profile_type: 'particuliere' as 'particuliere' | 'professionnelle',
  })
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? '',
        phone: profile.phone ?? '',
        wilaya: profile.wilaya ?? '',
        commune: profile.commune ?? '',
        bio: profile.bio ?? '',
        business_name: profile.business_name ?? '',
        commerce_number: profile.commerce_number ?? '',
        profile_type: (profile.profile_type as 'particuliere' | 'professionnelle') ?? 'particuliere',
      })
    }
  }, [profile])

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleIdentityChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setError('')
    if (file && !IDENTITY_TYPES.includes(file.type)) {
      setError('Format non accepté : JPG, PNG, WEBP ou PDF uniquement.')
      e.target.value = ''
      setIdentityFile(null)
      return
    }
    if (file && file.size > IDENTITY_MAX_SIZE) {
      setError('Le fichier dépasse 5 Mo.')
      e.target.value = ''
      setIdentityFile(null)
      return
    }
    setIdentityFile(file)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return

    const hasIdentityDoc = Boolean(profile?.identity_doc_url)
    if (!hasIdentityDoc && !identityFile) {
      setError("La pièce d'identité est obligatoire pour vérifier votre identité.")
      return
    }

    if (mode === 'propose' && form.profile_type === 'professionnelle') {
      if (!form.business_name.trim() || !form.commerce_number.trim()) {
        setError("Le nom de l'entreprise et le numéro de registre de commerce sont obligatoires.")
        return
      }
    }

    setLoading(true)
    setError('')

    const identityPath = `${user.id}/identity`

    if (!hasIdentityDoc && identityFile) {
      const { error: uploadError } = await supabase.storage
        .from(IDENTITY_BUCKET)
        .upload(identityPath, identityFile, { contentType: identityFile.type, upsert: false })

      const alreadyExists = uploadError && 'code' in uploadError && uploadError.code === 'ResourceAlreadyExists'
      if (uploadError && !alreadyExists) {
        setError("Impossible d'envoyer la pièce d'identité : " + uploadError.message)
        setLoading(false)
        return
      }
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: form.display_name.trim(),
      profile_type: mode === 'propose' ? form.profile_type : 'particuliere',
      business_name: (mode === 'propose' && form.profile_type === 'professionnelle') ? form.business_name.trim() : null,
      commerce_number: (mode === 'propose' && form.profile_type === 'professionnelle') ? form.commerce_number.trim() : null,
      phone: form.phone.trim() || null,
      wilaya: form.wilaya.trim(),
      commune: form.commune.trim(),
      bio: mode === 'propose' ? (form.bio.trim() || null) : null,
      identity_doc_url: identityPath,
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      setError("Impossible d'enregistrer le profil : " + profileError.message)
      setLoading(false)
      return
    }

    await refreshProfile()
    router.replace(mode === 'cherche' ? '/rechercher' : '/publier')
  }

  const inp: CSSProperties = {
    width: '100%', padding: '12px', marginBottom: '16px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '16px', fontFamily: 'inherit', boxSizing: 'border-box',
    background: '#fff', color: '#292929',
  }
  const lbl: CSSProperties = {
    display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px',
  }

  if (authLoading) {
    return <main style={{ padding: '48px 24px', textAlign: 'center', color: '#888' }}>Chargement…</main>
  }

  /* ── Étape 1 : choisir son intention ── */
  if (mode === '') {
    return (
      <main style={{ padding: '40px 24px', maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontSize: 36, marginBottom: 8 }}>🌸</p>
          <h1 style={{ color: '#59364A', fontSize: 22, marginBottom: 8 }}>Bienvenue sur DJARA</h1>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
            Comment souhaitez-vous utiliser l&apos;application ?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Carte Je cherche */}
          <button
            onClick={() => setMode('cherche')}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px 20px', borderRadius: 16, cursor: 'pointer',
              border: '2px solid #e8ddd6', background: '#fff',
              textAlign: 'left', width: '100%',
              boxShadow: '0 2px 12px rgba(89,54,74,0.06)',
            }}
          >
            <span style={{ fontSize: 36 }}>🔍</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#59364A', marginBottom: 4 }}>
                Je cherche un service
              </div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>
                Trouver une femme de confiance à proximité.<br />
                <span style={{ color: '#C77D69', fontWeight: 600 }}>Inscription rapide en 1 minute.</span>
              </div>
            </div>
          </button>

          {/* Carte Je propose */}
          <button
            onClick={() => setMode('propose')}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '20px 20px', borderRadius: 16, cursor: 'pointer',
              border: '2px solid #59364A', background: '#fdf6f9',
              textAlign: 'left', width: '100%',
              boxShadow: '0 2px 12px rgba(89,54,74,0.1)',
            }}
          >
            <span style={{ fontSize: 36 }}>💼</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#59364A', marginBottom: 4 }}>
                Je propose mes services
              </div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>
                Valoriser mes compétences et générer des revenus.<br />
                <span style={{ color: '#A8B5A2', fontWeight: 600 }}>Profil complet avec vitrine.</span>
              </div>
            </div>
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#bbb', fontSize: 12, marginTop: 24, lineHeight: 1.6 }}>
          Vous pourrez activer les deux modes depuis votre profil.
        </p>
      </main>
    )
  }

  /* ── Étape 2 : formulaire selon le mode ── */
  const isCherche = mode === 'cherche'
  const isPro = !isCherche && form.profile_type === 'professionnelle'
  const hasIdentityDoc = Boolean(profile?.identity_doc_url)

  return (
    <main style={{ padding: '32px 24px 60px', maxWidth: '480px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setMode('')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 22, padding: 0 }}
          aria-label="Retour"
        >
          ←
        </button>
        <div>
          <h1 style={{ color: '#59364A', fontSize: 20, margin: 0 }}>
            {isCherche ? '🔍 Inscription rapide' : '💼 Créer mon profil prestataire'}
          </h1>
          <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>
            {isCherche
              ? 'Quelques informations pour commencer'
              : 'Votre vitrine professionnelle sur DJARA'}
          </p>
        </div>
      </div>

      {/* Badge mode */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 20, marginBottom: 24,
        background: isCherche ? '#FFF3EE' : '#F3EDF6',
        color: isCherche ? '#C77D69' : '#59364A',
        fontSize: 12, fontWeight: 700,
      }}>
        {isCherche ? '⚡ Inscription rapide' : '✨ Profil prestataire'}
      </div>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: 12, marginBottom: 16, color: '#c0392b', fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Prénom */}
        <label style={lbl}>Prénom ou pseudonyme *</label>
        <input name="display_name" value={form.display_name} onChange={handleChange} required placeholder="Ex : Fatima" style={inp} />

        {/* Wilaya + Commune */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Wilaya *</label>
            <input name="wilaya" value={form.wilaya} onChange={handleChange} required placeholder="Ex : Alger" style={{ ...inp, marginBottom: 0 }} />
          </div>
          <div>
            <label style={lbl}>Commune *</label>
            <input name="commune" value={form.commune} onChange={handleChange} required placeholder="Ex : Bab El Oued" style={{ ...inp, marginBottom: 0 }} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }} />

        {/* Téléphone */}
        <label style={lbl}>Téléphone {isCherche ? '' : '*'}</label>
        <input name="phone" type="tel" value={form.phone} onChange={handleChange} required={!isCherche} placeholder="Ex : 0550 12 34 56" autoComplete="tel" style={inp} />

        {/* Champs prestataire uniquement */}
        {!isCherche && (
          <>
            {/* ── Sélecteur type de profil ── */}
            <fieldset style={{ border: 'none', padding: 0, margin: '0 0 20px' }}>
              <legend style={{ ...lbl, padding: 0, marginBottom: 10 }}>Type de profil *</legend>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Carte Particulière */}
                {(['particuliere', 'professionnelle'] as const).map(type => {
                  const sel = form.profile_type === type
                  const isParticuliere = type === 'particuliere'
                  const features = isParticuliere
                    ? ['Services à la personne', 'Contact direct par message', 'Profil gratuit complet', 'Évaluations clients']
                    : ['Tout du profil particulière', 'Envoi de devis personnalisés', 'Nom d\'entreprise affiché', 'Badge « Professionnelle »']
                  return (
                    <label key={type} style={{
                      display: 'flex', gap: 14, padding: '16px', borderRadius: 14, cursor: 'pointer',
                      border: `2px solid ${sel ? '#59364A' : '#e8ddd6'}`,
                      background: sel ? '#fdf6f9' : '#fff',
                      boxShadow: sel ? '0 4px 16px rgba(89,54,74,0.12)' : '0 2px 6px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s',
                    }}>
                      <input type="radio" name="profile_type" value={type} checked={sel}
                        onChange={() => setForm({ ...form, profile_type: type })}
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

                      {/* Icône */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: sel ? '#59364A' : '#f5f0ee', fontSize: 20,
                      }}>
                        {isParticuliere ? '👤' : '💼'}
                      </div>

                      {/* Contenu */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: sel ? '#59364A' : '#292929' }}>
                            {isParticuliere ? 'Particulière' : 'Professionnelle'}
                          </span>
                          {!isParticuliere && (
                            <span style={{
                              background: '#C77D69', color: '#fff', fontSize: 10,
                              fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                            }}>
                              PRO
                            </span>
                          )}
                          {sel && (
                            <span style={{ marginLeft: 'auto', color: '#59364A', fontSize: 16 }}>✓</span>
                          )}
                        </div>
                        <p style={{ color: '#888', fontSize: 12, margin: '0 0 8px', lineHeight: 1.5 }}>
                          {isParticuliere
                            ? 'Idéal pour proposer vos compétences en toute simplicité, sans structure formelle.'
                            : 'Pour les entrepreneures ayant une activité structurée ou un registre de commerce.'}
                        </p>
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {features.map(f => (
                            <li key={f} style={{ fontSize: 12, color: sel ? '#59364A' : '#aaa', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span style={{ color: isParticuliere && sel ? '#A8B5A2' : sel ? '#C77D69' : '#ddd' }}>✔</span>
                              {f === 'Envoi de devis personnalisés'
                                ? <strong style={{ color: sel ? '#C77D69' : '#aaa' }}>{f}</strong>
                                : f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {isPro && (
              <>
                <label style={lbl}>Nom de l&apos;entreprise *</label>
                <input name="business_name" value={form.business_name} onChange={handleChange} required placeholder="Ex : Yasmine Coiffure" style={inp} />
                <label style={lbl}>Numéro de registre de commerce *</label>
                <input name="commerce_number" value={form.commerce_number} onChange={handleChange} required placeholder="Ex : 16/00-1234567 B 21" style={inp} />
              </>
            )}

            <label style={lbl}>À propos de moi</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
              placeholder="Décrivez vos compétences et votre expérience…"
              style={{ ...inp, resize: 'vertical' }} />
          </>
        )}

        {/* Pièce d'identité — obligatoire dans les deux modes */}
        <fieldset style={{
          border: `1px solid ${isCherche ? '#C77D69' : '#f0d8c8'}`,
          borderRadius: 12, padding: 16, margin: '0 0 24px',
          background: isCherche ? '#FFF8F5' : '#fff8f0',
        }}>
          <legend style={{ ...lbl, padding: '0 6px', color: '#59364A' }}>
            🔐 Pièce d&apos;identité *
          </legend>
          <p style={{ color: '#888', fontSize: 12, lineHeight: 1.6, margin: '0 0 10px' }}>
            {isCherche
              ? "CNI (recto) ou passeport pour confirmer que vous êtes une femme. Ce document est strictement confidentiel et n'est jamais affiché publiquement."
              : "CNI (recto) ou passeport. Document strictement confidentiel, uniquement consulté par l'équipe DJARA pour vérifier votre identité."}
          </p>
          {hasIdentityDoc ? (
            <div style={{ fontSize: 13, color: profile?.identity_verified ? '#2e7d32' : '#C77D69', fontWeight: 600 }}>
              {profile?.identity_verified ? '✓ Identité vérifiée' : '⏳ Document envoyé — vérification en cours'}
            </div>
          ) : (
            <>
              <input
                type="file"
                accept={IDENTITY_TYPES.join(',')}
                onChange={handleIdentityChange}
                required
                style={{ width: '100%', fontSize: 14, color: '#292929' }}
              />
              <div style={{ color: '#bbb', fontSize: 11, marginTop: 6 }}>JPG, PNG, WEBP ou PDF — 5 Mo maximum</div>
            </>
          )}
        </fieldset>

        {/* Note sécurité pour mode rapide */}
        {isCherche && (
          <div style={{
            background: '#F3EDF6', borderRadius: 10, padding: '12px 14px',
            marginBottom: 20, fontSize: 12, color: '#59364A', lineHeight: 1.6,
          }}>
            🔒 <strong>DJARA est réservée aux femmes.</strong> Votre pièce d&apos;identité est vérifiée en toute confidentialité par notre équipe. Elle n&apos;est jamais partagée.
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: 16,
          background: loading ? '#9b7a8a' : isCherche ? '#C77D69' : '#59364A',
          color: '#fff', border: 'none', borderRadius: 12,
          fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Enregistrement…' : isCherche ? '🔍 Accéder à la recherche' : '✨ Créer mon profil prestataire'}
        </button>
      </form>
    </main>
  )
}

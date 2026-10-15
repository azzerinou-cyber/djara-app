'use client'

import { useEffect, useState, type CSSProperties, type ChangeEvent, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const IDENTITY_BUCKET = 'identity-documents'
const IDENTITY_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const IDENTITY_MAX_SIZE = 5 * 1024 * 1024

type Mode = '' | 'cherche' | 'propose'

export default function InscriptionProfilPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
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
    window.location.href = mode === 'cherche' ? '/rechercher' : '/publier'
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
            <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px' }}>
              <legend style={{ ...lbl, padding: 0 }}>Type de profil *</legend>
              <div style={{ display: 'flex', gap: 12 }}>
                {[{ value: 'particuliere', icon: '👤', label: 'Particulière' }, { value: 'professionnelle', icon: '💼', label: 'Professionnelle' }].map(opt => {
                  const sel = form.profile_type === opt.value
                  return (
                    <label key={opt.value} style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '14px 10px', borderRadius: 12, cursor: 'pointer',
                      border: `2px solid ${sel ? '#59364A' : '#e8ddd6'}`,
                      background: sel ? '#fdf6f9' : '#fff',
                      color: sel ? '#59364A' : '#292929',
                      fontWeight: sel ? 700 : 500, fontSize: 14, position: 'relative',
                    }}>
                      <input type="radio" name="profile_type" value={opt.value} checked={sel}
                        onChange={() => setForm({ ...form, profile_type: opt.value as 'particuliere' | 'professionnelle' })}
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
                      <span style={{ fontSize: 22 }}>{opt.icon}</span>
                      {opt.label}
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

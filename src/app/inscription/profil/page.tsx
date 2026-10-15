'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth, type ProfileType } from '@/contexts/AuthContext'

const PROFILE_TYPES: { value: ProfileType; icon: string; label: string }[] = [
  { value: 'particuliere', icon: '👤', label: 'Particulière' },
  { value: 'professionnelle', icon: '💼', label: 'Professionnelle' },
]

const IDENTITY_BUCKET = 'identity-documents'
const IDENTITY_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const IDENTITY_MAX_SIZE = 5 * 1024 * 1024

export default function InscriptionProfilPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const [form, setForm] = useState({ display_name: '', profile_type: '' as ProfileType | '', business_name: '', commerce_number: '', phone: '', wilaya: '', commune: '', bio: '' })
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pré-remplir si le profil existe déjà (modification)
  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? '',
        profile_type: profile.profile_type ?? '',
        business_name: profile.business_name ?? '',
        commerce_number: profile.commerce_number ?? '',
        phone: profile.phone ?? '',
        wilaya: profile.wilaya ?? '',
        commune: profile.commune ?? '',
        bio: profile.bio ?? '',
      })
    }
  }, [profile])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleIdentityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setError('')
    if (file && !IDENTITY_TYPES.includes(file.type)) {
      setError("Format non accepté : JPG, PNG, WEBP ou PDF uniquement.")
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!form.profile_type) {
      setError('Veuillez choisir un type de profil.')
      return
    }
    const isPro = form.profile_type === 'professionnelle'
    if (isPro && (!form.business_name.trim() || !form.commerce_number.trim())) {
      setError("Le nom de l'entreprise et le numéro de registre de commerce sont obligatoires.")
      return
    }
    const identityPath = `${user.id}/identity`
    const hasIdentityDoc = Boolean(profile?.identity_doc_url)
    if (!hasIdentityDoc && !identityFile) {
      setError("La pièce d'identité (CNI recto ou passeport) est obligatoire.")
      return
    }
    setLoading(true)
    setError('')

    if (!hasIdentityDoc && identityFile) {
      const { error: uploadError } = await supabase.storage
        .from(IDENTITY_BUCKET)
        .upload(identityPath, identityFile, { contentType: identityFile.type, upsert: false })

      // Déjà déposé lors d'une tentative précédente : on continue
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
      profile_type: form.profile_type,
      // Effacés si l'utilisatrice repasse en particulière
      business_name: isPro ? form.business_name.trim() : null,
      commerce_number: isPro ? form.commerce_number.trim() : null,
      phone: form.phone.trim() || null,
      wilaya: form.wilaya.trim(),
      commune: form.commune.trim(),
      bio: form.bio.trim() || null,
      // Chemin dans le bucket privé, jamais une URL publique
      identity_doc_url: identityPath,
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      setError("Impossible d'enregistrer le profil : " + profileError.message)
      setLoading(false)
      return
    }

    await refreshProfile()
    window.location.href = '/mon-profil'
  }

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '16px', fontFamily: 'inherit', boxSizing: 'border-box' as const,
    background: '#fff', color: '#292929',
  }
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }

  if (authLoading) {
    return <main style={{ padding: '48px 24px', textAlign: 'center', color: '#888' }}>Chargement...</main>
  }

  return (
    <main style={{ padding: '48px 24px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ color: '#59364A', marginBottom: '8px' }}>{profile ? 'Modifier mon profil' : 'Compléter mon profil'}</h1>
      <p style={{ color: '#888', marginBottom: '32px', fontSize: '14px' }}>
        Ces informations seront visibles par la communauté DJARA. Votre adresse exacte n&apos;est jamais affichée.
      </p>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#c0392b', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Prénom ou pseudonyme *</label>
        <input name="display_name" value={form.display_name} onChange={handleChange} required placeholder="Ex : Fatima" style={inputStyle} />

        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px' }}>
          <legend style={{ ...labelStyle, padding: 0 }}>Type de profil *</legend>
          <div style={{ display: 'flex', gap: '12px' }}>
            {PROFILE_TYPES.map(option => {
              const selected = form.profile_type === option.value
              return (
                <label key={option.value} style={{
                  position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '16px 12px', borderRadius: '12px', cursor: 'pointer',
                  border: `2px solid ${selected ? '#59364A' : '#e8ddd6'}`,
                  background: selected ? '#fdf6f9' : '#fff',
                  color: selected ? '#59364A' : '#292929',
                  fontWeight: selected ? 700 : 500, fontSize: '14px',
                }}>
                  <input
                    type="radio"
                    name="profile_type"
                    value={option.value}
                    checked={selected}
                    onChange={() => setForm({ ...form, profile_type: option.value })}
                    required
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  />
                  <span style={{ fontSize: '24px' }}>{option.icon}</span>
                  {option.label}
                </label>
              )
            })}
          </div>
        </fieldset>

        {form.profile_type === 'professionnelle' && (
          <>
            <label style={labelStyle}>Nom de l&apos;entreprise *</label>
            <input name="business_name" value={form.business_name} onChange={handleChange} required placeholder="Ex : Yasmine Coiffure" autoComplete="organization" style={inputStyle} />

            <label style={labelStyle}>Numéro de registre de commerce *</label>
            <input name="commerce_number" value={form.commerce_number} onChange={handleChange} required placeholder="Ex : 16/00-1234567 B 21" style={inputStyle} />
          </>
        )}

        <label style={labelStyle}>Téléphone</label>
        <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Ex : 0550 12 34 56" autoComplete="tel" style={inputStyle} />

        <label style={labelStyle}>Wilaya *</label>
        <input name="wilaya" value={form.wilaya} onChange={handleChange} required placeholder="Ex : Alger" style={inputStyle} />

        <label style={labelStyle}>Commune *</label>
        <input name="commune" value={form.commune} onChange={handleChange} required placeholder="Ex : Bab El Oued" style={inputStyle} />

        <label style={labelStyle}>À propos de moi</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Décrivez vos compétences et votre expérience..." style={{ ...inputStyle, resize: 'vertical' }} />

        <fieldset style={{ border: '1px solid #f0d8c8', borderRadius: '12px', padding: '16px', margin: '0 0 16px', background: '#fff8f0' }}>
          <legend style={{ ...labelStyle, padding: '0 6px', color: '#59364A' }}>🔐 Pièce d&apos;identité *</legend>
          <p style={{ color: '#888', fontSize: '12px', lineHeight: 1.5, margin: '0 0 12px' }}>
            CNI (recto) ou passeport. Document strictement confidentiel : il n&apos;est jamais affiché sur votre profil
            et n&apos;est consulté que par l&apos;équipe DJARA pour vérifier votre identité.
          </p>

          {profile?.identity_doc_url ? (
            <div style={{ fontSize: '13px', color: profile.identity_verified ? '#2e7d32' : '#C77D69', fontWeight: 600 }}>
              {profile.identity_verified ? '✓ Identité vérifiée' : '⏳ Document envoyé — vérification en cours'}
            </div>
          ) : (
            <>
              <input
                type="file"
                accept={IDENTITY_TYPES.join(',')}
                onChange={handleIdentityChange}
                required
                style={{ width: '100%', fontSize: '14px', color: '#292929' }}
              />
              <div style={{ color: '#bbb', fontSize: '11px', marginTop: '6px' }}>JPG, PNG, WEBP ou PDF — 5 Mo maximum</div>
            </>
          )}
        </fieldset>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '16px', background: loading ? '#9b7a8a' : '#59364A',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
        }}>
          {loading ? 'Enregistrement...' : 'Enregistrer mon profil'}
        </button>
      </form>
    </main>
  )
}

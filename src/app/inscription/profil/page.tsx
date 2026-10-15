'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth, type ProfileType } from '@/contexts/AuthContext'

const PROFILE_TYPES: { value: ProfileType; icon: string; label: string }[] = [
  { value: 'particuliere', icon: '👤', label: 'Particulière' },
  { value: 'professionnelle', icon: '💼', label: 'Professionnelle' },
]

export default function InscriptionProfilPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const [form, setForm] = useState({ display_name: '', profile_type: '' as ProfileType | '', phone: '', wilaya: '', commune: '', bio: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pré-remplir si le profil existe déjà (modification)
  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? '',
        profile_type: profile.profile_type ?? '',
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!form.profile_type) {
      setError('Veuillez choisir un type de profil.')
      return
    }
    setLoading(true)
    setError('')

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: form.display_name.trim(),
      profile_type: form.profile_type,
      phone: form.phone.trim() || null,
      wilaya: form.wilaya.trim(),
      commune: form.commune.trim(),
      bio: form.bio.trim() || null,
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

        <label style={labelStyle}>Téléphone</label>
        <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Ex : 0550 12 34 56" autoComplete="tel" style={inputStyle} />

        <label style={labelStyle}>Wilaya *</label>
        <input name="wilaya" value={form.wilaya} onChange={handleChange} required placeholder="Ex : Alger" style={inputStyle} />

        <label style={labelStyle}>Commune *</label>
        <input name="commune" value={form.commune} onChange={handleChange} required placeholder="Ex : Bab El Oued" style={inputStyle} />

        <label style={labelStyle}>À propos de moi</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Décrivez vos compétences et votre expérience..." style={{ ...inputStyle, resize: 'vertical' }} />

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

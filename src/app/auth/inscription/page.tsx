'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function InscriptionPage() {
  const [form, setForm] = useState({ email: '', password: '', display_name: '', wilaya: '', commune: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        display_name: form.display_name,
        wilaya: form.wilaya,
        commune: form.commune,
      })
      if (profileError) {
        setError('Compte créé mais erreur profil : ' + profileError.message)
      } else {
        setSuccess(true)
      }
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '16px', fontFamily: 'inherit', boxSizing: 'border-box' as const,
    background: '#fff', color: '#292929',
  }

  if (success) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p style={{ fontSize: '2rem' }}>🌸</p>
      <h2>Bienvenue sur DJARA !</h2>
      <p>Votre compte a été créé avec succès.</p>
      <a href="/">Aller à l'accueil</a>
    </div>
  )
}

  return (
    <main style={{ padding: '48px 24px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ color: '#59364A', marginBottom: '8px' }}>Créer mon compte</h1>
      <p style={{ color: '#888', marginBottom: '32px', fontSize: '14px' }}>
        Rejoignez la communauté DJARA
      </p>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#c0392b', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>Prénom ou pseudonyme *</label>
        <input name="display_name" value={form.display_name} onChange={handleChange} required placeholder="Ex : Fatima" style={inputStyle} />

        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>Email *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="votre@email.com" style={inputStyle} />

        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>Mot de passe *</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="8 caractères minimum" minLength={8} style={inputStyle} />

        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>Wilaya *</label>
        <input name="wilaya" value={form.wilaya} onChange={handleChange} required placeholder="Ex : Alger" style={inputStyle} />

        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>Commune *</label>
        <input name="commune" value={form.commune} onChange={handleChange} required placeholder="Ex : Bab El Oued" style={inputStyle} />

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '16px', background: loading ? '#9b7a8a' : '#59364A',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
        }}>
          {loading ? 'Création...' : "S'inscrire"}
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#888', fontSize: '14px' }}>
          Déjà un compte ?{' '}
          <a href="/auth/connexion" style={{ color: '#59364A', fontWeight: 600, textDecoration: 'none' }}>
            Se connecter
          </a>
        </p>
      </form>
    </main>
  )
}
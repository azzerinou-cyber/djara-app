'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function InscriptionPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signUpError, needsConfirmation } = await signUp(form.email, form.password)

    if (signUpError) {
      setError(signUpError)
      setLoading(false)
      return
    }

    if (needsConfirmation) {
      // Le lien de l'email ramène directement sur /inscription/profil
      setNeedsConfirmation(true)
      setLoading(false)
      return
    }

    // Session ouverte : le profil se complète à l'étape suivante
    router.replace('/inscription/profil')
  }

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '16px', fontFamily: 'inherit', boxSizing: 'border-box' as const,
    background: '#fff', color: '#292929',
  }

  if (needsConfirmation) {
    return (
      <main style={{ padding: '48px 24px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '2rem' }}>📩</p>
        <h1 style={{ color: '#59364A', marginBottom: '8px' }}>Vérifiez votre email</h1>
        <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6 }}>
          Un lien de confirmation a été envoyé à <strong>{form.email}</strong>.
          Cliquez dessus pour activer votre compte et compléter votre profil.
        </p>
      </main>
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
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>Email *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="votre@email.com" style={inputStyle} />

        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>Mot de passe *</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required autoComplete="new-password" placeholder="8 caractères minimum" minLength={8} style={inputStyle} />

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '16px', background: loading ? '#9b7a8a' : '#59364A',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
        }}>
          {loading ? 'Création...' : "S'inscrire"}
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#888', fontSize: '14px' }}>
          Déjà un compte ?{' '}
          <Link href="/connexion" style={{ color: '#59364A', fontWeight: 600, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  )
}

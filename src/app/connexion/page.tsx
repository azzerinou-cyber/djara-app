'use client'

import { Suspense, useState, type ChangeEvent, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

function ConnexionForm() {
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // N'accepter que des chemins internes pour éviter les redirections ouvertes
  const rawRedirect = searchParams.get('redirect') ?? '/'
  const redirect = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/'

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await signIn(form.email, form.password)
    if (signInError) {
      setError(signInError)
      setLoading(false)
      return
    }

    // Profil pas encore complété → étape d'inscription
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user?.id ?? '').maybeSingle()

    router.replace(profile ? redirect : '/inscription/profil')
  }

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '16px', fontFamily: 'inherit', boxSizing: 'border-box' as const,
    background: '#fff', color: '#292929',
  }

  return (
    <main style={{ padding: '48px 24px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ color: '#59364A', marginBottom: '8px' }}>Se connecter</h1>
      <p style={{ color: '#888', marginBottom: '32px', fontSize: '14px' }}>Bienvenue sur DJARA</p>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#c0392b', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>Email *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="votre@email.com" style={inputStyle} />

        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>Mot de passe *</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required autoComplete="current-password" style={inputStyle} />

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '16px', background: loading ? '#9b7a8a' : '#59364A',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
        }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#888', fontSize: '14px' }}>
          Pas encore de compte ?{' '}
          <Link href="/auth/inscription" style={{ color: '#59364A', fontWeight: 600, textDecoration: 'none' }}>
            S&apos;inscrire
          </Link>
        </p>
      </form>
    </main>
  )
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <ConnexionForm />
    </Suspense>
  )
}

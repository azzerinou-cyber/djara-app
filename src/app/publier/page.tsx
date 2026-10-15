'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import ServiceForm from '@/components/ServiceForm'
import BottomNav from '@/components/BottomNav'

export default function PublierPage() {
  const { profile, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <main style={{ minHeight: '100vh', background: '#FAF7F2', padding: '48px 24px', textAlign: 'center', color: '#888' }}>
        Chargement...
      </main>
    )
  }

  // Le service est rattaché au profil : il doit exister avant de publier
  if (!profile) {
    return (
      <main style={{ minHeight: '100vh', background: '#FAF7F2', padding: '48px 24px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>🌸</p>
          <h1 style={{ color: '#59364A', marginBottom: '8px' }}>Complétez d&apos;abord votre profil</h1>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
            Votre profil doit exister avant de publier un service.
          </p>
          <Link
            href="/inscription/profil"
            style={{
              display: 'inline-block', background: '#59364A', color: '#fff',
              borderRadius: '10px', padding: '14px 24px', fontWeight: 700, textDecoration: 'none',
            }}
          >
            Compléter mon profil
          </Link>
        </div>
        <BottomNav />
      </main>
    )
  }

  return (
    <>
      <ServiceForm />
      <BottomNav />
    </>
  )
}

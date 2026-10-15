'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ServiceForm, { type EditableService } from '@/components/ServiceForm'

type State =
  | { status: 'loading' }
  | { status: 'ready'; service: EditableService }
  | { status: 'not-found' }
  | { status: 'forbidden' }

export default function EditServiceClient() {
  const params = useParams()
  const id = params?.id as string
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    // /publier/* est protégé par le proxy : user est présent une fois l'auth chargée
    if (authLoading || !user || !id) return
    let active = true

    async function load(userId: string) {
      const { data } = await supabase.from('services').select('*').eq('id', id).maybeSingle()
      if (!active) return
      if (!data) setState({ status: 'not-found' })
      else if (data.provider_id !== userId) setState({ status: 'forbidden' })
      else setState({ status: 'ready', service: data as EditableService })
    }

    load(user.id)
    return () => { active = false }
  }, [authLoading, user, id])

  if (state.status === 'ready') {
    // key : remonte le formulaire si on change de service
    return <ServiceForm key={state.service.id} service={state.service} />
  }

  if (state.status === 'loading') {
    return <main style={{ minHeight: '100vh', background: '#FAF7F2', padding: '48px 24px', textAlign: 'center', color: '#888' }}>Chargement...</main>
  }

  const forbidden = state.status === 'forbidden'
  return (
    <main style={{ minHeight: '100vh', background: '#FAF7F2', padding: '48px 24px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '40px', marginBottom: '12px' }}>{forbidden ? '🔒' : '🔍'}</p>
        <h1 style={{ color: '#59364A', marginBottom: '8px' }}>{forbidden ? 'Accès refusé' : 'Service introuvable'}</h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
          {forbidden ? 'Seule la propriétaire de ce service peut le modifier.' : "Ce service n'existe pas ou a été supprimé."}
        </p>
        <Link href="/mon-profil" style={{ display: 'inline-block', background: '#59364A', color: '#fff', borderRadius: '10px', padding: '14px 24px', fontWeight: 700, textDecoration: 'none' }}>
          Retour à mon profil
        </Link>
      </div>
    </main>
  )
}

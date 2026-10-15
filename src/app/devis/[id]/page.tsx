'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Devis {
  id: string
  service_title: string
  description: string | null
  price_amount: number | null
  currency: string
  duration: string | null
  valid_until: string | null
  notes: string | null
  status: string
  created_at: string
  profiles: {
    display_name: string | null
    business_name: string | null
    wilaya: string | null
    commune: string | null
    phone: string | null
  } | null
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  sent:     { label: 'En attente de réponse', color: '#C77D69', bg: '#FFF3EE' },
  accepted: { label: 'Accepté',               color: '#2e7d32', bg: '#f0fff4' },
  refused:  { label: 'Refusé',                color: '#c0392b', bg: '#fff0f0' },
  expired:  { label: 'Expiré',                color: '#888',    bg: '#f5f5f5' },
}

export default function DevisPage({ params }: { params: { id: string } }) {
  const [devis,   setDevis]   = useState<Devis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    supabase
      .from('devis')
      .select('id, service_title, description, price_amount, currency, duration, valid_until, notes, status, created_at, profiles ( display_name, business_name, wilaya, commune, phone )')
      .eq('id', params.id)
      .single()
      .then(({ data, error: e }) => {
        if (e || !data) setError('Ce devis est introuvable ou a expiré.')
        else setDevis(data as unknown as Devis)
        setLoading(false)
      })
  }, [params.id])

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', fontSize: 14 }}>Chargement du devis…</p>
      </main>
    )
  }

  if (error || !devis) {
    return (
      <main style={{ padding: '60px 24px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>🔍</p>
        <h1 style={{ color: '#59364A', fontSize: 20, marginBottom: 8 }}>Devis introuvable</h1>
        <p style={{ color: '#888', fontSize: 14 }}>{error || 'Ce devis n\'existe pas ou n\'est plus disponible.'}</p>
      </main>
    )
  }

  const status = STATUS_LABEL[devis.status] ?? STATUS_LABEL.sent
  const isExpired = devis.valid_until && new Date(devis.valid_until) < new Date()
  const provider = devis.profiles

  return (
    <main style={{ padding: '28px 20px 80px', maxWidth: 520, margin: '0 auto' }}>

      {/* En-tête DJARA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: '#59364A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0,
        }}>D</div>
        <div>
          <p style={{ fontWeight: 800, fontSize: 16, color: '#59364A', margin: 0 }}>DJARA</p>
          <p style={{ color: '#aaa', fontSize: 11, margin: 0 }}>Le talent des femmes, tout près de vous.</p>
        </div>
      </div>

      {/* Statut */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 14px', borderRadius: 20, marginBottom: 20,
        background: isExpired ? '#f5f5f5' : status.bg,
        color: isExpired ? '#888' : status.color,
        fontSize: 12, fontWeight: 700,
      }}>
        {isExpired ? '⏰ Devis expiré' : status.label}
      </div>

      {/* Carte principale */}
      <div style={{
        background: '#fff', borderRadius: 18,
        border: '1.5px solid #f0ebe4', padding: '24px',
        boxShadow: '0 4px 24px rgba(89,54,74,0.08)',
        marginBottom: 16,
      }}>
        <p style={{ color: '#aaa', fontSize: 12, margin: '0 0 4px' }}>
          📄 Devis #{devis.id.slice(0, 8).toUpperCase()}
        </p>
        <h1 style={{ color: '#292929', fontSize: 20, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.3 }}>
          {devis.service_title}
        </h1>

        {/* Montant */}
        <div style={{
          background: '#fdf6f9', borderRadius: 12, padding: '16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          margin: '16px 0',
        }}>
          <div>
            <p style={{ color: '#888', fontSize: 12, margin: 0 }}>Montant total</p>
            <p style={{ fontWeight: 800, fontSize: 28, color: '#C77D69', margin: '2px 0 0' }}>
              {devis.price_amount !== null
                ? Number(devis.price_amount).toLocaleString('fr-DZ') + ' DA'
                : 'Sur devis'}
            </p>
          </div>
          {devis.duration && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#888', fontSize: 12, margin: 0 }}>Durée</p>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#59364A', margin: '2px 0 0' }}>⏱ {devis.duration}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {devis.description && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#59364A', margin: '0 0 6px' }}>Détails de la prestation</p>
            <p style={{ color: '#555', fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
              {devis.description}
            </p>
          </div>
        )}

        {/* Dates */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: '#aaa', fontSize: 11, margin: 0 }}>Émis le</p>
            <p style={{ color: '#555', fontSize: 13, fontWeight: 600, margin: '2px 0 0' }}>
              {new Date(devis.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {devis.valid_until && (
            <div>
              <p style={{ color: '#aaa', fontSize: 11, margin: 0 }}>Valable jusqu&apos;au</p>
              <p style={{ color: isExpired ? '#c0392b' : '#2e7d32', fontSize: 13, fontWeight: 600, margin: '2px 0 0' }}>
                {new Date(devis.valid_until).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prestataire */}
      {provider && (
        <div style={{
          background: '#fff', borderRadius: 14,
          border: '1px solid #f0ebe4', padding: '18px',
          marginBottom: 20,
        }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: '#59364A', margin: '0 0 10px' }}>Prestataire</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: '#F3EDF6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>
              👤
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#292929', margin: 0 }}>
                {provider.display_name ?? 'Prestataire DJARA'}
              </p>
              {provider.business_name && (
                <p style={{ color: '#C77D69', fontSize: 13, fontWeight: 600, margin: '2px 0 0' }}>
                  💼 {provider.business_name}
                </p>
              )}
              {(provider.commune || provider.wilaya) && (
                <p style={{ color: '#888', fontSize: 12, margin: '3px 0 0' }}>
                  📍 {[provider.commune, provider.wilaya].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA accepter */}
      {devis.status === 'sent' && !isExpired && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ color: '#888', fontSize: 13, textAlign: 'center', margin: '0 0 4px' }}>
            Ce devis vous convient ?
          </p>
          <a
            href={`/messages?devis=${devis.id}`}
            style={{
              display: 'block', padding: '16px', background: '#59364A',
              color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 15,
              textDecoration: 'none', textAlign: 'center',
              boxShadow: '0 4px 14px rgba(89,54,74,0.25)',
            }}
          >
            ✅ Accepter et contacter la prestataire
          </a>
          <p style={{ textAlign: 'center', color: '#ccc', fontSize: 11, margin: 0 }}>
            Vous serez redirigée vers la messagerie DJARA.
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid #f0ebe4' }}>
        <p style={{ color: '#ccc', fontSize: 11, margin: 0 }}>
          Document généré via <strong style={{ color: '#59364A' }}>DJARA</strong> — Le talent des femmes, tout près de vous.
        </p>
      </div>

    </main>
  )
}

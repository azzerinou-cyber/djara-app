'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const COLORS = {
  prune:      '#59364A',
  terracotta: '#C77D69',
  ivoire:     '#FAF7F2',
  sauge:      '#A8B5A2',
  anthracite: '#292929',
}

interface Booking {
  id:           string
  status:       'pending' | 'accepted' | 'refused' | 'cancelled' | 'completed' | 'disputed'
  created_at:   string
  scheduled_at: string | null
  message:      string | null
  client:       { display_name: string }
  provider:     { display_name: string }
  service:      { title: string; category_id: string | null }
}

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: '⏳ En attente',  bg: '#FEF3C7', color: '#92400E' },
  accepted:  { label: '✅ Acceptée',    bg: '#D1FAE5', color: '#065F46' },
  refused:   { label: '❌ Refusée',     bg: '#FEE2E2', color: '#991B1B' },
  cancelled: { label: '🚫 Annulée',    bg: '#F3F4F6', color: '#4B5563' },
  completed: { label: '🏁 Terminée',   bg: '#EDE9FE', color: '#4C1D95' },
  disputed:  { label: '⚠️ Litige',     bg: '#FFEDD5', color: '#9A3412' },
}

const ALL_STATUSES = ['pending', 'accepted', 'refused', 'cancelled', 'completed', 'disputed'] as const
const PAGE_SIZE = 30

export default function ReservationsPage() {
  const [bookings,      setBookings]      = useState<Booking[]>([])
  const [loading,       setLoading]       = useState(true)
  const [filterStatus,  setFilterStatus]  = useState<typeof ALL_STATUSES[number] | 'all'>('all')
  const [page,          setPage]          = useState(0)
  const [search,        setSearch]        = useState('')
  const [selected,      setSelected]      = useState<Booking | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('bookings')
      .select(`
        id, status, created_at, scheduled_at, message,
        client:client_id(display_name),
        provider:provider_id(display_name),
        service:service_id(title, category_id)
      `)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filterStatus !== 'all') query = query.eq('status', filterStatus)

    const { data, error } = await query
    if (!error && data) setBookings(data as unknown as Booking[])
    setLoading(false)
  }, [filterStatus, page])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  // Stats rapides par statut
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.anthracite }}>Réservations</h1>
        <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>Suivi de toutes les demandes de prestation</p>
      </div>

      {/* Mini-stats */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {ALL_STATUSES.map(s => {
          const m = STATUS_META[s]
          return (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(0) }} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: filterStatus === s ? m.bg : '#fff',
              color: filterStatus === s ? m.color : '#888',
              border: `1.5px solid ${filterStatus === s ? m.color + '44' : '#e0d8d0'}`,
            }}>
              {m.label}
            </button>
          )
        })}
        <button onClick={() => { setFilterStatus('all'); setPage(0) }} style={{
          padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
          background: filterStatus === 'all' ? COLORS.prune : '#fff',
          color: filterStatus === 'all' ? '#fff' : '#888',
          border: `1.5px solid ${filterStatus === 'all' ? COLORS.prune : '#e0d8d0'}`,
        }}>
          Toutes
        </button>
      </div>

      {/* Tableau */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0ebe4', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${COLORS.prune}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#bbb' }}>Aucune réservation trouvée</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#faf7f2', borderBottom: '1px solid #f0ebe4' }}>
                {['Prestation', 'Cliente → Prestataire', 'Date demande', 'RDV prévu', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => {
                const sm = STATUS_META[b.status] ?? { label: b.status, bg: '#f0ebe4', color: '#888' }
                return (
                  <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid #f8f4f0' : 'none' }}>
                    <td style={{ padding: '14px 16px', maxWidth: 180 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.anthracite, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.service?.title ?? '—'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>
                      <span style={{ color: COLORS.prune, fontWeight: 600 }}>{b.client?.display_name ?? '—'}</span>
                      <span style={{ color: '#bbb', margin: '0 4px' }}>→</span>
                      <span style={{ color: COLORS.terracotta, fontWeight: 600 }}>{b.provider?.display_name ?? '—'}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
                      {new Date(b.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
                      {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: sm.bg, color: sm.color, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {sm.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => setSelected(b)}
                        style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${COLORS.prune}`, background: '#fff', color: COLORS.prune, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e0d8d0', background: '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}>
          ← Précédent
        </button>
        <span style={{ padding: '8px 16px', color: '#888', fontSize: 14 }}>Page {page + 1}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={bookings.length < PAGE_SIZE} style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e0d8d0', background: '#fff', cursor: bookings.length < PAGE_SIZE ? 'not-allowed' : 'pointer', opacity: bookings.length < PAGE_SIZE ? 0.4 : 1 }}>
          Suivant →
        </button>
      </div>

      {/* Modal détails */}
      {selected && (
        <div onClick={e => { if (e.target === e.currentTarget) setSelected(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 460, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.anthracite }}>Détails de la réservation</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#bbb' }}>×</button>
            </div>

            <div style={{ background: '#faf7f2', borderRadius: 12, padding: '16px 18px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Row label="Prestation"    value={selected.service?.title ?? '—'} />
              <Row label="Cliente"       value={selected.client?.display_name ?? '—'} />
              <Row label="Prestataire"   value={selected.provider?.display_name ?? '—'} />
              <Row label="Statut"        value={STATUS_META[selected.status]?.label ?? selected.status} />
              <Row label="Demande le"    value={new Date(selected.created_at).toLocaleString('fr-FR')} />
              <Row label="RDV prévu"     value={selected.scheduled_at ? new Date(selected.scheduled_at).toLocaleString('fr-FR') : '—'} />
              <Row label="ID"            value={selected.id.slice(0, 16) + '…'} mono />
            </div>

            {selected.message && (
              <div style={{ background: '#fff', border: '1px solid #e0d8d0', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Message</p>
                <p style={{ margin: 0, fontSize: 14, color: COLORS.anthracite, fontStyle: 'italic' }}>« {selected.message} »</p>
              </div>
            )}

            {selected.status === 'disputed' && (
              <div style={{ background: '#FFEDD5', border: '1px solid #FED7AA', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#9A3412', fontWeight: 600 }}>
                  ⚠️ Cette réservation est en litige. Contactez les deux parties pour résoudre le différend.
                </p>
              </div>
            )}

            <button onClick={() => setSelected(null)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1.5px solid #e0d8d0', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#888' }}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
      <span style={{ color: '#888', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#292929', textAlign: 'right', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Devis {
  id: string
  client_name: string | null
  service_title: string
  price_amount: number | null
  currency: string
  duration: string | null
  valid_until: string | null
  status: string
  created_at: string
}

type Filter = 'tous' | 'sent' | 'accepted' | 'refused' | 'expired'

const STATUS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  sent:     { label: 'En attente', color: '#C77D69', bg: '#FFF3EE', icon: '⏳' },
  accepted: { label: 'Accepté',   color: '#2e7d32', bg: '#f0fff4', icon: '✅' },
  refused:  { label: 'Refusé',    color: '#c0392b', bg: '#fff0f0', icon: '❌' },
  expired:  { label: 'Expiré',    color: '#aaa',    bg: '#f5f5f5', icon: '⏰' },
}

function statusOf(d: Devis): string {
  if (d.status !== 'sent') return d.status
  if (d.valid_until && new Date(d.valid_until) < new Date()) return 'expired'
  return 'sent'
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DevisListPage() {
  const { user, profile } = useAuth()
  const [devis,   setDevis]   = useState<Devis[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<Filter>('tous')
  const [copied,  setCopied]  = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('devis')
      .select('id, client_name, service_title, price_amount, currency, duration, valid_until, status, created_at')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDevis((data ?? []) as Devis[])
        setLoading(false)
      })
  }, [user])

  function copyLink(id: string) {
    const url = `${window.location.origin}/devis/${id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('devis').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setDevis(prev => prev.map(d => d.id === id ? { ...d, status } : d))
  }

  /* ── Statistiques ── */
  const stats = {
    total:    devis.length,
    accepted: devis.filter(d => d.status === 'accepted').length,
    pending:  devis.filter(d => statusOf(d) === 'sent').length,
    totalDA:  devis.filter(d => d.status === 'accepted').reduce((s, d) => s + (d.price_amount ?? 0), 0),
  }

  const filtered = filter === 'tous' ? devis : devis.filter(d => statusOf(d) === filter)

  /* ── Styles ── */
  const chip = (active: boolean, color = '#59364A'): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', border: `1.5px solid ${active ? color : '#e8ddd6'}`,
    background: active ? color : '#fff',
    color: active ? '#fff' : '#888',
    transition: 'all 0.15s',
  })

  if (!user || profile?.profile_type !== 'professionnelle') {
    return (
      <main style={{ padding: '60px 24px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>🔒</p>
        <h1 style={{ color: '#59364A', fontSize: 20, marginBottom: 8 }}>Accès réservé</h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
          Les devis sont disponibles uniquement pour les profils <strong>Professionnelle</strong>.
        </p>
        <Link href="/inscription/profil" style={{ display: 'inline-block', padding: '12px 24px', background: '#59364A', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          Passer en mode Professionnelle
        </Link>
      </main>
    )
  }

  return (
    <main style={{ padding: '24px 20px 80px', maxWidth: 560, margin: '0 auto' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 22, padding: 0 }} aria-label="Retour">←</button>
          <div>
            <h1 style={{ color: '#59364A', fontSize: 20, margin: 0 }}>📄 Mes devis</h1>
            <p style={{ color: '#aaa', fontSize: 12, margin: '2px 0 0' }}>
              {profile?.display_name ?? 'Prestataire'}
            </p>
          </div>
        </div>
        <Link href="/devis/nouveau" style={{
          padding: '10px 16px', background: '#59364A', color: '#fff',
          borderRadius: 12, fontWeight: 700, fontSize: 13, textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          + Nouveau
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total',     value: stats.total,    icon: '📋', color: '#59364A' },
          { label: 'En attente', value: stats.pending,  icon: '⏳', color: '#C77D69' },
          { label: 'Acceptés',  value: stats.accepted, icon: '✅', color: '#2e7d32' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 10px', textAlign: 'center', border: '1px solid #f0ebe4' }}>
            <p style={{ fontSize: 20, margin: 0 }}>{s.icon}</p>
            <p style={{ fontWeight: 800, fontSize: 20, color: s.color, margin: '4px 0 2px' }}>{s.value}</p>
            <p style={{ color: '#aaa', fontSize: 11, margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chiffre accepté */}
      {stats.totalDA > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #59364A, #7a4d67)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: '#fff',
        }}>
          <div>
            <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>Devis acceptés — total</p>
            <p style={{ fontWeight: 900, fontSize: 26, margin: '4px 0 0' }}>
              {stats.totalDA.toLocaleString('fr-DZ')} <span style={{ fontSize: 14, fontWeight: 600 }}>DA</span>
            </p>
          </div>
          <span style={{ fontSize: 36, opacity: 0.6 }}>💰</span>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {(['tous', 'sent', 'accepted', 'refused', 'expired'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={chip(filter === f)}>
            {f === 'tous' ? 'Tous' : STATUS[f]?.icon + ' ' + STATUS[f]?.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#aaa', padding: '40px 0', fontSize: 14 }}>Chargement…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
          <p style={{ color: '#888', fontSize: 15, fontWeight: 600 }}>Aucun devis {filter !== 'tous' ? 'dans cette catégorie' : 'pour l\'instant'}</p>
          <p style={{ color: '#bbb', fontSize: 13, marginTop: 6 }}>
            {filter === 'tous' ? 'Créez votre premier devis professionnel.' : 'Essayez un autre filtre.'}
          </p>
          {filter === 'tous' && (
            <Link href="/devis/nouveau" style={{ display: 'inline-block', marginTop: 16, padding: '12px 24px', background: '#59364A', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              📄 Créer un devis
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(d => {
            const st = statusOf(d)
            const s  = STATUS[st] ?? STATUS.sent
            return (
              <div key={d.id} style={{
                background: '#fff', borderRadius: 14, border: '1px solid #f0ebe4',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden',
              }}>
                {/* Bande colorée statut */}
                <div style={{ height: 4, background: s.color, opacity: 0.5 }} />

                <div style={{ padding: '16px' }}>
                  {/* Ligne 1 : titre + montant */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1, marginRight: 12 }}>
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#292929', margin: 0, lineHeight: 1.3 }}>
                        {d.service_title}
                      </p>
                      {d.client_name && (
                        <p style={{ color: '#888', fontSize: 12, margin: '3px 0 0' }}>
                          👤 {d.client_name}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 800, fontSize: 18, color: '#C77D69', margin: 0 }}>
                        {d.price_amount !== null ? Number(d.price_amount).toLocaleString('fr-DZ') + ' DA' : '—'}
                      </p>
                      {d.duration && <p style={{ color: '#bbb', fontSize: 11, margin: '2px 0 0' }}>⏱ {d.duration}</p>}
                    </div>
                  </div>

                  {/* Ligne 2 : statut + dates */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{
                      background: s.bg, color: s.color, fontSize: 11,
                      fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    }}>
                      {s.icon} {s.label}
                    </span>
                    <span style={{ color: '#ccc', fontSize: 11 }}>Créé le {fmt(d.created_at)}</span>
                    {d.valid_until && (
                      <span style={{ color: st === 'expired' ? '#c0392b' : '#bbb', fontSize: 11 }}>
                        · Valide jusqu&apos;au {fmt(d.valid_until)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {/* Copier lien */}
                    <button
                      onClick={() => copyLink(d.id)}
                      style={{
                        padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', border: '1.5px solid #e8ddd6',
                        background: copied === d.id ? '#f0fff4' : '#fff',
                        color: copied === d.id ? '#2e7d32' : '#59364A',
                        transition: 'all 0.2s',
                      }}
                    >
                      {copied === d.id ? '✓ Copié !' : '🔗 Copier le lien'}
                    </button>

                    {/* Voir */}
                    <Link href={`/devis/${d.id}`} style={{
                      padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      textDecoration: 'none', border: '1.5px solid #e8ddd6',
                      background: '#fff', color: '#888',
                    }}>
                      👁 Voir
                    </Link>

                    {/* Marquer accepté / refusé si en attente */}
                    {st === 'sent' && (
                      <>
                        <button
                          onClick={() => updateStatus(d.id, 'accepted')}
                          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid #c8e6c9', background: '#f0fff4', color: '#2e7d32' }}
                        >
                          ✅ Accepté
                        </button>
                        <button
                          onClick={() => updateStatus(d.id, 'refused')}
                          style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid #ffcccc', background: '#fff0f0', color: '#c0392b' }}
                        >
                          ❌ Refusé
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

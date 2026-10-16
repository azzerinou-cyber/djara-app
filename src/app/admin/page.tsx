'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const COLORS = {
  prune:      '#59364A',
  terracotta: '#C77D69',
  ivoire:     '#FAF7F2',
  sauge:      '#A8B5A2',
  anthracite: '#292929',
}

interface AdminStats {
  total_users:      number
  new_users_7d:     number
  suspended_users:  number
  active_services:  number
  pending_services: number
  pending_reports:  number
  total_bookings:   number
  bookings_7d:      number
  total_reviews:    number
}

interface StatCardProps {
  label:    string
  value:    number | string
  icon:     string
  color?:   string
  subtitle?: string
}

function StatCard({ label, value, icon, color = COLORS.prune, subtitle }: StatCardProps) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0ebe4',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: '#888', fontWeight: 500 }}>{label}</p>
          <p style={{ margin: '6px 0 0', fontSize: 32, fontWeight: 800, color }}>{value}</p>
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#bbb' }}>{subtitle}</p>}
        </div>
        <div style={{ fontSize: 32, opacity: 0.8 }}>{icon}</div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [stats,   setStats]   = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data, error: err } = await supabase.from('admin_stats').select('*').single()
        if (err) throw err
        setStats(data)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${COLORS.prune}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 20, color: '#DC2626' }}>
      ⚠️ {error}
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: COLORS.anthracite }}>
          Vue d'ensemble
        </h1>
        <p style={{ margin: '6px 0 0', color: '#888', fontSize: 14 }}>
          Tableau de bord DJARA — données en temps réel
        </p>
      </div>

      {/* Stats grid */}
      {stats && (
        <>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#888', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 16px' }}>
            Utilisatrices
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            <StatCard label="Total"       value={stats.total_users}     icon="👥" />
            <StatCard label="Cette semaine" value={`+${stats.new_users_7d}`} icon="🆕" color={COLORS.sauge} subtitle="7 derniers jours" />
            <StatCard label="Suspendues"  value={stats.suspended_users}  icon="🚫" color={stats.suspended_users > 0 ? '#DC2626' : '#888'} />
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#888', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 16px' }}>
            Services
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
            <StatCard label="Services actifs"  value={stats.active_services}  icon="✅" color={COLORS.sauge} />
            <StatCard label="En attente"       value={stats.pending_services} icon="⏳" color={stats.pending_services > 0 ? COLORS.terracotta : '#888'} />
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#888', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 16px' }}>
            Activité
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            <StatCard label="Signalements en attente" value={stats.pending_reports} icon="🚩" color={stats.pending_reports > 0 ? '#DC2626' : '#888'} />
            <StatCard label="Réservations totales"    value={stats.total_bookings}  icon="📅" />
            <StatCard label="Réservations 7j"         value={`+${stats.bookings_7d}`} icon="📈" color={COLORS.sauge} subtitle="7 derniers jours" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <StatCard label="Avis publiés" value={stats.total_reviews} icon="⭐" />
          </div>
        </>
      )}

      {/* Raccourcis rapides */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#888', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 16px' }}>
          Actions rapides
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { href: '/admin/signalements', label: 'Traiter les signalements', icon: '🚩', urgent: (stats?.pending_reports ?? 0) > 0 },
            { href: '/admin/utilisatrices', label: 'Gérer les utilisatrices', icon: '👥', urgent: false },
            { href: '/admin/categories',    label: 'Gérer les catégories',    icon: '🗂️', urgent: false },
            { href: '/admin/reservations',  label: 'Voir les réservations',   icon: '📅', urgent: false },
          ].map(item => (
            <a key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#fff', borderRadius: 14, padding: '16px 20px',
              border: `1.5px solid ${item.urgent ? '#FECACA' : '#f0ebe4'}`,
              background: item.urgent ? '#FEF2F2' : '#fff',
              textDecoration: 'none', color: COLORS.anthracite,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'transform 0.15s ease',
            }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>
              {item.urgent && <span style={{ marginLeft: 'auto', background: '#DC2626', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>!</span>}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

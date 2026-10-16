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

interface UserRow {
  id:           string
  display_name: string
  phone?:       string
  wilaya?:      string
  commune?:     string
  trust_level:  number
  is_active:    boolean
  profile_type: string
  created_at:   string
  service_count?: number
}

const TRUST_LABELS: Record<number, string> = {
  1: '📱 Tél.',
  2: '🪪 ID',
  3: '🎓 Qualif.',
  4: '⭐ Expert',
}

export default function UtilisatricesPage() {
  const [users,       setUsers]       = useState<UserRow[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'suspended'>('all')
  const [actionUser,  setActionUser]  = useState<UserRow | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionNote,  setActionNote]  = useState('')
  const [page,        setPage]        = useState(0)
  const PAGE_SIZE = 25

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('id, display_name, phone, wilaya, commune, trust_level, is_active, profile_type, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (search.trim()) {
      query = query.or(`display_name.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    if (filterActive === 'active')    query = query.eq('is_active', true)
    if (filterActive === 'suspended') query = query.eq('is_active', false)

    const { data, error } = await query
    if (!error && data) setUsers(data as UserRow[])
    setLoading(false)
  }, [search, filterActive, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function toggleSuspend(user: UserRow) {
    setActionLoading(true)
    const newActive = !user.is_active
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: newActive })
      .eq('id', user.id)

    if (!error) {
      // Log l'action admin
      await supabase.from('admin_audit_log').insert({
        admin_id:    (await supabase.auth.getUser()).data.user?.id,
        action:      newActive ? 'unsuspend_user' : 'suspend_user',
        target_type: 'user',
        target_id:   user.id,
        details:     { note: actionNote, display_name: user.display_name },
      })
      await fetchUsers()
      setActionUser(null)
      setActionNote('')
    }
    setActionLoading(false)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.anthracite }}>Utilisatrices</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>Gestion des comptes</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Rechercher par nom ou téléphone..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          style={{
            flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 12,
            border: '1.5px solid #e0d8d0', fontSize: 14, background: '#fff',
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'active', 'suspended'] as const).map(f => (
            <button key={f} onClick={() => { setFilterActive(f); setPage(0) }} style={{
              padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: filterActive === f ? COLORS.prune : '#fff',
              color: filterActive === f ? '#fff' : '#888',
              border: `1.5px solid ${filterActive === f ? COLORS.prune : '#e0d8d0'}`,
            }}>
              {f === 'all' ? 'Toutes' : f === 'active' ? '✅ Actives' : '🚫 Suspendues'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0ebe4', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${COLORS.prune}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#bbb' }}>Aucune utilisatrice trouvée</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#faf7f2', borderBottom: '1px solid #f0ebe4' }}>
                {['Utilisatrice', 'Localisation', 'Confiance', 'Statut', 'Inscrite le', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f8f4f0' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.anthracite }}>{user.display_name}</div>
                    {user.phone && <div style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>{user.phone}</div>}
                    <div style={{ fontSize: 11, color: '#ccc', marginTop: 1 }}>{user.id.slice(0, 8)}…</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#666' }}>
                    {[user.commune, user.wilaya].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: `${COLORS.sauge}22`, color: COLORS.sauge, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                      {TRUST_LABELS[user.trust_level] ?? `Niv. ${user.trust_level}`}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: user.is_active ? '#D1FAE5' : '#FEE2E2',
                      color:      user.is_active ? '#065F46' : '#991B1B',
                      borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                    }}>
                      {user.is_active ? '✅ Active' : '🚫 Suspendue'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: '#888' }}>
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => { setActionUser(user); setActionNote('') }}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600,
                        background: user.is_active ? '#FEE2E2' : '#D1FAE5',
                        color:      user.is_active ? '#991B1B' : '#065F46',
                      }}
                    >
                      {user.is_active ? 'Suspendre' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))}
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
        <button onClick={() => setPage(p => p + 1)} disabled={users.length < PAGE_SIZE} style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e0d8d0', background: '#fff', cursor: users.length < PAGE_SIZE ? 'not-allowed' : 'pointer', opacity: users.length < PAGE_SIZE ? 0.4 : 1 }}>
          Suivant →
        </button>
      </div>

      {/* Modal confirmation suspension */}
      {actionUser && (
        <div onClick={e => { if (e.target === e.currentTarget) setActionUser(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 420, maxWidth: '90vw' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: actionUser.is_active ? '#DC2626' : COLORS.sauge }}>
              {actionUser.is_active ? '🚫 Suspendre' : '✅ Réactiver'} ce compte
            </h2>
            <p style={{ margin: '0 0 20px', color: '#666', fontSize: 14 }}>
              <strong>{actionUser.display_name}</strong>
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                Note interne (optionnel)
              </label>
              <textarea
                value={actionNote}
                onChange={e => setActionNote(e.target.value)}
                placeholder="Motif de la suspension..."
                rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0d8d0', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setActionUser(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1.5px solid #e0d8d0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Annuler
              </button>
              <button
                onClick={() => toggleSuspend(actionUser)}
                disabled={actionLoading}
                style={{
                  flex: 2, padding: 12, borderRadius: 12, border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer', fontWeight: 700,
                  background: actionUser.is_active ? '#DC2626' : COLORS.sauge,
                  color: '#fff',
                  opacity: actionLoading ? 0.7 : 1,
                }}
              >
                {actionLoading ? 'En cours…' : actionUser.is_active ? 'Confirmer la suspension' : 'Confirmer la réactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

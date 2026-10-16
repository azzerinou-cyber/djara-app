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

interface Report {
  id:          string
  reason:      string
  details?:    string
  status:      'pending' | 'reviewed' | 'actioned' | 'dismissed'
  created_at:  string
  admin_note?: string
  reporter:    { display_name: string }
  reported:    { display_name: string; id: string; is_active: boolean }
}

const STATUS_LABELS = {
  pending:   { label: '⏳ En attente',  bg: '#FEF3C7', color: '#92400E' },
  reviewed:  { label: '👁️ Examiné',     bg: '#DBEAFE', color: '#1E40AF' },
  actioned:  { label: '✅ Traité',      bg: '#D1FAE5', color: '#065F46' },
  dismissed: { label: '❌ Rejeté',      bg: '#F3F4F6', color: '#4B5563' },
}

const REASON_LABELS: Record<string, string> = {
  comportement_inapproprie: '⚠️ Comportement inapproprié',
  faux_profil:              '🎭 Faux profil / usurpation',
  arnaque:                  '💸 Arnaque / fraude',
  contenu_choquant:         '🔞 Contenu choquant',
  autre:                    '📝 Autre',
}

export default function SignalementsPage() {
  const [reports,      setReports]      = useState<Report[]>([])
  const [loading,      setLoading]      = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'actioned' | 'dismissed'>('pending')
  const [selected,     setSelected]     = useState<Report | null>(null)
  const [note,         setNote]         = useState('')
  const [updating,     setUpdating]     = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('reports')
      .select(`
        id, reason, details, status, created_at, admin_note,
        reporter:reporter_id(display_name),
        reported:reported_id(display_name, id, is_active)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (filterStatus !== 'all') query = query.eq('status', filterStatus)

    const { data, error } = await query
    if (!error && data) setReports(data as unknown as Report[])
    setLoading(false)
  }, [filterStatus])

  useEffect(() => { fetchReports() }, [fetchReports])

  async function updateReport(reportId: string, newStatus: Report['status'], adminNote: string) {
    setUpdating(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('reports')
      .update({
        status:      newStatus,
        admin_note:  adminNote || null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (!error) {
      await supabase.from('admin_audit_log').insert({
        admin_id:    user?.id,
        action:      `report_${newStatus}`,
        target_type: 'report',
        target_id:   reportId,
        details:     { note: adminNote, status: newStatus },
      })
      await fetchReports()
      setSelected(null)
      setNote('')
    }
    setUpdating(false)
  }

  async function suspendReported(userId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ is_active: false }).eq('id', userId)
    await supabase.from('admin_audit_log').insert({
      admin_id:    user?.id,
      action:      'suspend_user_from_report',
      target_type: 'user',
      target_id:   userId,
    })
    await fetchReports()
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.anthracite }}>Signalements</h1>
        <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>File de modération</p>
      </div>

      {/* Filtres statut */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'pending', 'reviewed', 'actioned', 'dismissed'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: filterStatus === s ? COLORS.prune : '#fff',
            color: filterStatus === s ? '#fff' : '#666',
            border: `1.5px solid ${filterStatus === s ? COLORS.prune : '#e0d8d0'}`,
          }}>
            {s === 'all' ? 'Tous' : STATUS_LABELS[s].label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${COLORS.prune}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : reports.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', color: '#bbb', border: '1px solid #f0ebe4' }}>
          {filterStatus === 'pending' ? '🎉 Aucun signalement en attente !' : 'Aucun signalement'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reports.map(report => {
            const sl = STATUS_LABELS[report.status]
            return (
              <div key={report.id} style={{
                background: '#fff', borderRadius: 14, padding: '16px 20px',
                border: `1px solid ${report.status === 'pending' ? '#FECACA' : '#f0ebe4'}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ background: sl.bg, color: sl.color, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{sl.label}</span>
                      <span style={{ background: '#f5f0ee', color: COLORS.terracotta, borderRadius: 8, padding: '3px 10px', fontSize: 12 }}>
                        {REASON_LABELS[report.reason] ?? report.reason}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: COLORS.anthracite }}>
                      <strong>{report.reporter?.display_name ?? '—'}</strong>
                      <span style={{ color: '#888' }}> a signalé </span>
                      <strong style={{ color: report.reported?.is_active === false ? '#DC2626' : COLORS.prune }}>
                        {report.reported?.display_name ?? '—'}
                        {report.reported?.is_active === false && ' 🚫'}
                      </strong>
                    </div>
                    {report.details && (
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#666', fontStyle: 'italic' }}>
                        « {report.details.length > 120 ? report.details.slice(0, 120) + '…' : report.details} »
                      </p>
                    )}
                    {report.admin_note && (
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: COLORS.sauge }}>📝 Note admin : {report.admin_note}</p>
                    )}
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#bbb' }}>
                      {new Date(report.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelected(report); setNote(report.admin_note ?? '') }}
                    style={{ padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${COLORS.prune}`, background: '#fff', color: COLORS.prune, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    Traiter
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal traitement */}
      {selected && (
        <div onClick={e => { if (e.target === e.currentTarget) setSelected(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 480, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: COLORS.anthracite }}>Traiter le signalement</h2>
            <p style={{ margin: '0 0 20px', color: '#888', fontSize: 14 }}>
              {REASON_LABELS[selected.reason] ?? selected.reason}
            </p>

            {/* Infos */}
            <div style={{ background: '#faf7f2', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 14 }}>
              <p style={{ margin: '0 0 4px' }}><strong>Signaleur :</strong> {selected.reporter?.display_name}</p>
              <p style={{ margin: '0 0 4px' }}><strong>Signalé :</strong> {selected.reported?.display_name}</p>
              {selected.details && <p style={{ margin: '8px 0 0', color: '#666', fontStyle: 'italic' }}>« {selected.details} »</p>}
            </div>

            {/* Note admin */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>Note interne</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Votre note de modération..."
                rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0d8d0', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selected.reported?.is_active !== false && (
                <button
                  onClick={async () => { await suspendReported(selected.reported.id); await updateReport(selected.id, 'actioned', note) }}
                  disabled={updating}
                  style={{ padding: '12px', borderRadius: 12, border: 'none', background: '#DC2626', color: '#fff', cursor: updating ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: updating ? 0.7 : 1 }}
                >
                  🚫 Suspendre le compte signalé + marquer traité
                </button>
              )}
              <button onClick={() => updateReport(selected.id, 'actioned', note)} disabled={updating} style={{ padding: '12px', borderRadius: 12, border: 'none', background: COLORS.sauge, color: '#fff', cursor: updating ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: updating ? 0.7 : 1 }}>
                ✅ Marquer comme traité
              </button>
              <button onClick={() => updateReport(selected.id, 'reviewed', note)} disabled={updating} style={{ padding: '12px', borderRadius: 12, border: `1.5px solid #BFDBFE`, background: '#EFF6FF', color: '#1D4ED8', cursor: updating ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: updating ? 0.7 : 1 }}>
                👁️ Marquer comme examiné (en cours)
              </button>
              <button onClick={() => updateReport(selected.id, 'dismissed', note)} disabled={updating} style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e0d8d0', background: '#fff', color: '#888', cursor: updating ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: updating ? 0.7 : 1 }}>
                ❌ Rejeter le signalement
              </button>
              <button onClick={() => setSelected(null)} style={{ padding: '10px', borderRadius: 12, border: 'none', background: 'transparent', color: '#bbb', cursor: 'pointer', fontSize: 13 }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

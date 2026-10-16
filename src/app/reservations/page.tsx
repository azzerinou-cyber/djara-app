'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

type Lang = 'fr' | 'ar'
type Mode = 'client' | 'provider'
type BookingStatus = 'pending' | 'accepted' | 'refused' | 'cancelled' | 'completed' | 'disputed'

interface Booking {
  id: string
  status: BookingStatus
  scheduled_at: string | null
  message: string | null
  provider_note: string | null
  created_at: string
  updated_at: string
  service: {
    id: string
    title: string
  } | null
  client: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
  provider: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
}

const t = {
  fr: {
    reservations: 'Mes réservations',
    enTantQueCliente: 'En tant que cliente',
    enTantQuePrestataire: 'En tant que prestataire',
    enAttente: 'En attente',
    acceptee: 'Acceptée',
    refusee: 'Refusée',
    annulee: 'Annulée',
    terminee: 'Terminée',
    litige: 'Litige',
    service: 'Service',
    le: 'le',
    message: 'Message',
    accepter: 'Accepter',
    refuser: 'Refuser',
    annuler: 'Annuler',
    marquerTerminee: 'Marquer terminée',
    signalerLitige: 'Signaler un litige',
    laisserAvis: 'Laisser un avis',
    contacter: 'Contacter',
    voirProfil: 'Voir le profil',
    aucuneReservation: 'Aucune réservation pour l\'instant',
    chargement: 'Chargement...',
    retour: 'Retour',
    confirmation: 'Confirmation',
    confirmerAction: 'Confirmez-vous cette action ?',
    oui: 'Oui',
    non: 'Non',
    erreur: 'Une erreur est survenue. Réessayez.',
    demandeRecue: 'Demande reçue le',
    prevu: 'Prévu le',
    par: 'par',
    pour: 'pour',
    // Review modal
    laisserAvisTitle: 'Laisser un avis',
    note: 'Note globale',
    ponctualite: 'Ponctualité',
    communication: 'Communication',
    qualite: 'Qualité',
    commentaire: 'Commentaire',
    commentairePlaceholder: 'Décrivez votre expérience...',
    publierAvis: 'Publier l\'avis',
    avisPublie: 'Avis publié !',
    envoi: 'Envoi...',
  },
  ar: {
    reservations: 'حجوزاتي',
    enTantQueCliente: 'كعميلة',
    enTantQuePrestataire: 'كمقدمة خدمة',
    enAttente: 'في الانتظار',
    acceptee: 'مقبولة',
    refusee: 'مرفوضة',
    annulee: 'ملغاة',
    terminee: 'منجزة',
    litige: 'نزاع',
    service: 'الخدمة',
    le: 'بتاريخ',
    message: 'الرسالة',
    accepter: 'قبول',
    refuser: 'رفض',
    annuler: 'إلغاء',
    marquerTerminee: 'تحديد كمنجز',
    signalerLitige: 'الإبلاغ عن نزاع',
    laisserAvis: 'ترك تقييم',
    contacter: 'تواصل',
    voirProfil: 'عرض الملف',
    aucuneReservation: 'لا توجد حجوزات حالياً',
    chargement: '...جاري التحميل',
    retour: 'رجوع',
    confirmation: 'تأكيد',
    confirmerAction: 'هل تؤكدين هذا الإجراء؟',
    oui: 'نعم',
    non: 'لا',
    erreur: 'حدث خطأ. أعيدي المحاولة.',
    demandeRecue: 'تم الاستلام في',
    prevu: 'مجدول في',
    par: 'من',
    pour: 'لـ',
    laisserAvisTitle: 'ترك تقييم',
    note: 'التقييم العام',
    ponctualite: 'الالتزام بالوقت',
    communication: 'التواصل',
    qualite: 'جودة الخدمة',
    commentaire: 'تعليق',
    commentairePlaceholder: '...صفي تجربتك',
    publierAvis: 'نشر التقييم',
    avisPublie: '!تم نشر التقييم',
    envoi: '...إرسال',
  },
}

const COLORS = {
  prune: '#59364A',
  terracotta: '#C77D69',
  ivoire: '#FAF7F2',
  sauge: '#A8B5A2',
  anthracite: '#292929',
}

const STATUS_CONFIG: Record<BookingStatus, { label: Record<Lang, string>; bg: string; color: string; emoji: string }> = {
  pending:   { label: { fr: 'En attente',  ar: 'في الانتظار' }, bg: '#FFF3CD', color: '#856404', emoji: '⏳' },
  accepted:  { label: { fr: 'Acceptée',    ar: 'مقبولة'      }, bg: '#D1FAE5', color: '#065F46', emoji: '✅' },
  refused:   { label: { fr: 'Refusée',     ar: 'مرفوضة'      }, bg: '#FEE2E2', color: '#991B1B', emoji: '❌' },
  cancelled: { label: { fr: 'Annulée',     ar: 'ملغاة'       }, bg: '#F3F4F6', color: '#374151', emoji: '🚫' },
  completed: { label: { fr: 'Terminée',    ar: 'منجزة'       }, bg: '#EDE9FE', color: '#4C1D95', emoji: '🏆' },
  disputed:  { label: { fr: 'Litige',      ar: 'نزاع'        }, bg: '#FEF3C7', color: '#92400E', emoji: '⚠️' },
}

function Avatar({ url, name, size = 40 }: { url: string | null; name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: url ? `url(${url}) center/cover` : `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.prune})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, color: '#fff', fontWeight: 700,
    }}>
      {!url && name?.[0]?.toUpperCase()}
    </div>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: n <= value ? '#F5A623' : '#ddd' }}>★</button>
      ))}
    </div>
  )
}

export default function ReservationsPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('fr')
  const [mode, setMode] = useState<Mode>('client')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Action confirmation modal
  const [confirmAction, setConfirmAction] = useState<{ bookingId: string; status: string; label: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  // Review modal
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewPunctuality, setReviewPunctuality] = useState(5)
  const [reviewCommunication, setReviewCommunication] = useState(5)
  const [reviewQuality, setReviewQuality] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const tx = t[lang]
  const isRTL = lang === 'ar'

  const fetchBookings = useCallback(async (uid: string, m: Mode) => {
    setLoading(true)
    const field = m === 'client' ? 'client_id' : 'provider_id'
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, status, scheduled_at, message, provider_note, created_at, updated_at,
        service:service_id(id, title),
        client:client_id(id, display_name, avatar_url),
        provider:provider_id(id, display_name, avatar_url)
      `)
      .eq(field, uid)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) setBookings(data as unknown as Booking[])
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/connexion'); return }
      setUserId(user.id)
      fetchBookings(user.id, mode)
    })
  }, [fetchBookings, mode, router])

  const switchMode = (m: Mode) => {
    setMode(m)
    if (userId) fetchBookings(userId, m)
  }

  const doAction = async () => {
    if (!confirmAction) return
    setActionLoading(true)
    setActionError('')
    try {
      const { error } = await supabase.rpc('update_booking_status', {
        p_booking_id: confirmAction.bookingId,
        p_new_status: confirmAction.status,
      })
      if (error) throw error
      setConfirmAction(null)
      if (userId) fetchBookings(userId, mode)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : tx.erreur)
    } finally {
      setActionLoading(false)
    }
  }

  const submitReview = async () => {
    if (!reviewBooking || !userId) return
    setReviewLoading(true)
    setReviewError('')
    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id: reviewBooking.id,
        reviewer_id: userId,
        provider_id: reviewBooking.provider?.id,
        rating: reviewRating,
        punctuality: reviewPunctuality,
        communication: reviewCommunication,
        quality: reviewQuality,
        comment: reviewComment || null,
      })
      if (error) throw error
      setReviewSuccess(true)
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : tx.erreur)
    } finally {
      setReviewLoading(false)
    }
  }

  const ask = (bookingId: string, status: string, label: string) => {
    setActionError('')
    setConfirmAction({ bookingId, status, label })
  }

  const openReview = (b: Booking) => {
    setReviewBooking(b)
    setReviewRating(5); setReviewPunctuality(5); setReviewCommunication(5); setReviewQuality(5)
    setReviewComment(''); setReviewSuccess(false); setReviewError('')
  }

  const fmtDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: COLORS.ivoire, fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto', paddingBottom: 96 }}>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      {/* ── CONFIRMATION MODAL ──────────────────────────────────────────── */}
      {confirmAction && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setConfirmAction(null) }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{ background: '#fff', borderRadius: 18, padding: 24, width: '100%', maxWidth: 340 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: COLORS.anthracite }}>{tx.confirmation}</h3>
            <p style={{ margin: '0 0 20px', color: '#555', fontSize: 14 }}>{tx.confirmerAction}</p>
            <p style={{ margin: '0 0 20px', fontWeight: 700, color: COLORS.prune, fontSize: 15 }}>«{confirmAction.label}»</p>
            {actionError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 14 }}>{actionError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmAction(null)} style={{ flex: 1, padding: '12px', background: '#fff', border: '1.5px solid #e0d8d0', color: '#666', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
                {tx.non}
              </button>
              <button onClick={doAction} disabled={actionLoading} style={{ flex: 1, padding: '12px', background: COLORS.prune, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                {actionLoading ? '…' : tx.oui}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REVIEW MODAL ────────────────────────────────────────────────── */}
      {reviewBooking && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setReviewBooking(null) }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', animation: 'slideUp 0.3s ease', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, background: '#e0d8d0', borderRadius: 2, margin: '0 auto 20px' }} />
            {reviewSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 56 }}>⭐</div>
                <h3 style={{ color: COLORS.prune, margin: '12px 0 8px' }}>{tx.avisPublie}</h3>
                <button onClick={() => setReviewBooking(null)} style={{ marginTop: 16, padding: '12px 28px', background: COLORS.prune, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
              </div>
            ) : (
              <>
                <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: COLORS.anthracite }}>{tx.laisserAvisTitle}</h2>
                {[
                  { label: tx.note, value: reviewRating, set: setReviewRating },
                  { label: tx.ponctualite, value: reviewPunctuality, set: setReviewPunctuality },
                  { label: tx.communication, value: reviewCommunication, set: setReviewCommunication },
                  { label: tx.qualite, value: reviewQuality, set: setReviewQuality },
                ].map(({ label, value, set }) => (
                  <div key={label} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>{label}</label>
                    <StarPicker value={value} onChange={set} />
                  </div>
                ))}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>{tx.commentaire}</label>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder={tx.commentairePlaceholder}
                    maxLength={500}
                    rows={3}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e0d8d0', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                {reviewError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 14 }}>{reviewError}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setReviewBooking(null)} style={{ flex: 1, padding: '13px', background: '#fff', border: '1.5px solid #e0d8d0', color: '#666', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {tx.non}
                  </button>
                  <button onClick={submitReview} disabled={reviewLoading} style={{ flex: 2, padding: '13px', background: reviewLoading ? '#ccc' : COLORS.terracotta, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: reviewLoading ? 'not-allowed' : 'pointer' }}>
                    {reviewLoading ? tx.envoi : tx.publierAvis}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`, padding: '20px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', cursor: 'pointer', fontSize: 14 }}>
            ← {tx.retour}
          </button>
          <h1 style={{ color: '#fff', margin: 0, fontSize: 18, fontWeight: 700 }}>{tx.reservations}</h1>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['fr', 'ar'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? COLORS.terracotta : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: lang === l ? 700 : 400 }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODE TOGGLE ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', margin: '16px 20px 0', background: '#fff', borderRadius: 12, padding: 4, border: '1px solid #e8e0d8' }}>
        {(['client', 'provider'] as Mode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)} style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none',
            background: mode === m ? COLORS.prune : 'transparent',
            color: mode === m ? '#fff' : '#888',
            fontWeight: mode === m ? 700 : 400, fontSize: 13, cursor: 'pointer',
          }}>
            {m === 'client' ? tx.enTantQueCliente : tx.enTantQuePrestataire}
          </button>
        ))}
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: COLORS.prune }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${COLORS.prune}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p>{tx.chargement}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <p style={{ marginTop: 12, fontSize: 16 }}>{tx.aucuneReservation}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bookings.map(b => {
              const cfg = STATUS_CONFIG[b.status]
              const other = mode === 'client' ? b.provider : b.client
              const isProvider = mode === 'provider'

              return (
                <div key={b.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0ebe4', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  {/* Status bar */}
                  <div style={{ background: cfg.bg, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{cfg.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label[lang]}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#999' }}>
                      {fmtDate(b.created_at)}
                    </span>
                  </div>

                  <div style={{ padding: 16 }}>
                    {/* Service + other party */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      {other && <Avatar url={other.avatar_url} name={other.display_name} size={44} />}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: COLORS.anthracite }}>
                          {other?.display_name}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: COLORS.terracotta, fontWeight: 600 }}>
                          {b.service?.title}
                        </p>
                      </div>
                    </div>

                    {/* Date prévue */}
                    {b.scheduled_at && (
                      <p style={{ margin: '0 0 8px', fontSize: 13, color: '#555' }}>
                        📅 {tx.prevu} {fmtDate(b.scheduled_at)}
                      </p>
                    )}

                    {/* Message client */}
                    {b.message && (
                      <div style={{ background: '#FAF7F2', borderRadius: 10, padding: '10px 12px', marginBottom: 12, borderLeft: `3px solid ${COLORS.sauge}` }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#555' }}>{b.message}</p>
                      </div>
                    )}

                    {/* Note prestataire */}
                    {b.provider_note && (
                      <div style={{ background: '#FFF3CD', borderRadius: 10, padding: '10px 12px', marginBottom: 12, borderLeft: '3px solid #F59E0B' }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#856404' }}>{b.provider_note}</p>
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                      {/* Contacter */}
                      {other && (
                        <button
                          onClick={async () => {
                            const { data } = await supabase.rpc('get_or_create_conversation', { other_user_id: other.id })
                            if (data) router.push('/messages?conv=' + data)
                          }}
                          style={{ padding: '8px 14px', background: '#fff', border: `1.5px solid ${COLORS.prune}`, color: COLORS.prune, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          💬 {tx.contacter}
                        </button>
                      )}

                      {/* Voir profil */}
                      {other && (
                        <button
                          onClick={() => router.push(`/profil/${other.id}`)}
                          style={{ padding: '8px 14px', background: '#fff', border: '1.5px solid #e0d8d0', color: '#555', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}
                        >
                          👤 {tx.voirProfil}
                        </button>
                      )}

                      {/* PROVIDER actions on pending */}
                      {isProvider && b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => ask(b.id, 'accepted', tx.accepter)}
                            style={{ padding: '8px 14px', background: '#D1FAE5', border: 'none', color: '#065F46', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                          >
                            ✅ {tx.accepter}
                          </button>
                          <button
                            onClick={() => ask(b.id, 'refused', tx.refuser)}
                            style={{ padding: '8px 14px', background: '#FEE2E2', border: 'none', color: '#991B1B', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                          >
                            ❌ {tx.refuser}
                          </button>
                        </>
                      )}

                      {/* PROVIDER: marquer terminée */}
                      {isProvider && b.status === 'accepted' && (
                        <button
                          onClick={() => ask(b.id, 'completed', tx.marquerTerminee)}
                          style={{ padding: '8px 14px', background: '#EDE9FE', border: 'none', color: '#4C1D95', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                        >
                          🏆 {tx.marquerTerminee}
                        </button>
                      )}

                      {/* CLIENT: annuler (pending ou accepted) */}
                      {!isProvider && ['pending', 'accepted'].includes(b.status) && (
                        <button
                          onClick={() => ask(b.id, 'cancelled', tx.annuler)}
                          style={{ padding: '8px 14px', background: '#F3F4F6', border: 'none', color: '#374151', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}
                        >
                          🚫 {tx.annuler}
                        </button>
                      )}

                      {/* Signaler litige (accepted ou completed, both parties) */}
                      {['accepted', 'completed'].includes(b.status) && (
                        <button
                          onClick={() => ask(b.id, 'disputed', tx.signalerLitige)}
                          style={{ padding: '8px 14px', background: '#FEF3C7', border: 'none', color: '#92400E', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}
                        >
                          ⚠️ {tx.signalerLitige}
                        </button>
                      )}

                      {/* CLIENT: laisser un avis (completed) */}
                      {!isProvider && b.status === 'completed' && (
                        <button
                          onClick={() => openReview(b)}
                          style={{ padding: '8px 14px', background: COLORS.terracotta, border: 'none', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                        >
                          ⭐ {tx.laisserAvis}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

'use client'

/**
 * /favoris
 *
 * Page des prestataires sauvegardées par l'utilisatrice connectée.
 * Données récupérées via la vue my_favorites (Supabase).
 * Bouton retirer : appelle toggle_favorite() côté serveur.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

type Lang = 'fr' | 'ar'

interface Favori {
  favorite_id: string
  favorited_at: string
  provider_id: string
  display_name: string | null
  avatar_url: string | null
  commune: string | null
  wilaya: string | null
  bio: string | null
  trust_level: number
  is_active: boolean
  avg_rating: number
  review_count: number
  first_service_title: string | null
  first_service_category: string | null
  first_service_price: number | null
}

const t = {
  fr: {
    titre: 'Mes favoris',
    sousTitre: 'Vos prestataires sauvegardées',
    aucun: 'Aucun favori pour l\'instant',
    aucunDetail: 'Enregistrez des prestataires depuis leur profil pour les retrouver facilement ici.',
    explorer: 'Explorer les prestataires',
    retirer: 'Retirer',
    retrait: 'Retrait…',
    voirProfil: 'Voir le profil',
    avis: (n: number) => n === 0 ? 'Aucun avis' : n === 1 ? '1 avis' : `${n} avis`,
    note: (n: number) => n > 0 ? `${n.toFixed(1)} ★` : '—',
    depuis: 'depuis',
    chargement: 'Chargement…',
    erreur: 'Erreur de chargement',
    reessayer: 'Réessayer',
    ajouteLe: 'Ajouté le',
    nonConnecte: 'Vous devez être connectée pour accéder à vos favoris.',
    seConnecter: 'Se connecter',
    profil: 'Profil',
    inactif: 'Profil inactif',
    connexion: 'Connexion',
  },
  ar: {
    titre: 'المفضلة',
    sousTitre: 'مقدمات الخدمات المحفوظات',
    aucun: 'لا توجد مفضلة حتى الآن',
    aucunDetail: 'احفظي مقدمات الخدمات من ملفاتهن للرجوع إليهن بسهولة.',
    explorer: 'استكشاف مقدمات الخدمات',
    retirer: 'إزالة',
    retrait: '...إزالة',
    voirProfil: 'عرض الملف',
    avis: (n: number) => n === 0 ? 'لا تقييمات' : `${n} تقييم`,
    note: (n: number) => n > 0 ? `${n.toFixed(1)} ★` : '—',
    depuis: 'منذ',
    chargement: '...جاري التحميل',
    erreur: 'خطأ في التحميل',
    reessayer: 'إعادة المحاولة',
    ajouteLe: 'أُضيف في',
    nonConnecte: 'يجب أن تكوني مسجلة الدخول للوصول إلى مفضلتك.',
    seConnecter: 'تسجيل الدخول',
    profil: 'الملف',
    inactif: 'ملف غير نشط',
    connexion: 'تسجيل الدخول',
  },
}

const COLORS = {
  prune: '#59364A',
  terracotta: '#C77D69',
  ivoire: '#FAF7F2',
  sauge: '#A8B5A2',
  anthracite: '#292929',
}

const CATEGORIES_EMOJI: Record<string, string> = {
  maison: '🏠',
  beaute: '💄',
  education: '📚',
  creation: '🎨',
  digital: '💻',
  evenements: '🎉',
}

function Avatar({ name, avatarUrl, size = 56 }: { name: string | null; avatarUrl: string | null; size?: number }) {
  const initials = name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?'
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? ''}
        width={size}
        height={size}
        style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${COLORS.prune} 0%, ${COLORS.terracotta} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.32, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function TrustBadge({ level }: { level: number }) {
  if (level < 2) return null
  const emoji = level >= 3 ? '✅' : '☑️'
  return (
    <span style={{ fontSize: 12 }} title={`Niveau de confiance ${level}`}>{emoji}</span>
  )
}

function formatDate(iso: string, lang: Lang): string {
  try {
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch {
    return iso.slice(0, 10)
  }
}

export default function FavorisPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('fr')
  const [favoris, setFavoris] = useState<Favori[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retirant, setRetirant] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const tx = t[lang]
  const isRTL = lang === 'ar'

  // ── Vérifier l'auth ─────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
    })
  }, [])

  // ── Charger les favoris ──────────────────────────────────────────────────────
  const charger = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: err } = await supabase
        .from('my_favorites')
        .select('*')

      if (err) throw err
      setFavoris(data ?? [])
    } catch (e: unknown) {
      console.error('[favoris]', e)
      setError(tx.erreur)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated === true) {
      charger()
    } else if (isAuthenticated === false) {
      setLoading(false)
    }
  }, [isAuthenticated])

  // ── Retirer un favori ────────────────────────────────────────────────────────
  const retirer = async (favoriteId: string, providerId: string) => {
    setRetirant(favoriteId)
    try {
      const { error: err } = await supabase.rpc('toggle_favorite', {
        p_provider_id: providerId,
      })
      if (err) throw err
      // Retrait optimiste local
      setFavoris(prev => prev.filter(f => f.favorite_id !== favoriteId))
    } catch (e: unknown) {
      console.error('[retirer favori]', e)
    } finally {
      setRetirant(null)
    }
  }

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: COLORS.ivoire,
        fontFamily: 'sans-serif',
        paddingBottom: 100,
      }}
    >
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`,
        padding: '52px 20px 28px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#fff' }}>
                ❤️ {tx.titre}
              </h1>
              {!loading && favoris.length > 0 && (
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                  {favoris.length} {favoris.length === 1 ? 'prestataire' : 'prestataires'}
                </p>
              )}
            </div>
            {/* Toggle langue */}
            <div style={{ display: 'flex', gap: 6 }}>
              {(['fr', 'ar'] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    background: lang === l ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                    border: 'none', borderRadius: 8,
                    padding: '4px 10px', color: '#fff',
                    cursor: 'pointer', fontSize: 12, fontWeight: lang === l ? 700 : 400,
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

        {/* ── NON CONNECTÉE ──────────────────────────────────────────── */}
        {isAuthenticated === false && (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 24px',
            textAlign: 'center', boxShadow: '0 2px 16px rgba(89,54,74,0.08)',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
            <p style={{ fontSize: 15, color: '#555', marginBottom: 24 }}>{tx.nonConnecte}</p>
            <button
              onClick={() => router.push('/connexion')}
              style={{
                padding: '13px 32px',
                background: `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`,
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {tx.seConnecter}
            </button>
          </div>
        )}

        {/* ── CHARGEMENT ─────────────────────────────────────────────── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#999' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p>{tx.chargement}</p>
          </div>
        )}

        {/* ── ERREUR ─────────────────────────────────────────────────── */}
        {!loading && error && (
          <div style={{
            background: '#FEF2F2', borderRadius: 16, padding: '24px',
            textAlign: 'center', color: '#DC2626',
          }}>
            <p style={{ marginBottom: 16 }}>{error}</p>
            <button
              onClick={charger}
              style={{
                padding: '10px 24px', background: COLORS.prune,
                color: '#fff', border: 'none', borderRadius: 12,
                fontSize: 14, cursor: 'pointer',
              }}
            >
              {tx.reessayer}
            </button>
          </div>
        )}

        {/* ── LISTE VIDE ──────────────────────────────────────────────── */}
        {!loading && !error && isAuthenticated && favoris.length === 0 && (
          <div style={{
            background: '#fff', borderRadius: 20, padding: '48px 24px',
            textAlign: 'center', boxShadow: '0 2px 16px rgba(89,54,74,0.08)',
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🤍</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.anthracite, marginBottom: 10 }}>
              {tx.aucun}
            </h2>
            <p style={{ fontSize: 14, color: '#777', lineHeight: 1.6, marginBottom: 28 }}>
              {tx.aucunDetail}
            </p>
            <button
              onClick={() => router.push('/rechercher')}
              style={{
                padding: '13px 28px',
                background: `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`,
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {tx.explorer}
            </button>
          </div>
        )}

        {/* ── LISTE DES FAVORIS ───────────────────────────────────────── */}
        {!loading && !error && favoris.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {favoris.map(fav => (
              <div
                key={fav.favorite_id}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: '16px',
                  boxShadow: '0 2px 12px rgba(89,54,74,0.08)',
                  opacity: fav.is_active ? 1 : 0.6,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Badge inactif */}
                {!fav.is_active && (
                  <div style={{
                    position: 'absolute', top: 12, right: isRTL ? 'auto' : 12, left: isRTL ? 12 : 'auto',
                    background: '#F3F4F6', borderRadius: 8, padding: '3px 8px',
                    fontSize: 10, color: '#6B7280', fontWeight: 600,
                  }}>
                    {tx.inactif}
                  </div>
                )}

                {/* Ligne principale */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <Avatar name={fav.display_name} avatarUrl={fav.avatar_url} size={56} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: COLORS.anthracite }}>
                        {fav.display_name ?? '—'}
                      </span>
                      <TrustBadge level={fav.trust_level} />
                    </div>

                    <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                      {[fav.commune, fav.wilaya].filter(Boolean).join(', ')}
                    </p>

                    {/* Note & avis */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                      {fav.avg_rating > 0 && (
                        <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>
                          {tx.note(fav.avg_rating)}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                        {tx.avis(fav.review_count)}
                      </span>
                    </div>

                    {/* Premier service */}
                    {fav.first_service_title && (
                      <div style={{
                        marginTop: 10, padding: '6px 10px',
                        background: '#FAF7F2', borderRadius: 10,
                        fontSize: 13, color: COLORS.prune,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <span>{CATEGORIES_EMOJI[fav.first_service_category ?? ''] ?? '🛠️'}</span>
                        <span style={{ fontWeight: 500 }}>{fav.first_service_title}</span>
                        {fav.first_service_price && (
                          <span style={{ marginLeft: 'auto', fontSize: 12, color: COLORS.terracotta, fontWeight: 700 }}>
                            {fav.first_service_price.toLocaleString()} DA
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date d'ajout */}
                <p style={{
                  margin: '12px 0 0', fontSize: 11, color: '#D1D5DB',
                  textAlign: isRTL ? 'left' : 'right',
                }}>
                  {tx.ajouteLe} {formatDate(fav.favorited_at, lang)}
                </p>

                {/* Boutons action */}
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button
                    onClick={() => router.push(`/profil/${fav.provider_id}`)}
                    style={{
                      flex: 1, padding: '11px',
                      background: `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`,
                      color: '#fff', border: 'none', borderRadius: 12,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    {tx.voirProfil}
                  </button>
                  <button
                    onClick={() => retirer(fav.favorite_id, fav.provider_id)}
                    disabled={retirant === fav.favorite_id}
                    style={{
                      padding: '11px 16px',
                      background: retirant === fav.favorite_id ? '#F3F4F6' : '#FEF2F2',
                      color: retirant === fav.favorite_id ? '#9CA3AF' : '#DC2626',
                      border: 'none', borderRadius: 12,
                      fontSize: 13, fontWeight: 600,
                      cursor: retirant === fav.favorite_id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {retirant === fav.favorite_id ? tx.retrait : `🗑 ${tx.retirer}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import type { MapProviderInput } from '@/components/MapView'

// ── Constantes ────────────────────────────────────────────────────────────────

const COLORS = {
  prune: '#59364A',
  terracotta: '#C77D69',
  ivoire: '#FAF7F2',
  sauge: '#A8B5A2',
  anthracite: '#292929',
}

const RADIUS_OPTIONS = [1, 3, 5, 10, 25, 50] // km

const SLUG_TO_ICON: Record<string, string> = {
  cuisine: '🍳', beaute: '💄', education: '📚',
  couture: '🧵', digital: '💻', evenements: '🎉',
}

// Retire les caractères qui cassent la syntaxe des filtres PostgREST
const clean = (v: string) => v.trim().replace(/[,()*%\\]/g, ' ').trim()

// ── Leaflet côté client uniquement ───────────────────────────────────────────
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 320, borderRadius: 16, background: COLORS.ivoire,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#888', fontSize: 14,
    }}>
      Chargement de la carte…
    </div>
  ),
})

// ── Types ─────────────────────────────────────────────────────────────────────

interface Category { id: string; name_fr: string; icon: string | null }

// Résultat commun (géo + texte)
interface ProviderResult {
  id: string
  display_name: string
  business_name: string | null
  commune: string | null
  wilaya: string | null
  bio: string | null
  trust_level: number
  avatar_url: string | null
  avg_rating: number
  review_count: number
  distance_km?: number
  approx_latitude?: number
  approx_longitude?: number
  // Pour l'affichage sur la carte
  latitude?: number | null
  longitude?: number | null
}

// ── Composant principal ───────────────────────────────────────────────────────

function RechercherContent() {
  const searchParams = useSearchParams()

  // Filtres textuels
  const [search, setSearch]   = useState(() => searchParams.get('q') ?? '')
  const [wilaya, setWilaya]   = useState('')
  const [commune, setCommune] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Filtres géographiques
  const [useGeo, setUseGeo]         = useState(false)
  const [gpsLat, setGpsLat]         = useState<number | null>(null)
  const [gpsLng, setGpsLng]         = useState<number | null>(null)
  const [radius, setRadius]         = useState(10)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError]     = useState('')

  // Données
  const [profiles, setProfiles]     = useState<ProviderResult[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const catIcon = (() => {
    const slug = searchParams.get('categorie')
    return slug ? (SLUG_TO_ICON[slug] ?? '') : ''
  })()

  // Catégories
  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name_fr, icon')
      .eq('is_active', true)
      .order('name_fr')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  // ── Récupération GPS ─────────────────────────────────────────────────────────
  const requestGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('La géolocalisation n\'est pas disponible sur cet appareil.')
      return
    }
    setGpsLoading(true)
    setGpsError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsLat(pos.coords.latitude)
        setGpsLng(pos.coords.longitude)
        setUseGeo(true)
        setGpsLoading(false)
      },
      err => {
        setGpsLoading(false)
        if (err.code === 1) {
          setGpsError('Accès à la position refusé. Vous pouvez chercher par wilaya/commune.')
        } else {
          setGpsError('Impossible d\'obtenir votre position. Réessayez.')
        }
        setUseGeo(false)
      },
      { timeout: 8000, maximumAge: 60000 }
    )
  }

  const clearGPS = () => {
    setUseGeo(false)
    setGpsLat(null)
    setGpsLng(null)
    setGpsError('')
  }

  // ── Recherche ─────────────────────────────────────────────────────────────────
  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      if (useGeo && gpsLat !== null && gpsLng !== null) {
        // ── MODE GÉO : RPC PostGIS ──────────────────────────────────────────
        const { data, error: rpcErr } = await supabase.rpc('search_providers_nearby', {
          p_lat:          gpsLat,
          p_lng:          gpsLng,
          p_radius_km:    radius,
          p_category_id:  selectedCategory || null,
          p_search_term:  clean(search) || null,
        })
        if (rpcErr) throw rpcErr
        // Mapper approx_lat/lng vers latitude/longitude pour la carte
        const mapped: ProviderResult[] = (data ?? []).map((r: ProviderResult) => ({
          ...r,
          latitude:  r.approx_latitude ?? null,
          longitude: r.approx_longitude ?? null,
        }))
        setProfiles(mapped)
      } else {
        // ── MODE TEXTE : RPC fallback ───────────────────────────────────────
        const { data, error: rpcErr } = await supabase.rpc('search_providers_text', {
          p_wilaya:      clean(wilaya) || null,
          p_commune:     clean(commune) || null,
          p_category_id: selectedCategory || null,
          p_search_term: clean(search) || null,
          p_limit:       30,
        })
        if (rpcErr) throw rpcErr
        setProfiles(data ?? [])
      }
    } catch (e: unknown) {
      console.error('[search]', e)
      setError('Impossible de charger les prestataires. Vérifiez votre connexion.')
      setProfiles([])
    }

    setLoading(false)
  }, [useGeo, gpsLat, gpsLng, radius, selectedCategory, search, wilaya, commune])

  // Déclenchement auto quand catégorie ou mode géo change
  useEffect(() => {
    fetchProfiles()
  }, [selectedCategory, useGeo, radius]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Rendu ─────────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    flex: 1, minWidth: 140, padding: '11px 16px',
    border: '1.5px solid #e0d8d0', borderRadius: 12,
    fontSize: 15, outline: 'none', background: '#fff',
    color: COLORS.anthracite,
  }

  return (
    <main style={{ padding: '24px 20px', maxWidth: 800, margin: '0 auto', paddingBottom: 96, background: COLORS.ivoire, minHeight: '100vh' }}>

      {/* ── En-tête ── */}
      <h1 style={{ color: COLORS.prune, marginBottom: 24, fontSize: 22, fontWeight: 700 }}>
        {catIcon ? `${catIcon} ` : '📍 '}Rechercher une prestataire
      </h1>

      {/* ── Barre de recherche ── */}
      <form
        onSubmit={e => { e.preventDefault(); fetchProfiles() }}
        style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}
      >
        <input
          type="text"
          placeholder="Nom, savoir-faire, service…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, minWidth: 200 }}
        />
        {/* Wilaya + Commune uniquement en mode texte */}
        {!useGeo && (
          <>
            <input
              type="text"
              placeholder="Wilaya"
              value={wilaya}
              onChange={e => setWilaya(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Commune"
              value={commune}
              onChange={e => setCommune(e.target.value)}
              style={inputStyle}
            />
          </>
        )}
        <button
          type="submit"
          style={{
            padding: '11px 22px', background: COLORS.prune, color: '#fff',
            border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: 'pointer',
          }}
        >
          Rechercher
        </button>
      </form>

      {/* ── Géolocalisation ── */}
      <div style={{ marginBottom: 20 }}>
        {!useGeo ? (
          <button
            onClick={requestGPS}
            disabled={gpsLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 16px', borderRadius: 12,
              border: `1.5px solid ${COLORS.terracotta}`,
              background: '#fff', color: COLORS.terracotta,
              fontSize: 14, fontWeight: 600, cursor: gpsLoading ? 'wait' : 'pointer',
              opacity: gpsLoading ? 0.7 : 1,
            }}
          >
            {gpsLoading ? '📡 Localisation…' : '📍 Utiliser ma position'}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Indicateur actif */}
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 12,
              background: `${COLORS.sauge}22`, color: COLORS.sauge,
              border: `1.5px solid ${COLORS.sauge}`, fontSize: 14, fontWeight: 600,
            }}>
              📍 Position activée
            </span>

            {/* Sélecteur de rayon */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {RADIUS_OPTIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  style={{
                    padding: '7px 13px', borderRadius: 20, fontSize: 13,
                    border: `1.5px solid ${COLORS.prune}`, cursor: 'pointer',
                    background: radius === r ? COLORS.prune : '#fff',
                    color: radius === r ? '#fff' : COLORS.prune,
                    fontWeight: radius === r ? 700 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {r} km
                </button>
              ))}
            </div>

            {/* Désactiver le GPS */}
            <button
              onClick={clearGPS}
              style={{
                padding: '7px 13px', borderRadius: 20, fontSize: 13,
                border: '1.5px solid #e0d8d0', background: '#fff',
                color: '#888', cursor: 'pointer',
              }}
            >
              ✕ Désactiver
            </button>
          </div>
        )}

        {/* Erreur GPS */}
        {gpsError && (
          <p style={{ marginTop: 8, fontSize: 13, color: '#c0392b' }}>{gpsError}</p>
        )}
      </div>

      {/* ── Filtres catégories ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <button
          onClick={() => setSelectedCategory('')}
          style={{
            padding: '8px 16px', borderRadius: 20, fontSize: 13,
            border: `1.5px solid ${COLORS.prune}`, cursor: 'pointer',
            background: selectedCategory === '' ? COLORS.prune : '#fff',
            color: selectedCategory === '' ? '#fff' : COLORS.prune,
          }}
        >
          Toutes
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
            style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 13,
              border: `1.5px solid ${COLORS.prune}`, cursor: 'pointer',
              background: selectedCategory === cat.id ? COLORS.prune : '#fff',
              color: selectedCategory === cat.id ? '#fff' : COLORS.prune,
            }}
          >
            {cat.icon ? `${cat.icon} ` : ''}{cat.name_fr}
          </button>
        ))}
      </div>

      {/* ── Carte ── */}
      {profiles.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <MapView externalProviders={profiles as MapProviderInput[]} />
        </div>
      )}

      {/* ── Résultats ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#888' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
          <p>Recherche en cours…</p>
        </div>
      ) : error ? (
        <div style={{
          background: '#fff0f0', border: '1px solid #ffcccc',
          borderRadius: 12, padding: 16, color: '#c0392b', fontSize: 14, textAlign: 'center',
        }}>
          {error}
        </div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#888' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: COLORS.anthracite }}>Aucune prestataire trouvée</p>
          {useGeo ? (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 14, marginBottom: 12 }}>
                Aucune prestataire dans un rayon de {radius} km.
              </p>
              {radius < 50 && (
                <button
                  onClick={() => {
                    const next = RADIUS_OPTIONS.find(r => r > radius) ?? 50
                    setRadius(next)
                  }}
                  style={{
                    padding: '10px 20px', background: COLORS.terracotta,
                    color: '#fff', border: 'none', borderRadius: 12,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Élargir à {RADIUS_OPTIONS.find(r => r > radius) ?? 50} km
                </button>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 14, marginTop: 8 }}>
              Essayez une autre catégorie, wilaya ou commune.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Compteur + mode actif */}
          <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
            {profiles.length} prestataire{profiles.length > 1 ? 's' : ''} trouvée{profiles.length > 1 ? 's' : ''}
            {useGeo ? ` dans un rayon de ${radius} km` : ''}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {profiles.map(profile => (
              <div
                key={profile.id}
                style={{
                  background: '#fff', borderRadius: 16, padding: '18px 20px',
                  border: '1px solid #f0ebe4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ color: COLORS.anthracite, fontSize: 15, fontWeight: 600, marginBottom: 3 }}>
                      {profile.display_name}
                      {profile.business_name && (
                        <span style={{ color: '#888', fontWeight: 400, fontSize: 13 }}> · {profile.business_name}</span>
                      )}
                    </h3>
                    <p style={{ color: '#888', fontSize: 13 }}>
                      📍 {[profile.commune, profile.wilaya].filter(Boolean).join(', ') || 'Localisation non renseignée'}
                    </p>
                  </div>

                  {/* Distance (mode géo) */}
                  {profile.distance_km !== undefined && (
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: COLORS.terracotta,
                      background: `${COLORS.terracotta}12`, padding: '4px 10px',
                      borderRadius: 10, whiteSpace: 'nowrap',
                    }}>
                      {profile.distance_km < 1
                        ? `< 1 km`
                        : `${profile.distance_km} km`}
                    </span>
                  )}
                </div>

                {profile.bio && (
                  <p style={{ color: '#555', fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
                    {profile.bio.length > 120 ? profile.bio.slice(0, 120) + '…' : profile.bio}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Note */}
                  {profile.avg_rating > 0 && (
                    <span style={{ fontSize: 13, color: '#f39c12' }}>
                      ★ {profile.avg_rating.toFixed(1)}
                      <span style={{ color: '#aaa', fontSize: 12 }}> ({profile.review_count})</span>
                    </span>
                  )}
                  {/* Vérification */}
                  {profile.trust_level >= 2 && (
                    <span style={{ fontSize: 12, color: COLORS.sauge, fontWeight: 600 }}>✓ Vérifiée</span>
                  )}
                  {/* CTA */}
                  <Link
                    href={`/profil/${profile.id}`}
                    style={{
                      marginLeft: 'auto', padding: '8px 16px',
                      background: COLORS.prune, color: '#fff',
                      borderRadius: 10, fontSize: 13, fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Voir le profil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <BottomNav />
    </main>
  )
}

export default function RechercherPage() {
  return (
    <Suspense fallback={
      <main style={{
        minHeight: '100vh', background: '#FAF7F2',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888',
      }}>
        Chargement…
      </main>
    }>
      <RechercherContent />
    </Suspense>
  )
}

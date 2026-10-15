'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

const SLUG_TO_ICON: Record<string, string> = {
  'cuisine': '🍳',
  'beaute': '💄',
  'education': '📚',
  'couture': '🧵',
  'digital': '💻',
  'evenements': '🎉',
}

// Leaflet a besoin de `window` : chargement côté client uniquement
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '400px', borderRadius: '16px', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '14px' }}>
      Chargement de la carte...
    </div>
  ),
})

interface Category {
  id: string
  name_fr: string
  icon: string | null
}

interface ProfileResult {
  id: string
  display_name: string
  business_name: string | null
  wilaya: string | null
  commune: string | null
  bio: string | null
  trust_level: number
  services: { category_id: string | null; categories: { name_fr: string; icon: string | null } | null }[] | null
}

// Retire les caractères qui cassent la syntaxe des filtres PostgREST (or, ilike)
const clean = (value: string) => value.trim().replace(/[,()*%\\]/g, ' ').trim()

// Catégories distinctes des annonces d'une prestataire
const profileCategories = (p: ProfileResult) => {
  const seen = new Map<string, string>()
  for (const s of p.services ?? []) {
    if (s.categories && !seen.has(s.categories.name_fr)) {
      seen.set(s.categories.name_fr, `${s.categories.icon ?? ''} ${s.categories.name_fr}`.trim())
    }
  }
  return [...seen.values()]
}

function RechercherContent() {
  const searchParams = useSearchParams()
  const [profiles, setProfiles] = useState<ProfileResult[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')
  const [wilaya, setWilaya] = useState('')
  const [commune, setCommune] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [catIcon] = useState(() => {
    const slug = searchParams.get('categorie')
    return slug ? (SLUG_TO_ICON[slug] ?? '') : ''
  })

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name_fr, icon')
      .eq('is_active', true)
      .order('name_fr')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    setError('')

    // La catégorie vient des annonces : jointure interne seulement si on filtre dessus
    const servicesEmbed = selectedCategory ? 'services!inner' : 'services'
    let query = supabase
      .from('profiles')
      .select(`
        id, display_name, business_name, wilaya, commune, bio, trust_level,
        ${servicesEmbed} ( category_id, categories ( name_fr, icon ) )
      `)
      .eq('is_active', true)
      .neq('profile_type', 'particuliere')
      .order('trust_level', { ascending: false })
      .limit(20)

    const term = clean(search)
    if (term) query = query.or(`display_name.ilike.*${term}*,business_name.ilike.*${term}*,bio.ilike.*${term}*`)
    if (clean(wilaya)) query = query.ilike('wilaya', `%${clean(wilaya)}%`)
    if (clean(commune)) query = query.ilike('commune', `%${clean(commune)}%`)
    if (selectedCategory) query = query.eq('services.category_id', selectedCategory)

    const { data, error: fetchError } = await query
    if (fetchError) {
      setError('Impossible de charger les prestataires.')
      setProfiles([])
    } else {
      setProfiles((data ?? []) as unknown as ProfileResult[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  const inputStyle = {
    flex: 1, minWidth: '140px', padding: '12px 16px',
    border: '1.5px solid #e0d8d0', borderRadius: '12px',
    fontSize: '15px', outline: 'none', background: '#fff',
  }

  return (
    <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', paddingBottom: '96px' }}>
      <h1 style={{ color: '#59364A', marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>
        {catIcon ? `${catIcon} ` : ''}Rechercher une prestataire
      </h1>

      {/* Barre de recherche */}
      <form
        onSubmit={e => { e.preventDefault(); fetchProfiles() }}
        style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}
      >
        <input
          type="text"
          placeholder="Nom, savoir-faire..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, minWidth: '200px' }}
        />
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
        <button
          type="submit"
          style={{
            padding: '12px 24px', background: '#59364A', color: '#fff',
            border: 'none', borderRadius: '12px', fontWeight: 600,
            fontSize: '15px', cursor: 'pointer',
          }}
        >
          Rechercher
        </button>
      </form>

      {/* Filtres catégories */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button
          onClick={() => setSelectedCategory('')}
          style={{
            padding: '8px 16px', borderRadius: '20px', fontSize: '13px',
            border: '1.5px solid #59364A', cursor: 'pointer',
            background: selectedCategory === '' ? '#59364A' : '#fff',
            color: selectedCategory === '' ? '#fff' : '#59364A',
          }}
        >
          Toutes
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
            style={{
              padding: '8px 16px', borderRadius: '20px', fontSize: '13px',
              border: '1.5px solid #59364A', cursor: 'pointer',
              background: selectedCategory === cat.id ? '#59364A' : '#fff',
              color: selectedCategory === cat.id ? '#fff' : '#59364A',
            }}
          >
            {cat.icon ? `${cat.icon} ` : ''}{cat.name_fr}
          </button>
        ))}
      </div>

      {/* Carte des prestataires */}
      <div style={{ marginBottom: '24px' }}>
        <MapView />
      </div>

      {/* Résultats */}
      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Chargement...</p>
      ) : error ? (
        <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '12px', padding: '16px', color: '#c0392b', fontSize: '14px', textAlign: 'center' }}>
          {error}
        </div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#888' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</p>
          <p style={{ fontSize: '16px' }}>Aucune prestataire trouvée</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>Essayez une autre catégorie, wilaya ou commune.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {profiles.map(profile => (
            <div
              key={profile.id}
              style={{
                background: '#fff', borderRadius: '16px', padding: '20px',
                border: '1px solid #f0ebe4', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ color: '#292929', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                  {profile.display_name}
                  {profile.business_name && (
                    <span style={{ color: '#888', fontWeight: 400, fontSize: '14px' }}> · {profile.business_name}</span>
                  )}
                </h3>
                <p style={{ color: '#888', fontSize: '13px' }}>
                  📍 {[profile.commune, profile.wilaya].filter(Boolean).join(', ') || 'Localisation non renseignée'}
                </p>
              </div>

              {profile.bio && (
                <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>
                  {profile.bio.length > 120 ? profile.bio.slice(0, 120) + '…' : profile.bio}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {profileCategories(profile).map(cat => (
                  <span
                    key={cat}
                    style={{
                      background: '#f5f0ee', color: '#C77D69', padding: '4px 10px',
                      borderRadius: '10px', fontSize: '12px',
                    }}
                  >
                    {cat}
                  </span>
                ))}
                {profile.trust_level >= 2 && (
                  <span style={{ fontSize: '12px', color: '#A8B5A2' }}>✓ Vérifiée</span>
                )}
                <Link
                  href={`/profil/${profile.id}`}
                  style={{
                    marginLeft: 'auto', padding: '8px 16px', background: '#59364A',
                    color: '#fff', borderRadius: '10px', fontSize: '13px',
                    fontWeight: 600, textDecoration: 'none',
                  }}
                >
                  Voir le profil
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <BottomNav />
    </main>
  )
}

export default function RechercherPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Chargement…</main>}>
      <RechercherContent />
    </Suspense>
  )
}

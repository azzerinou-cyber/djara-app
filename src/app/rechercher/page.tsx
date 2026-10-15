'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabase'

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

interface ServiceResult {
  id: string
  provider_id: string
  title_fr: string
  description_fr: string | null
  price_min: number | null
  price_max: number | null
  price_unit: string | null
  wilaya: string | null
  commune: string | null
  categories: { name_fr: string; icon: string | null } | null
  profiles: {
    display_name: string
    trust_level: number
  } | null
}

// Formatage prix
const formatPrix = (s: ServiceResult) => {
  if (!s.price_min && !s.price_max) return null
  const unit = s.price_unit ? ` / ${s.price_unit}` : ''
  if (s.price_min && s.price_max && s.price_min !== s.price_max) {
    return `${s.price_min.toLocaleString()} – ${s.price_max.toLocaleString()} DA${unit}`
  }
  return `${(s.price_min ?? s.price_max ?? 0).toLocaleString()} DA${unit}`
}

export default function RechercherPage() {
  const [services, setServices] = useState<ServiceResult[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name_fr, icon')
      .eq('is_active', true)
      .order('name_fr')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    setError('')
    let query = supabase
      .from('services')
      .select(`
        id, provider_id, title_fr, description_fr, price_min, price_max, price_unit, wilaya, commune,
        categories ( name_fr, icon ),
        profiles ( display_name, trust_level )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (search.trim()) query = query.ilike('title_fr', `%${search.trim()}%`)
    if (selectedCategory) query = query.eq('category_id', selectedCategory)

    const { data, error: fetchError } = await query
    if (fetchError) {
      setError('Impossible de charger les services.')
      setServices([])
    } else {
      setServices((data ?? []) as unknown as ServiceResult[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  return (
    <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#59364A', marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>
        Rechercher un service
      </h1>

      {/* Barre de recherche */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Que recherchez-vous ?"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchServices()}
          style={{
            flex: 1, minWidth: '200px', padding: '12px 16px',
            border: '1.5px solid #e0d8d0', borderRadius: '12px',
            fontSize: '15px', outline: 'none', background: '#fff',
          }}
        />
        <button
          onClick={fetchServices}
          style={{
            padding: '12px 24px', background: '#59364A', color: '#fff',
            border: 'none', borderRadius: '12px', fontWeight: 600,
            fontSize: '15px', cursor: 'pointer',
          }}
        >
          Rechercher
        </button>
      </div>

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
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#888' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</p>
          <p style={{ fontSize: '16px' }}>Aucun service trouvé</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>Essayez une autre catégorie ou un autre terme.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {services.map(service => (
            <div
              key={service.id}
              style={{
                background: '#fff', borderRadius: '16px', padding: '20px',
                border: '1px solid #f0ebe4', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ color: '#292929', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                    {service.title_fr}
                  </h3>
                  <p style={{ color: '#888', fontSize: '13px' }}>
                    {[service.profiles?.display_name, [service.commune, service.wilaya].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {formatPrix(service) && (
                  <span style={{
                    background: '#FAF7F2', color: '#59364A', padding: '6px 12px',
                    borderRadius: '20px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    {formatPrix(service)}
                  </span>
                )}
              </div>

              {service.description_fr && (
                <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>
                  {service.description_fr.length > 120
                    ? service.description_fr.slice(0, 120) + '…'
                    : service.description_fr}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {service.categories && (
                  <span style={{
                    background: '#f5f0ee', color: '#C77D69', padding: '4px 10px',
                    borderRadius: '10px', fontSize: '12px',
                  }}>
                    {service.categories.icon ? `${service.categories.icon} ` : ''}{service.categories.name_fr}
                  </span>
                )}
                {(service.profiles?.trust_level ?? 0) >= 2 && (
                  <span style={{ fontSize: '12px', color: '#A8B5A2' }}>✓ Vérifiée</span>
                )}
                <a
                  href={`/profil/${service.provider_id}`}
                  style={{
                    marginLeft: 'auto', padding: '8px 16px', background: '#59364A',
                    color: '#fff', borderRadius: '10px', fontSize: '13px',
                    fontWeight: 600, textDecoration: 'none',
                  }}
                >
                  Voir le profil
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

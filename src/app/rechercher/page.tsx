'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ServiceResult {
  id: string
  title: string
  description: string
  price_min: number | null
  price_max: number | null
  category: string
  subcategory: string
  profiles: {
    display_name: string
    commune: string
    wilaya: string
    trust_level: number
  }
}

// Formatage prix
const formatPrix = (s: ServiceResult) => {
  if (!s.price_min && !s.price_max) return null
  if (s.price_min && s.price_max && s.price_min !== s.price_max) {
    return `${s.price_min.toLocaleString()} – ${s.price_max.toLocaleString()} DA`
  }
  return `${(s.price_min ?? s.price_max ?? 0).toLocaleString()} DA`
}

const CATEGORIES = [
  'Maison et quotidien',
  'Beauté et bien-être',
  'Éducation et transmission',
  'Création et artisanat',
  'Digital et entrepreneuriat',
  'Événements',
]

export default function RechercherPage() {
  const [services, setServices] = useState<ServiceResult[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [wilaya, setWilaya] = useState('')

  const fetchServices = async () => {
    setLoading(true)
    let query = supabase
      .from('services')
      .select(`
        id, title, description, price_min, price_max, category, subcategory,
        profiles ( display_name, commune, wilaya, trust_level )
      `)
      .eq('status', 'active')
      .limit(20)

    if (search) query = query.ilike('title', `%${search}%`)
    if (selectedCategory) query = query.eq('category', selectedCategory)
    if (wilaya) query = query.eq('profiles.wilaya', wilaya)

    const { data, error } = await query
    if (!error && data) setServices(data as unknown as ServiceResult[])
    setLoading(false)
  }

  useEffect(() => {
    fetchServices()
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
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
            style={{
              padding: '8px 16px', borderRadius: '20px', fontSize: '13px',
              border: '1.5px solid #59364A', cursor: 'pointer',
              background: selectedCategory === cat ? '#59364A' : '#fff',
              color: selectedCategory === cat ? '#fff' : '#59364A',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Résultats */}
      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Chargement...</p>
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
                    {service.title}
                  </h3>
                  <p style={{ color: '#888', fontSize: '13px' }}>
                    {service.profiles?.display_name} · {service.profiles?.commune}, {service.profiles?.wilaya}
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

              {service.description && (
                <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>
                  {service.description.length > 120
                    ? service.description.slice(0, 120) + '…'
                    : service.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  background: '#f5f0ee', color: '#C77D69', padding: '4px 10px',
                  borderRadius: '10px', fontSize: '12px',
                }}>
                  {service.category}
                </span>
                {service.profiles?.trust_level >= 2 && (
                  <span style={{ fontSize: '12px', color: '#A8B5A2' }}>✓ Vérifiée</span>
                )}
                <a
                  href={`/profil/${service.id}`}
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
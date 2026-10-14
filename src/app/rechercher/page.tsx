'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Service {
  id: string
  title: string
  description: string
  wilaya: string
  commune: string
  price_min: number | null
  price_max: number | null
  price_type: string
  categories: { name_fr: string; icon: string }
  profiles: { display_name: string; avatar_url: string | null; trust_level: number }
}

export default function RechercherPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [wilaya, setWilaya] = useState('')
  const [categorySlug, setCategorySlug] = useState('')

  useEffect(() => {
    fetchServices()
  }, [wilaya, categorySlug])

  async function fetchServices() {
    setLoading(true)
    let query = supabase
      .from('services')
      .select(`
        id, title, description, wilaya, commune,
        price_min, price_max, price_type,
        categories(name_fr, icon),
        profiles(display_name, avatar_url, trust_level)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (wilaya) query = query.eq('wilaya', wilaya)

    const { data, error } = await query

    if (!error && data) setServices(data as unknown as Service[])
    setLoading(false)
  }

  return (
    <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#59364A', marginBottom: '24px' }}>Rechercher un service</h1>

      <input
        placeholder="Filtrer par wilaya..."
        value={wilaya}
        onChange={e => setWilaya(e.target.value)}
        style={{
          width: '100%', padding: '12px', marginBottom: '24px',
          border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px'
        }}
      />

      {loading && <p style={{ color: '#888' }}>Chargement...</p>}

      {!loading && services.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '48px' }}>
          Aucun service trouvé. Soyez la première à publier ! 🌸
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {services.map(service => (
          <div key={service.id} style={{
            background: '#fff', borderRadius: '12px',
            padding: '20px', border: '1px solid #eee',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#C77D69', fontWeight: 600 }}>
                  {service.categories?.icon} {service.categories?.name_fr}
                </span>
                <h2 style={{ color: '#292929', margin: '4px 0 8px', fontSize: '18px' }}>
                  {service.title}
                </h2>
                <p style={{ color: '#666', fontSize: '14px', margin: '0 0 12px' }}>
                  {service.description}
                </p>
                <p style={{ color: '#888', fontSize: '13px' }}>
                  📍 {service.commune}, {service.wilaya}
                </p>
              </div>
              {service.price_min && (
                <div style={{
                  background: '#FAF7F2', borderRadius: '8px',
                  padding: '8px 14px', textAlign: 'center', minWidth: '80px'
                }}>
                  <p style={{ color: '#59364A', fontWeight: 700, margin: 0 }}>
                    {service.price_min} DA
                  </p>
                </div>
              )}
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '12px', paddingTop: '12px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>
                👤 {service.profiles?.display_name}
                {service.profiles?.trust_level >= 2 && ' ✓'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
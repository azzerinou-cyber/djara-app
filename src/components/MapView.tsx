'use client'

// Composant 100 % client : à charger via next/dynamic avec { ssr: false }
// (Leaflet accède à `window` dès l'import).
import { useEffect, useState } from 'react'
import Link from 'next/link'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/lib/supabase'

const ALGERIA_CENTER: [number, number] = [28.0339, 1.6596]
const ALGERIA_ZOOM = 5

type Provider = {
  id: string
  display_name: string
  wilaya: string | null
  latitude: number
  longitude: number
  category: string | null
}

type ProviderRow = {
  id: string
  display_name: string
  wilaya: string | null
  latitude: number
  longitude: number
  services: { is_active: boolean; categories: { name_fr: string; icon: string | null } | null }[] | null
}

/** Type accepté par la prop externalProviders de MapView.
 *  latitude/longitude peuvent être null — les entrées nulles sont filtrées automatiquement. */
export type MapProviderInput = {
  id: string
  display_name: string
  wilaya: string | null
  latitude: number | null
  longitude: number | null
  services: { is_active: boolean; categories: { name_fr: string; icon: string | null } | null }[] | null
}

// Marqueur prune DJARA en SVG : évite les icônes PNG par défaut de Leaflet,
// dont les chemins cassent avec les bundlers.
const markerIcon = L.divIcon({
  className: '',
  html: `<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 27 15 27s15-15.8 15-27C30 6.7 23.3 0 15 0z" fill="#59364A"/>
    <circle cx="15" cy="15" r="6" fill="#FAF7F2"/>
  </svg>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -38],
})

type MapViewProps = {
  /** Résultats filtrés passés depuis la page de recherche.
   *  Quand fournis, la carte affiche ces prestataires au lieu de tout charger.
   *  Les entrées avec latitude/longitude null sont ignorées automatiquement. */
  externalProviders?: MapProviderInput[]
}

export default function MapView({ externalProviders }: MapViewProps) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Convertit une ProviderRow (format Supabase) en Provider (format carte)
  function toProvider(row: ProviderRow): Provider {
    const category = row.services?.find(s => s.is_active && s.categories)?.categories
    return {
      id: row.id,
      display_name: row.display_name,
      wilaya: row.wilaya,
      latitude: row.latitude,
      longitude: row.longitude,
      category: category ? `${category.icon ?? ''} ${category.name_fr}`.trim() : null,
    }
  }

  // Si des résultats filtrés sont fournis depuis l'extérieur, les utiliser directement
  useEffect(() => {
    if (externalProviders !== undefined) {
      setProviders(
        externalProviders
          .filter((r): r is MapProviderInput & { latitude: number; longitude: number } =>
            r.latitude != null && r.longitude != null
          )
          .map(toProvider)
      )
      setLoading(false)
      return
    }

    // Sinon, chargement autonome de tous les profils géolocalisés
    let active = true

    async function load() {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, display_name, wilaya, latitude, longitude, services ( is_active, categories ( name_fr, icon ) )')
        .eq('is_active', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (!active) return
      if (fetchError) {
        setError('Impossible de charger la carte.')
      } else {
        setProviders((data as unknown as ProviderRow[]).map(toProvider))
      }
      setLoading(false)
    }

    load()
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalProviders])

  return (
    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f0ebe4' }}>
      <MapContainer center={ALGERIA_CENTER} zoom={ALGERIA_ZOOM} scrollWheelZoom={false} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {providers.map(p => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={markerIcon} title={p.display_name}>
            <Popup>
              <div style={{ minWidth: '160px', fontFamily: 'inherit' }}>
                <div style={{ fontWeight: 700, color: '#59364A', fontSize: '15px' }}>{p.display_name}</div>
                {p.category && <div style={{ color: '#C77D69', fontSize: '12px', marginTop: '2px' }}>{p.category}</div>}
                {p.wilaya && <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>📍 {p.wilaya}</div>}
                <Link
                  href={`/profil/${p.id}`}
                  style={{
                    display: 'block', marginTop: '10px', padding: '8px 12px', background: '#59364A',
                    color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                    textDecoration: 'none', textAlign: 'center',
                  }}
                >
                  Voir le profil
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {(loading || error || providers.length === 0) && (
        <div style={{
          position: 'absolute', left: '50%', bottom: '12px', transform: 'translateX(-50%)', zIndex: 1000,
          background: '#fff', borderRadius: '20px', padding: '6px 14px', fontSize: '12px',
          color: error ? '#c0392b' : '#888', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', whiteSpace: 'nowrap',
        }}>
          {loading ? 'Chargement de la carte...' : error || 'Aucune prestataire localisée pour le moment'}
        </div>
      )}
    </div>
  )
}

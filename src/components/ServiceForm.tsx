'use client'

// Formulaire de service partagé : création (/publier) et modification (/publier/[id])
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra',
  'Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret',
  'Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda',
  'Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',
  'M\'Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj',
  'Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela',
  'Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal',
  'Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet',
  'El M\'Ghair','El Meniaa'
]

const DAYS = [
  { value: 'dimanche', label: 'Dim' },
  { value: 'lundi', label: 'Lun' },
  { value: 'mardi', label: 'Mar' },
  { value: 'mercredi', label: 'Mer' },
  { value: 'jeudi', label: 'Jeu' },
  { value: 'vendredi', label: 'Ven' },
  { value: 'samedi', label: 'Sam' },
]

const PRICE_UNITS = [
  { value: '', label: 'Sans unité' },
  { value: 'séance', label: 'Par séance' },
  { value: 'heure', label: 'Par heure' },
  { value: 'jour', label: 'Par jour' },
  { value: 'forfait', label: 'Forfait' },
]

const PHOTOS_BUCKET = 'service-photos'
const MAX_PHOTOS = 5
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const PHOTO_MAX_SIZE = 5 * 1024 * 1024

export type EditableService = {
  id: string
  provider_id: string
  category_id: string | null
  title_fr: string
  description_fr: string | null
  price_min: number | null
  price_max: number | null
  price_unit: string | null
  wilaya: string | null
  commune: string | null
  available_days?: string[] | null
  photo_urls?: string[] | null
}

interface Category {
  id: string
  name_fr: string
  icon: string | null
}

// Photo déjà en ligne (modification) ou nouveau fichier à envoyer
type Photo = { kind: 'existing'; url: string } | { kind: 'new'; file: File; preview: string }

const photoSrc = (p: Photo) => (p.kind === 'existing' ? p.url : p.preview)

// Chemin dans le bucket à partir de l'URL publique
const storagePath = (publicUrl: string) => {
  const marker = `/object/public/${PHOTOS_BUCKET}/`
  const i = publicUrl.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(publicUrl.slice(i + marker.length))
}

export default function ServiceForm({ service }: { service?: EditableService }) {
  const router = useRouter()
  const { user, profile } = useAuth()
  const isEdit = Boolean(service)
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    title: service?.title_fr ?? '',
    category_id: service?.category_id ?? '',
    description: service?.description_fr ?? '',
    price_min: service?.price_min?.toString() ?? '',
    price_max: service?.price_max?.toString() ?? '',
    price_unit: service?.price_unit ?? '',
    // null = pas encore touché : on affiche la localisation du profil
    wilaya: service?.wilaya ?? null as string | null,
    commune: service?.commune ?? null as string | null,
  })
  const [days, setDays] = useState<string[]>(service?.available_days ?? [])
  const [photos, setPhotos] = useState<Photo[]>((service?.photo_urls ?? []).map(url => ({ kind: 'existing', url })))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name_fr, icon')
      .eq('is_active', true)
      .order('name_fr')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  // Libérer les aperçus restants quand la page se ferme
  const photosRef = useRef(photos)
  useEffect(() => { photosRef.current = photos }, [photos])
  useEffect(() => () => photosRef.current.forEach(p => { if (p.kind === 'new') URL.revokeObjectURL(p.preview) }), [])

  const wilaya = form.wilaya ?? profile?.wilaya ?? ''
  const commune = form.commune ?? profile?.commune ?? ''

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function toggleDay(day: string) {
    setDays(d => (d.includes(day) ? d.filter(x => x !== day) : [...d, day]))
  }

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    setError('')

    const invalid = files.find(f => !PHOTO_TYPES.includes(f.type) || f.size > PHOTO_MAX_SIZE)
    if (invalid) {
      setError(`« ${invalid.name} » : JPG, PNG ou WEBP de 5 Mo maximum.`)
      return
    }
    const room = MAX_PHOTOS - photos.length
    if (files.length > room) setError(`5 photos maximum : seules les ${room} premières ont été ajoutées.`)
    setPhotos([...photos, ...files.slice(0, room).map(file => ({ kind: 'new' as const, file, preview: URL.createObjectURL(file) }))])
  }

  function removePhoto(index: number) {
    const photo = photos[index]
    if (photo.kind === 'new') URL.revokeObjectURL(photo.preview)
    setPhotos(photos.filter((_, i) => i !== index))
  }

  async function handleDelete() {
    if (!user || !service) return
    setLoading(true)
    setError('')

    const { data, error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', service.id)
      .eq('provider_id', user.id)
      .select('id')

    if (deleteError || !data?.length) {
      setError(
        deleteError?.code === '23503'
          ? 'Ce service est lié à des réservations, conversations ou signalements : il ne peut pas être supprimé.'
          : deleteError
            ? 'Erreur lors de la suppression : ' + deleteError.message
            : 'Suppression refusée : ce service ne vous appartient pas.'
      )
      setConfirmDelete(false)
      setLoading(false)
      return
    }

    // Photos enregistrées en base : suppression du stockage, non bloquante
    const paths = (service.photo_urls ?? []).map(storagePath).filter((p): p is string => Boolean(p))
    if (paths.length) await supabase.storage.from(PHOTOS_BUCKET).remove(paths)

    router.push('/profil')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')

    const priceMin = form.price_min ? Number(form.price_min) : null
    const priceMax = form.price_max ? Number(form.price_max) : null
    if (priceMin !== null && priceMax !== null && priceMax < priceMin) {
      setError('Le tarif maximum doit être supérieur au tarif minimum.')
      return
    }
    if (days.length === 0) {
      setError('Choisissez au moins un jour de disponibilité.')
      return
    }

    setLoading(true)
    const serviceId = service?.id ?? crypto.randomUUID()
    const uploadedPaths: string[] = []
    const photoUrls: string[] = []
    const cleanupUploads = async () => {
      if (uploadedPaths.length) await supabase.storage.from(PHOTOS_BUCKET).remove(uploadedPaths)
    }

    // Ordre conservé : photos existantes gardées et nouvelles, telles qu'affichées
    for (const photo of photos) {
      if (photo.kind === 'existing') {
        photoUrls.push(photo.url)
        continue
      }
      const ext = photo.file.type.split('/')[1].replace('jpeg', 'jpg')
      const path = `${user.id}/${serviceId}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(path, photo.file, { contentType: photo.file.type })
      if (uploadError) {
        await cleanupUploads()
        setError("Impossible d'envoyer les photos : " + uploadError.message)
        setLoading(false)
        return
      }
      uploadedPaths.push(path)
      photoUrls.push(supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl)
    }

    const fields = {
      category_id: form.category_id,
      title_fr: form.title.trim(),
      description_fr: form.description.trim(),
      price_min: priceMin,
      price_max: priceMax,
      price_unit: form.price_unit || null,
      wilaya,
      commune: commune.trim(),
      available_days: DAYS.map(d => d.value).filter(d => days.includes(d)),
      photo_urls: photoUrls,
    }

    if (service) {
      // Le filtre provider_id + RLS empêchent de modifier le service d'une autre :
      // aucune ligne renvoyée = refus
      const { data, error: updateError } = await supabase
        .from('services')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', service.id)
        .eq('provider_id', user.id)
        .select('id')

      if (updateError || !data?.length) {
        await cleanupUploads()
        setError(updateError ? 'Erreur lors de la modification : ' + updateError.message : 'Modification refusée : ce service ne vous appartient pas.')
        setLoading(false)
        return
      }

      // Photos retirées : suppression du stockage, non bloquante
      const removed = (service.photo_urls ?? [])
        .filter(url => !photoUrls.includes(url))
        .map(storagePath)
        .filter((p): p is string => Boolean(p))
      if (removed.length) await supabase.storage.from(PHOTOS_BUCKET).remove(removed)
    } else {
      const { error: insertError } = await supabase.from('services').insert({
        ...fields,
        id: serviceId,
        provider_id: user.id,
        is_active: true,
      })

      if (insertError) {
        await cleanupUploads()
        setError('Erreur lors de la publication : ' + insertError.message)
        setLoading(false)
        return
      }

      // Apparaître dans /rechercher. Non bloquant si ça échoue.
      if (profile) await supabase.from('profiles').update({ is_provider: true }).eq('id', user.id)
    }

    router.push('/profil')
  }

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px',
    border: '1px solid #e0d8d0', borderRadius: '10px',
    fontSize: '16px', fontFamily: 'inherit', boxSizing: 'border-box' as const,
    background: '#fff', color: '#292929',
  }
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }
  const hintStyle = { color: '#999', fontWeight: 400, fontSize: '12px' }

  return (
    <main style={{ minHeight: '100vh', background: '#FAF7F2', padding: '24px 16px 48px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#59364A', marginBottom: '8px' }}>{isEdit ? 'Modifier le service' : 'Proposer un service'}</h1>
        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>
          {isEdit ? 'Mettez à jour les informations de votre service.' : 'Partagez votre savoir-faire avec les femmes de votre wilaya.'}
        </p>

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #f0ebe4' }}>
          <label style={labelStyle}>Titre du service *</label>
          <input name="title" value={form.title} onChange={handleChange} required maxLength={120}
            placeholder="Ex : Cours de henné traditionnel" style={inputStyle} />

          <label style={labelStyle}>Catégorie *</label>
          <select name="category_id" value={form.category_id} onChange={handleChange} required style={inputStyle}>
            <option value="">Choisir une catégorie</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name_fr}</option>
            ))}
          </select>

          <label style={labelStyle}>Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required
            placeholder="Décrivez votre service, votre expérience, ce que vous proposez..."
            rows={5} style={{ ...inputStyle, resize: 'vertical' }} />

          <label style={labelStyle}>Tarif indicatif (DA) <span style={hintStyle}>— facultatif</span></label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input name="price_min" value={form.price_min} onChange={handleChange} type="number" min={0}
              placeholder="De" style={inputStyle} />
            <input name="price_max" value={form.price_max} onChange={handleChange} type="number" min={0}
              placeholder="À" style={inputStyle} />
            <select name="price_unit" value={form.price_unit} onChange={handleChange} style={inputStyle}>
              {PRICE_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>

          <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px' }}>
            <legend style={{ ...labelStyle, padding: 0 }}>Disponibilités *</legend>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {DAYS.map(d => {
                const selected = days.includes(d.value)
                return (
                  <button key={d.value} type="button" onClick={() => toggleDay(d.value)} aria-pressed={selected} style={{
                    flex: '1 0 64px', padding: '10px 0', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                    border: `1.5px solid ${selected ? '#59364A' : '#e0d8d0'}`,
                    background: selected ? '#59364A' : '#fff',
                    color: selected ? '#fff' : '#59364A',
                    fontWeight: selected ? 700 : 500,
                  }}>
                    {d.label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <label style={labelStyle}>Wilaya *</label>
          <select name="wilaya" value={wilaya} onChange={handleChange} required style={inputStyle}>
            <option value="">Choisir une wilaya</option>
            {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>

          <label style={labelStyle}>Commune *</label>
          <input name="commune" value={commune} onChange={handleChange} required
            placeholder="Ex : Bab El Oued" style={inputStyle} />

          <label style={labelStyle}>
            Photos <span style={hintStyle}>— {photos.length}/{MAX_PHOTOS}, JPG, PNG ou WEBP, 5 Mo max</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginBottom: '16px' }}>
            {photos.map((p, i) => (
              <div key={photoSrc(p)} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', background: '#FAF7F2' }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) ou URL Supabase Storage */}
                <img src={photoSrc(p)} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => removePhoto(i)} aria-label={`Retirer la photo ${i + 1}`} style={{
                  position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '50%',
                  border: 'none', background: 'rgba(89,54,74,0.85)', color: '#fff', cursor: 'pointer', fontSize: '14px', lineHeight: 1,
                }}>
                  ×
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label style={{
                aspectRatio: '1', borderRadius: '10px', border: '1.5px dashed #C77D69', background: '#FAF7F2',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#C77D69', fontSize: '12px', cursor: 'pointer', gap: '4px',
              }}>
                <span style={{ fontSize: '22px' }}>📷</span>
                Ajouter
                <input type="file" accept={PHOTO_TYPES.join(',')} multiple onChange={handlePhotos} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#c0392b', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '16px', background: loading ? '#9b7a8a' : '#59364A',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading
              ? (isEdit ? 'Enregistrement...' : 'Publication en cours...')
              : (isEdit ? '✏️ Enregistrer les modifications' : '🌸 Publier mon service')}
          </button>

          {isEdit && (
            <button type="button" onClick={() => router.push('/profil')} disabled={loading} style={{
              width: '100%', marginTop: '10px', padding: '12px', background: 'none', border: 'none',
              color: '#999', fontSize: '14px', cursor: 'pointer',
            }}>
              Annuler
            </button>
          )}
        </form>

        {isEdit && (
          <div style={{ marginTop: '16px', background: '#fff3f3', border: '1px solid #ffcccc', borderRadius: '16px', padding: '16px' }}>
            {confirmDelete ? (
              <>
                <p style={{ color: '#c0392b', fontSize: '14px', fontWeight: 600, margin: '0 0 12px' }}>
                  Supprimer définitivement ce service et ses photos ? Cette action est irréversible.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={handleDelete} disabled={loading} style={{
                    flex: 1, padding: '12px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '10px',
                    fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  }}>
                    {loading ? 'Suppression...' : 'Oui, supprimer'}
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} disabled={loading} style={{
                    flex: 1, padding: '12px', background: '#fff', color: '#59364A', border: '1px solid #e0d8d0', borderRadius: '10px',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  }}>
                    Non, garder
                  </button>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} disabled={loading} style={{
                width: '100%', padding: '12px', background: 'none', border: 'none',
                color: '#e53935', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}>
                🗑 Supprimer ce service
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
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

interface Category {
  id: string
  name_fr: string
  icon: string | null
}

type Photo = { file: File; preview: string }

export default function PublierPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    title: '',
    category_id: '',
    description: '',
    price_min: '',
    price_max: '',
    price_unit: '',
    // null = pas encore touché : on affiche la localisation du profil
    wilaya: null as string | null,
    commune: null as string | null,
  })
  const [days, setDays] = useState<string[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
  useEffect(() => () => photosRef.current.forEach(p => URL.revokeObjectURL(p.preview)), [])

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
    setPhotos([...photos, ...files.slice(0, room).map(file => ({ file, preview: URL.createObjectURL(file) }))])
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photos[index].preview)
    setPhotos(photos.filter((_, i) => i !== index))
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
    const serviceId = crypto.randomUUID()
    const uploadedPaths: string[] = []
    const photoUrls: string[] = []

    for (const [i, { file }] of photos.entries()) {
      const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
      const path = `${user.id}/${serviceId}/${i + 1}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(path, file, { contentType: file.type })
      if (uploadError) {
        if (uploadedPaths.length) await supabase.storage.from(PHOTOS_BUCKET).remove(uploadedPaths)
        setError("Impossible d'envoyer les photos : " + uploadError.message)
        setLoading(false)
        return
      }
      uploadedPaths.push(path)
      photoUrls.push(supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path).data.publicUrl)
    }

    const { error: insertError } = await supabase.from('services').insert({
      id: serviceId,
      provider_id: user.id,
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
      is_active: true,
    })

    if (insertError) {
      if (uploadedPaths.length) await supabase.storage.from(PHOTOS_BUCKET).remove(uploadedPaths)
      setError('Erreur lors de la publication : ' + insertError.message)
      setLoading(false)
      return
    }

    // Apparaître dans /rechercher. Non bloquant si ça échoue.
    if (profile) await supabase.from('profiles').update({ is_provider: true }).eq('id', user.id)

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

  if (authLoading) {
    return <main style={{ minHeight: '100vh', background: '#FAF7F2', padding: '48px 24px', textAlign: 'center', color: '#888' }}>Chargement...</main>
  }

  // Le service est rattaché au profil : il doit exister avant de publier
  if (!profile) {
    return (
      <main style={{ minHeight: '100vh', background: '#FAF7F2', padding: '48px 24px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>🌸</p>
          <h1 style={{ color: '#59364A', marginBottom: '8px' }}>Complétez d&apos;abord votre profil</h1>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Votre profil doit exister avant de publier un service.</p>
          <Link href="/inscription/profil" style={{ display: 'inline-block', background: '#59364A', color: '#fff', borderRadius: '10px', padding: '14px 24px', fontWeight: 700, textDecoration: 'none' }}>
            Compléter mon profil
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FAF7F2', padding: '24px 16px 48px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#59364A', marginBottom: '8px' }}>Proposer un service</h1>
        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>
          Partagez votre savoir-faire avec les femmes de votre wilaya.
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
              <div key={p.preview} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', background: '#FAF7F2' }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) */}
                <img src={p.preview} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            {loading ? 'Publication en cours...' : '🌸 Publier mon service'}
          </button>
        </form>
      </div>
    </main>
  )
}

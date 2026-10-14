'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

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

const CATEGORIES = [
  { id: '', label: 'Choisir une catégorie' },
  { id: 'maison-quotidien', label: '🏠 Maison et quotidien' },
  { id: 'beaute-bien-etre', label: '💄 Beauté et bien-être' },
  { id: 'education-transmission', label: '📚 Éducation et transmission' },
  { id: 'creation-artisanat', label: '🧵 Création et artisanat' },
  { id: 'digital-entrepreneuriat', label: '💻 Digital et entrepreneuriat' },
  { id: 'evenements', label: '🎉 Événements' },
]

export default function PublierPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    wilaya: '',
    commune: '',
    category_slug: '',
    price_min: '',
    price_type: 'negotiable',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Récupérer l'ID de la catégorie
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', form.category_slug)
      .single()

    if (!catData) {
      setError('Catégorie introuvable.')
      setLoading(false)
      return
    }

    // Vérifier si l'utilisatrice est connectée
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Vous devez être connectée pour publier un service.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('services').insert({
      provider_id: user.id,
      category_id: catData.id,
      title: form.title,
      description: form.description,
      wilaya: form.wilaya,
      commune: form.commune,
      price_min: form.price_min ? parseFloat(form.price_min) : null,
      price_type: form.price_type,
      is_active: true,
    })

    if (insertError) {
      setError('Erreur lors de la publication : ' + insertError.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '16px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '16px', fontFamily: 'inherit', boxSizing: 'border-box' as const,
    background: '#fff', color: '#292929',
  }

  if (success) return (
    <main style={{ padding: '48px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌸</div>
      <h1 style={{ color: '#59364A', marginBottom: '12px' }}>Service publié !</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Votre service est maintenant visible par les femmes de votre région.</p>
      <button
        onClick={() => { setSuccess(false); setForm({ title:'',description:'',wilaya:'',commune:'',category_slug:'',price_min:'',price_type:'negotiable' }) }}
        style={{ background: '#59364A', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 28px', fontSize: '16px', cursor: 'pointer' }}
      >
        Publier un autre service
      </button>
    </main>
  )

  return (
    <main style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#59364A', marginBottom: '8px' }}>Proposer un service</h1>
      <p style={{ color: '#888', marginBottom: '32px', fontSize: '14px' }}>
        Partagez votre savoir-faire avec les femmes de votre wilaya.
      </p>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#c0392b', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>
          Titre du service *
        </label>
        <input name="title" value={form.title} onChange={handleChange} required
          placeholder="Ex : Cours de henné traditionnel" style={inputStyle} />

        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>
          Catégorie *
        </label>
        <select name="category_slug" value={form.category_slug} onChange={handleChange} required style={inputStyle}>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>
          Description *
        </label>
        <textarea name="description" value={form.description} onChange={handleChange} required
          placeholder="Décrivez votre service, votre expérience, ce que vous proposez..."
          rows={4} style={{ ...inputStyle, resize: 'vertical' }} />

        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>
          Wilaya *
        </label>
        <select name="wilaya" value={form.wilaya} onChange={handleChange} required style={inputStyle}>
          <option value="">Choisir une wilaya</option>
          {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
        </select>

        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>
          Commune *
        </label>
        <input name="commune" value={form.commune} onChange={handleChange} required
          placeholder="Ex : Bab El Oued" style={inputStyle} />

        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: '#292929', fontSize: '14px' }}>
          Prix indicatif (DA)
        </label>
        <input name="price_min" value={form.price_min} onChange={handleChange}
          type="number" placeholder="Ex : 1500" style={inputStyle} />

        <select name="price_type" value={form.price_type} onChange={handleChange} style={inputStyle}>
          <option value="negotiable">Prix négociable</option>
          <option value="fixed">Prix fixe</option>
          <option value="hourly">Par heure</option>
        </select>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '16px', background: loading ? '#9b7a8a' : '#59364A',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '8px',
        }}>
          {loading ? 'Publication en cours...' : '🌸 Publier mon service'}
        </button>
      </form>
    </main>
  )
}
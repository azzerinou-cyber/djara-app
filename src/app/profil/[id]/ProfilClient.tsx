'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Lang = 'fr' | 'ar'
type Onglet = 'services' | 'galerie' | 'avis'

interface Profile {
  id: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  commune: string | null
  wilaya: string | null
  trust_level: number
  is_active: boolean
}

const t = {
  fr: {
    contacter: 'Contacter', demanderPrestation: 'Demander une prestation',
    services: 'Services', galerie: 'Galerie', avis: 'Avis',
    disponible: 'Disponible', indisponible: 'Indisponible',
    tarif: 'Tarif indicatif', verifie: 'Profil vérifié',
    retour: 'Retour', chargement: 'Chargement...', introuvable: 'Profil introuvable',
    niveauConfiance: 'Niveau de confiance',
  },
  ar: {
    contacter: 'تواصل', demanderPrestation: 'طلب خدمة',
    services: 'الخدمات', galerie: 'معرض الأعمال', avis: 'التقييمات',
    disponible: 'متاحة', indisponible: 'غير متاحة',
    tarif: 'السعر التقريبي', verifie: 'ملف موثق',
    retour: 'رجوع', chargement: '...جاري التحميل', introuvable: 'الملف غير موجود',
    niveauConfiance: 'مستوى الثقة',
  },
}

const COLORS = {
  prune: '#59364A', terracotta: '#C77D69',
  ivoire: '#FAF7F2', sauge: '#A8B5A2', anthracite: '#292929',
}

export default function ProfilClient() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [lang, setLang] = useState<Lang>('fr')
  const [onglet, setOnglet] = useState<Onglet>('services')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [id])

  const tx = t[lang]
  const isRTL = lang === 'ar'

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: COLORS.ivoire }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${COLORS.prune}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: COLORS.prune, fontFamily: 'sans-serif' }}>{tx.chargement}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: COLORS.ivoire, gap: 16 }}>
      <div style={{ fontSize: 48 }}>👤</div>
      <p style={{ color: COLORS.anthracite, fontFamily: 'sans-serif', fontSize: 18 }}>{tx.introuvable}</p>
      <button onClick={() => router.back()} style={{ background: COLORS.prune, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', fontFamily: 'sans-serif' }}>
        {tx.retour}
      </button>
    </div>
  )

  const trustBadge = profile!.trust_level >= 2 ? '✓' : null

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: COLORS.ivoire, fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.prune} 0%, #7a4a63 100%)`, padding: '20px 20px 60px', position: 'relative' }}>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', cursor: 'pointer', fontSize: 14 }}>
          ← {tx.retour}
        </button>
        <div style={{ position: 'absolute', top: 8, right: 16, display: 'flex', gap: 8 }}>
          {(['fr', 'ar'] as Lang[]).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? COLORS.terracotta : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: lang === l ? 700 : 400 }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: -45 }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: profile!.avatar_url ? `url(${profile!.avatar_url}) center/cover` : `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.prune})`, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          {!profile!.avatar_url && profile!.display_name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* Infos */}
      <div style={{ textAlign: 'center', padding: '12px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.anthracite }}>{profile!.display_name}</h1>
          {trustBadge && <span style={{ background: COLORS.sauge, color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>✓</span>}
        </div>
        <p style={{ color: '#888', fontSize: 14, margin: '4px 0' }}>{[profile!.commune, profile!.wilaya].filter(Boolean).join(', ')}</p>
        {profile!.bio && <p style={{ color: COLORS.anthracite, fontSize: 14, lineHeight: 1.6, margin: '12px 0' }}>{profile!.bio}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '8px 0 16px' }}>
          {trustBadge && <span style={{ background: `${COLORS.sauge}22`, color: COLORS.sauge, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{tx.verifie}</span>}
          <span style={{ background: `${COLORS.sauge}22`, color: COLORS.sauge, borderRadius: 20, padding: '4px 12px', fontSize: 12 }}>{tx.niveauConfiance} {profile!.trust_level}</span>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
        <button style={{ flex: 1, background: '#fff', border: `1.5px solid ${COLORS.prune}`, color: COLORS.prune, borderRadius: 14, padding: '13px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {tx.contacter}
        </button>
        <button style={{ flex: 1, background: COLORS.terracotta, border: 'none', color: '#fff', borderRadius: 14, padding: '13px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {tx.demanderPrestation}
        </button>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e8e0d8', margin: '0 20px' }}>
        {(['services', 'galerie', 'avis'] as Onglet[]).map(o => (
          <button key={o} onClick={() => setOnglet(o)} style={{ flex: 1, background: 'none', border: 'none', borderBottom: onglet === o ? `2px solid ${COLORS.prune}` : '2px solid transparent', color: onglet === o ? COLORS.prune : '#999', padding: '12px 0', fontWeight: onglet === o ? 700 : 400, fontSize: 14, cursor: 'pointer', textTransform: 'capitalize' }}>
            {tx[o as keyof typeof tx]}
          </button>
        ))}
      </div>

      {/* Contenu onglets */}
      <div style={{ padding: 20, minHeight: 200 }}>
        {onglet === 'services' && (
          <div style={{ textAlign: 'center', color: '#bbb', paddingTop: 40 }}>
            <div style={{ fontSize: 40 }}>🛠️</div>
            <p style={{ marginTop: 12 }}>Aucun service publié pour l'instant</p>
          </div>
        )}
        {onglet === 'galerie' && (
          <div style={{ textAlign: 'center', color: '#bbb', paddingTop: 40 }}>
            <div style={{ fontSize: 40 }}>🖼️</div>
            <p style={{ marginTop: 12 }}>Aucune réalisation pour l'instant</p>
          </div>
        )}
        {onglet === 'avis' && (
          <div style={{ textAlign: 'center', color: '#bbb', paddingTop: 40 }}>
            <div style={{ fontSize: 40 }}>⭐</div>
            <p style={{ marginTop: 12 }}>Aucun avis pour l'instant</p>
          </div>
        )}
      </div>
    </div>
  )
}
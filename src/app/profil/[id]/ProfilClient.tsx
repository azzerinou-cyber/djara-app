'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Lang = 'fr' | 'ar'
type Onglet = 'services' | 'galerie' | 'avis'

interface Profile {
  id: string
  display_name: string
  business_name: string | null
  bio: string | null
  avatar_url: string | null
  commune: string | null
  wilaya: string | null
  trust_level: number
  is_active: boolean
  is_provider: boolean
}

interface Service {
  id: string
  title: string
  description: string | null
  category: string | null
  price_min: number | null
  price_max: number | null
  status: string
  categories: { name_fr: string; icon: string | null } | null
}

interface PortfolioImage {
  id: string
  url: string
  caption: string | null
  sort_order: number
}

interface Review {
  id: string
  rating: number
  comment: string | null
  punctuality: number | null
  communication: number | null
  quality: number | null
  created_at: string
  reviewer: { display_name: string } | null
}

const t = {
  fr: {
    contacter: 'Contacter', demanderPrestation: 'Demander une prestation',
    services: 'Services', galerie: 'Galerie', avis: 'Avis',
    disponible: 'Disponible', indisponible: 'Indisponible',
    tarif: 'Tarif indicatif', verifie: 'Profil vérifié',
    retour: 'Retour', chargement: 'Chargement...', introuvable: 'Profil introuvable',
    niveauConfiance: 'Niveau de confiance',
    aucunService: 'Aucun service publié pour l\'instant',
    aucuneRealisation: 'Aucune réalisation pour l\'instant',
    aucunAvis: 'Aucun avis pour l\'instant',
    aPartirDe: 'À partir de',
    DA: 'DA',
    prendre_rdv: 'Prendre RDV',
  },
  ar: {
    contacter: 'تواصل', demanderPrestation: 'طلب خدمة',
    services: 'الخدمات', galerie: 'معرض الأعمال', avis: 'التقييمات',
    disponible: 'متاحة', indisponible: 'غير متاحة',
    tarif: 'السعر التقريبي', verifie: 'ملف موثق',
    retour: 'رجوع', chargement: '...جاري التحميل', introuvable: 'الملف غير موجود',
    niveauConfiance: 'مستوى الثقة',
    aucunService: 'لا توجد خدمات منشورة حالياً',
    aucuneRealisation: 'لا توجد أعمال منشورة حالياً',
    aucunAvis: 'لا توجد تقييمات حالياً',
    aPartirDe: 'ابتداءً من',
    DA: 'دج',
    prendre_rdv: 'حجز موعد',
  },
}

const COLORS = {
  prune: '#59364A', terracotta: '#C77D69',
  ivoire: '#FAF7F2', sauge: '#A8B5A2', anthracite: '#292929',
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#F5A623', fontSize: 14 }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

function formatPrix(min: number | null, max: number | null) {
  if (!min && !max) return null
  if (min && max) return `${min.toLocaleString()}–${max.toLocaleString()} DA`
  if (min) return `À partir de ${min.toLocaleString()} DA`
  return `Jusqu'à ${max!.toLocaleString()} DA`
}

export default function ProfilClient() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [lang, setLang] = useState<Lang>('fr')
  const [onglet, setOnglet] = useState<Onglet>('services')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchProfile = useCallback(async () => {
    if (!id) return
    setLoading(true)

    // Profil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, business_name, bio, avatar_url, commune, wilaya, trust_level, is_active, is_provider')
      .eq('id', id)
      .single()

    if (profileError || !profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setProfile(profileData)

    // Services actifs de la prestataire
    const { data: svcData } = await supabase
      .from('services')
      .select('id, title, description, category, price_min, price_max, status, categories(name_fr, icon)')
      .eq('provider_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10)

    setServices((svcData ?? []) as unknown as Service[])

    // Images portfolio
    const { data: imgData } = await supabase
      .from('portfolio_images')
      .select('id, url, caption, sort_order')
      .eq('provider_id', id)
      .order('sort_order', { ascending: true })
      .limit(24)

    setPortfolioImages((imgData ?? []) as PortfolioImage[])

    // Avis
    const { data: reviewData } = await supabase
      .from('reviews')
      .select('id, rating, comment, punctuality, communication, quality, created_at, reviewer:reviewer_id(display_name)')
      .eq('provider_id', id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (reviewData && reviewData.length > 0) {
      setReviews(reviewData as unknown as Review[])
      const avg = reviewData.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviewData.length
      setAvgRating(Math.round(avg * 10) / 10)
    }

    setLoading(false)
  }, [id])

  useEffect(() => { fetchProfile() }, [fetchProfile])

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

  const trustBadge = profile!.trust_level >= 2

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: COLORS.ivoire, fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto', paddingBottom: 32 }}>

      {/* Header gradient */}
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
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          background: profile!.avatar_url
            ? `url(${profile!.avatar_url}) center/cover`
            : `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.prune})`,
          border: '4px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>
          {!profile!.avatar_url && profile!.display_name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* Infos */}
      <div style={{ textAlign: 'center', padding: '12px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.anthracite }}>
            {profile!.display_name}
          </h1>
          {trustBadge && (
            <span style={{ background: COLORS.sauge, color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>✓</span>
          )}
        </div>

        {profile!.business_name && (
          <p style={{ color: COLORS.terracotta, fontSize: 14, fontWeight: 600, margin: '2px 0' }}>{profile!.business_name}</p>
        )}

        <p style={{ color: '#888', fontSize: 14, margin: '4px 0' }}>
          📍 {[profile!.commune, profile!.wilaya].filter(Boolean).join(', ') || 'Localisation non renseignée'}
        </p>

        {/* Note moyenne */}
        {avgRating !== null && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '6px 0' }}>
            <Stars rating={avgRating} />
            <span style={{ fontSize: 14, color: '#555', fontWeight: 600 }}>{avgRating}/5</span>
            <span style={{ fontSize: 13, color: '#999' }}>({reviews.length} avis)</span>
          </div>
        )}

        {profile!.bio && (
          <p style={{ color: COLORS.anthracite, fontSize: 14, lineHeight: 1.6, margin: '12px 0', textAlign: 'left' }}>{profile!.bio}</p>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '8px 0 16px' }}>
          {trustBadge && (
            <span style={{ background: `${COLORS.sauge}22`, color: COLORS.sauge, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
              ✓ {tx.verifie}
            </span>
          )}
          <span style={{ background: `${COLORS.prune}11`, color: COLORS.prune, borderRadius: 20, padding: '4px 12px', fontSize: 12 }}>
            {services.length} service{services.length > 1 ? 's' : ''}
          </span>
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
          <button key={o} onClick={() => setOnglet(o)} style={{
            flex: 1, background: 'none', border: 'none',
            borderBottom: onglet === o ? `2px solid ${COLORS.prune}` : '2px solid transparent',
            color: onglet === o ? COLORS.prune : '#999',
            padding: '12px 0', fontWeight: onglet === o ? 700 : 400,
            fontSize: 14, cursor: 'pointer',
          }}>
            {tx[o as keyof typeof tx]}
            {o === 'services' && services.length > 0 && (
              <span style={{ marginLeft: 4, background: COLORS.prune, color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 11 }}>
                {services.length}
              </span>
            )}
            {o === 'galerie' && portfolioImages.length > 0 && (
              <span style={{ marginLeft: 4, background: COLORS.sauge, color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 11 }}>
                {portfolioImages.length}
              </span>
            )}
            {o === 'avis' && reviews.length > 0 && (
              <span style={{ marginLeft: 4, background: COLORS.terracotta, color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 11 }}>
                {reviews.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu onglets */}
      <div style={{ padding: 20, minHeight: 200 }}>

        {/* --- SERVICES --- */}
        {onglet === 'services' && (
          services.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#bbb', paddingTop: 40 }}>
              <div style={{ fontSize: 40 }}>🛠️</div>
              <p style={{ marginTop: 12 }}>{tx.aucunService}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {services.map(svc => (
                <div key={svc.id} style={{
                  background: '#fff', borderRadius: 14, padding: 16,
                  border: '1px solid #f0ebe4', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.anthracite, flex: 1 }}>{svc.title}</h3>
                    {svc.categories && (
                      <span style={{ background: '#f5f0ee', color: COLORS.terracotta, padding: '3px 10px', borderRadius: 10, fontSize: 12, marginLeft: 8, whiteSpace: 'nowrap' }}>
                        {svc.categories.icon ? `${svc.categories.icon} ` : ''}{svc.categories.name_fr}
                      </span>
                    )}
                  </div>
                  {svc.description && (
                    <p style={{ margin: '0 0 10px', color: '#666', fontSize: 13, lineHeight: 1.5 }}>
                      {svc.description.length > 100 ? svc.description.slice(0, 100) + '…' : svc.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: COLORS.prune, fontWeight: 700, fontSize: 14 }}>
                      {formatPrix(svc.price_min, svc.price_max) ?? 'Prix à définir'}
                    </span>
                    <button style={{
                      background: COLORS.prune, color: '#fff', border: 'none',
                      borderRadius: 10, padding: '7px 14px', fontSize: 13,
                      fontWeight: 600, cursor: 'pointer',
                    }}>
                      {tx.prendre_rdv}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* --- GALERIE --- */}
        {onglet === 'galerie' && (
          portfolioImages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#bbb', paddingTop: 40 }}>
              <div style={{ fontSize: 40 }}>🖼️</div>
              <p style={{ marginTop: 12 }}>{tx.aucuneRealisation}</p>
            </div>
          ) : (
            <>
              {/* Lightbox */}
              {selectedImage && (
                <div
                  onClick={() => setSelectedImage(null)}
                  style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.88)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: 20,
                  }}
                >
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.caption ?? ''}
                    style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain' }}
                  />
                  {selectedImage.caption && (
                    <p style={{ color: '#fff', marginTop: 12, fontSize: 14, textAlign: 'center' }}>{selectedImage.caption}</p>
                  )}
                  <button
                    onClick={() => setSelectedImage(null)}
                    style={{ marginTop: 16, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 10, padding: '8px 20px', cursor: 'pointer', fontSize: 14 }}
                  >
                    ✕ Fermer
                  </button>
                </div>
              )}

              {/* Grille */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
              }}>
                {portfolioImages.map(img => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      aspectRatio: '1 / 1',
                      borderRadius: 10,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#f0ebe4',
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.caption ?? ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </>
          )
        )}

        {/* --- AVIS --- */}
        {onglet === 'avis' && (
          reviews.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#bbb', paddingTop: 40 }}>
              <div style={{ fontSize: 40 }}>⭐</div>
              <p style={{ marginTop: 12 }}>{tx.aucunAvis}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Synthèse */}
              {avgRating !== null && (
                <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #f0ebe4', textAlign: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: 40, fontWeight: 800, color: COLORS.prune }}>{avgRating}</div>
                  <Stars rating={avgRating} />
                  <p style={{ margin: '6px 0 0', color: '#888', fontSize: 13 }}>{reviews.length} avis vérifiés</p>
                </div>
              )}
              {reviews.map(rev => (
                <div key={rev.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #f0ebe4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.anthracite }}>
                      {rev.reviewer?.display_name ?? 'Utilisatrice anonyme'}
                    </span>
                    <Stars rating={rev.rating} />
                  </div>
                  {rev.comment && (
                    <p style={{ margin: 0, color: '#555', fontSize: 14, lineHeight: 1.5 }}>{rev.comment}</p>
                  )}
                  <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                    {rev.punctuality != null && (
                      <span style={{ fontSize: 12, color: '#888' }}>⏱ Ponctualité {rev.punctuality}/5</span>
                    )}
                    {rev.communication != null && (
                      <span style={{ fontSize: 12, color: '#888' }}>💬 Communication {rev.communication}/5</span>
                    )}
                    {rev.quality != null && (
                      <span style={{ fontSize: 12, color: '#888' }}>✨ Qualité {rev.quality}/5</span>
                    )}
                  </div>
                  <p style={{ margin: '8px 0 0', color: '#bbb', fontSize: 12 }}>
                    {new Date(rev.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

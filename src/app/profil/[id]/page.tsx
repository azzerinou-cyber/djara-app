'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams } from 'next/navigation'

type Lang = 'fr' | 'ar'
type Onglet = 'services' | 'galerie' | 'avis'

const mockProfiles: Record<string, {
  nom: string
  metier: string
  commune: string
  wilaya: string
  bio: string
  note: number
  avis: number
  trustLevel: number
  disponible: boolean
  tarif: string
  services: string[]
}> = {
  '1': {
    nom: 'Fatima Z.',
    metier: 'Coiffeuse & Maquilleuse',
    commune: 'Hydra',
    wilaya: 'Alger',
    bio: 'Spécialiste coiffure traditionnelle et moderne. 8 ans d\'expérience. Je me déplace à domicile.',
    note: 4.8,
    avis: 47,
    trustLevel: 3,
    disponible: true,
    tarif: 'À partir de 1 500 DA',
    services: ['Coiffure mariée', 'Maquillage événementiel', 'Henné', 'Soins capillaires'],
  },
  '2': {
    nom: 'Amina B.',
    metier: 'Cours de soutien scolaire',
    commune: 'Bab Ezzouar',
    wilaya: 'Alger',
    bio: 'Professeure certifiée, spécialisée mathématiques et sciences pour collège et lycée.',
    note: 4.9,
    avis: 32,
    trustLevel: 2,
    disponible: true,
    tarif: '800 DA / heure',
    services: ['Mathématiques', 'Physique-chimie', 'Sciences naturelles', 'Préparation BAC'],
  },
}

const t = {
  fr: {
    contacter: 'Contacter',
    demanderPrestation: 'Demander une prestation',
    services: 'Services',
    galerie: 'Galerie',
    avis: 'Avis',
    disponible: 'Disponible',
    indisponible: 'Indisponible',
    tarif: 'Tarif indicatif',
    verifie: 'Profil vérifié',
    note: 'Note',
    retour: '← Retour',
  },
  ar: {
    contacter: 'تواصل',
    demanderPrestation: 'طلب خدمة',
    services: 'الخدمات',
    galerie: 'معرض الأعمال',
    avis: 'التقييمات',
    disponible: 'متاحة',
    indisponible: 'غير متاحة',
    tarif: 'السعر التقريبي',
    verifie: 'ملف موثق',
    note: 'التقييم',
    retour: 'رجوع →',
  },
}

const COLORS = {
  prune: '#59364A',
  terra: '#C77D69',
  ivoire: '#FAF7F2',
  sauge: '#A8B5A2',
  anthracite: '#292929',
}

export default function ProfilDynamiquePage() {
  const params = useParams()
  const id = params?.id as string
  const profil = mockProfiles[id] || mockProfiles['1']

  const [lang, setLang] = useState<Lang>('fr')
  const [onglet, setOnglet] = useState<Onglet>('services')
  const isRTL = lang === 'ar'
  const txt = t[lang]

  const stars = (note: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(note) ? '#C77D69' : '#ddd', fontSize: '18px' }}>★</span>
    ))

  return (
    <main style={{
      background: COLORS.ivoire,
      minHeight: '100vh',
      direction: isRTL ? 'rtl' : 'ltr',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{ background: COLORS.prune, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/rechercher" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px' }}>
          {txt.retour}
        </a>
        <button
          onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
          style={{
            background: 'rgba(255,255,255,0.2)', color: '#fff',
            border: 'none', borderRadius: '8px', padding: '6px 12px',
            fontSize: '13px', cursor: 'pointer',
          }}
        >
          {lang === 'fr' ? 'العربية' : 'Français'}
        </button>
      </div>

      {/* Carte profil */}
      <div style={{
        background: '#fff',
        margin: '0 0 12px 0',
        padding: '28px 20px 20px',
        borderBottom: '1px solid #f0ebe4',
      }}>
        {/* Avatar + infos */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${COLORS.prune}, ${COLORS.terra})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', flexShrink: 0,
          }}>
            👩
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: COLORS.anthracite, marginBottom: '4px' }}>
              {profil.nom}
            </h1>
            <p style={{ color: COLORS.terra, fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
              {profil.metier}
            </p>
            <p style={{ color: '#888', fontSize: '13px' }}>
              📍 {profil.commune}, {profil.wilaya}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <span style={{
            background: profil.disponible ? '#f0f7ee' : '#fff0f0',
            color: profil.disponible ? '#4a8a3a' : '#c0392b',
            padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
          }}>
            {profil.disponible ? `✓ ${txt.disponible}` : `✗ ${txt.indisponible}`}
          </span>
          {profil.trustLevel >= 2 && (
            <span style={{
              background: '#f5f0ee', color: COLORS.prune,
              padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
            }}>
              🛡️ {txt.verifie}
            </span>
          )}
        </div>

        {/* Note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div>{stars(profil.note)}</div>
          <span style={{ fontWeight: 700, color: COLORS.anthracite }}>{profil.note}</span>
          <span style={{ color: '#888', fontSize: '13px' }}>({profil.avis} {txt.avis})</span>
        </div>

        {/* Tarif */}
        <div style={{
          background: COLORS.ivoire, borderRadius: '10px', padding: '10px 14px',
          marginBottom: '16px', fontSize: '14px',
        }}>
          <span style={{ color: '#888' }}>{txt.tarif} : </span>
          <span style={{ color: COLORS.prune, fontWeight: 700 }}>{profil.tarif}</span>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            flex: 1, padding: '13px', background: COLORS.prune,
            color: '#fff', border: 'none', borderRadius: '12px',
            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
          }}>
            {txt.demanderPrestation}
          </button>
          <button style={{
            padding: '13px 20px', background: '#fff',
            color: COLORS.prune, border: `2px solid ${COLORS.prune}`,
            borderRadius: '12px', fontWeight: 700, fontSize: '15px', cursor: 'pointer',
          }}>
            {txt.contacter}
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0ebe4' }}>
        <div style={{ display: 'flex' }}>
          {(['services', 'galerie', 'avis'] as Onglet[]).map(tab => (
            <button
              key={tab}
              onClick={() => setOnglet(tab)}
              style={{
                flex: 1, padding: '14px', border: 'none', background: 'none',
                cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                color: onglet === tab ? COLORS.prune : '#888',
                borderBottom: onglet === tab ? `3px solid ${COLORS.prune}` : '3px solid transparent',
              }}
            >
              {txt[tab as keyof typeof txt]}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu onglet */}
      <div style={{ padding: '20px' }}>
        {onglet === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
              {profil.bio}
            </p>
            {profil.services.map((s, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: '12px', padding: '14px 16px',
                border: '1px solid #f0ebe4', display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <span style={{ fontSize: '20px' }}>✦</span>
                <span style={{ color: COLORS.anthracite, fontSize: '15px' }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {onglet === 'galerie' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{
                aspectRatio: '1', background: `hsl(${320 + i * 15}, 30%, ${85 + i * 2}%)`,
                borderRadius: '10px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '28px',
              }}>
                {['🌸', '💄', '✂️', '💅', '🌺', '🎨'][i]}
              </div>
            ))}
          </div>
        )}

        {onglet === 'avis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { nom: 'Nadia M.', note: 5, texte: 'Excellent travail, très professionnelle et ponctuelle.', date: 'Oct 2026' },
              { nom: 'Sara K.', note: 5, texte: 'Je recommande vivement, résultat magnifique !', date: 'Sep 2026' },
              { nom: 'Imane L.', note: 4, texte: 'Très satisfaite, je reviendrai.', date: 'Sep 2026' },
            ].map((avis, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: '14px', padding: '16px',
                border: '1px solid #f0ebe4',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: COLORS.anthracite }}>{avis.nom}</span>
                  <span style={{ color: '#888', fontSize: '12px' }}>{avis.date}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>{stars(avis.note)}</div>
                <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5' }}>{avis.texte}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
'use client'

import { useState, type CSSProperties, type ChangeEvent, type FormEvent, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

/* ─────────────────────────────────────────
   SQL à exécuter dans Supabase (une fois) :

   create table if not exists devis (
     id           uuid primary key default gen_random_uuid(),
     provider_id  uuid not null references profiles(id) on delete cascade,
     client_id    uuid references profiles(id) on delete set null,
     client_name  text,
     service_title text not null,
     description  text,
     price_amount numeric(10,2),
     currency     text not null default 'DZD',
     duration     text,
     valid_until  date,
     notes        text,
     status       text not null default 'sent',  -- sent | accepted | refused | expired
     created_at   timestamptz not null default now(),
     updated_at   timestamptz not null default now()
   );

   alter table devis enable row level security;
   create policy "provider sees own devis"   on devis for select using (provider_id = auth.uid());
   create policy "provider creates devis"    on devis for insert with check (provider_id = auth.uid());
   create policy "provider updates own devis" on devis for update using (provider_id = auth.uid());
   create policy "client sees received devis" on devis for select using (client_id  = auth.uid());
───────────────────────────────────────── */

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar',
  'Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger',
  'Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma',
  'Constantine','Médéa','Mostaganem','M\'Sila','Mascara','Ouargla','Oran','El Bayadh',
  'Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt',
  'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma',
  'Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar',
  'Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet',
  'El M\'Ghair','El Meniaa',
]

function DevisNouveauContent() {
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()

  const [form, setForm] = useState({
    client_name:   searchParams.get('client') ?? '',
    service_title: searchParams.get('service') ?? '',
    description:   '',
    price_amount:  '',
    duration:      '',
    valid_until:   '',
    notes:         '',
  })
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState('')
  const [success, setSuccess]   = useState(false)
  const [devisId, setDevisId]   = useState('')

  function handle(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) { setError('Vous devez être connectée.'); return }
    if (!form.service_title.trim()) { setError('Le titre du service est obligatoire.'); return }
    if (!form.price_amount || isNaN(Number(form.price_amount)) || Number(form.price_amount) < 0) {
      setError('Veuillez saisir un montant valide.'); return
    }

    setLoading(true)
    setError('')

    const { data, error: dbErr } = await supabase
      .from('devis')
      .insert({
        provider_id:   user.id,
        client_name:   form.client_name.trim() || null,
        service_title: form.service_title.trim(),
        description:   form.description.trim() || null,
        price_amount:  Number(form.price_amount),
        currency:      'DZD',
        duration:      form.duration.trim() || null,
        valid_until:   form.valid_until || null,
        notes:         form.notes.trim() || null,
        status:        'sent',
      })
      .select('id')
      .single()

    if (dbErr) {
      setError("Impossible de créer le devis : " + dbErr.message)
      setLoading(false)
      return
    }

    setDevisId(data?.id ?? '')
    setSuccess(true)
    setLoading(false)
  }

  /* ── styles communs ── */
  const inp: CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e8ddd6', borderRadius: 10,
    fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box',
    background: '#fff', color: '#292929', outline: 'none',
    marginBottom: 16,
  }
  const lbl: CSSProperties = {
    display: 'block', marginBottom: 6, fontWeight: 600,
    color: '#292929', fontSize: 13,
  }
  const section: CSSProperties = {
    background: '#fff', borderRadius: 14,
    border: '1px solid #f0ebe4', padding: '20px',
    marginBottom: 16,
    boxShadow: '0 2px 8px rgba(89,54,74,0.05)',
  }

  /* ── Page succès ── */
  if (success) {
    return (
      <main style={{ padding: '48px 24px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h1 style={{ color: '#59364A', fontSize: 22, marginBottom: 8 }}>Devis envoyé !</h1>
        <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          Votre devis a été créé avec succès.
          {form.client_name ? ` ${form.client_name} pourra le consulter ` : ' '}
          dès que vous lui partagez le lien.
        </p>

        {/* Carte récap */}
        <div style={{
          background: '#fdf6f9', border: '1.5px solid #e8cede', borderRadius: 14,
          padding: '20px', marginBottom: 28, textAlign: 'left',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#59364A', margin: 0 }}>{form.service_title}</p>
              {form.client_name && <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0' }}>Pour : {form.client_name}</p>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 800, fontSize: 20, color: '#C77D69', margin: 0 }}>
                {Number(form.price_amount).toLocaleString('fr-DZ')} DA
              </p>
            </div>
          </div>
          {form.valid_until && (
            <p style={{ color: '#aaa', fontSize: 12, margin: 0 }}>
              ⏳ Valable jusqu&apos;au {new Date(form.valid_until).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Lien à partager */}
        {devisId && (
          <div style={{
            background: '#fff', border: '1.5px dashed #e8ddd6', borderRadius: 10,
            padding: '12px 14px', marginBottom: 24,
          }}>
            <p style={{ color: '#888', fontSize: 12, margin: '0 0 6px' }}>🔗 Lien à partager avec votre cliente :</p>
            <p style={{
              fontFamily: 'monospace', fontSize: 12, color: '#59364A',
              wordBreak: 'break-all', margin: 0,
            }}>
              {typeof window !== 'undefined' ? `${window.location.origin}/devis/${devisId}` : `/devis/${devisId}`}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="/mon-profil" style={{
            display: 'block', padding: '14px 24px', background: '#59364A',
            color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 15,
            textDecoration: 'none', textAlign: 'center',
          }}>
            Retour à mon profil
          </a>
          <button
            onClick={() => { setSuccess(false); setForm({ client_name: '', service_title: '', description: '', price_amount: '', duration: '', valid_until: '', notes: '' }) }}
            style={{
              padding: '14px 24px', background: '#fff',
              color: '#59364A', border: '1.5px solid #59364A',
              borderRadius: 12, fontWeight: 600, fontSize: 15, cursor: 'pointer',
            }}
          >
            Créer un autre devis
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ padding: '28px 20px 80px', maxWidth: 520, margin: '0 auto' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <button
          onClick={() => window.history.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 22, padding: 0 }}
          aria-label="Retour"
        >←</button>
        <div>
          <h1 style={{ color: '#59364A', fontSize: 20, margin: 0 }}>📄 Créer un devis</h1>
          <p style={{ color: '#888', fontSize: 13, margin: '2px 0 0' }}>
            {profile?.display_name ? `Prestataire : ${profile.display_name}` : 'Profil professionnel DJARA'}
          </p>
        </div>
      </div>

      {/* Badge PRO */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 20, marginBottom: 20,
        background: '#FFF3EE', color: '#C77D69', fontSize: 12, fontWeight: 700,
      }}>
        💼 Fonctionnalité Professionnelle
      </div>

      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, padding: 12, marginBottom: 16, color: '#c0392b', fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Section 1 — Service */}
        <div style={section}>
          <h2 style={{ color: '#59364A', fontSize: 15, fontWeight: 700, margin: '0 0 16px', display: 'flex', gap: 8 }}>
            <span>📋</span> Service proposé
          </h2>

          <label style={lbl}>Titre du service *</label>
          <input
            name="service_title" value={form.service_title} onChange={handle} required
            placeholder="Ex : Coiffure domicile — Brushing + soin"
            style={inp}
          />

          <label style={lbl}>Description détaillée</label>
          <textarea
            name="description" value={form.description} onChange={handle} rows={3}
            placeholder="Décrivez précisément la prestation : ce qui est inclus, conditions, matériel fourni…"
            style={{ ...inp, resize: 'vertical' }}
          />

          <label style={lbl}>Durée estimée</label>
          <input
            name="duration" value={form.duration} onChange={handle}
            placeholder="Ex : 2h, 1 journée, 3 séances"
            style={inp}
          />
        </div>

        {/* Section 2 — Tarif */}
        <div style={section}>
          <h2 style={{ color: '#59364A', fontSize: 15, fontWeight: 700, margin: '0 0 16px', display: 'flex', gap: 8 }}>
            <span>💰</span> Tarif
          </h2>

          <label style={lbl}>Montant (DA) *</label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              name="price_amount" type="number" min="0" step="100"
              value={form.price_amount} onChange={handle} required
              placeholder="Ex : 3500"
              style={{ ...inp, marginBottom: 0, paddingRight: 64 }}
            />
            <span style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              color: '#aaa', fontSize: 13, fontWeight: 600, pointerEvents: 'none',
            }}>DA</span>
          </div>

          <label style={lbl}>Devis valable jusqu&apos;au</label>
          <input
            name="valid_until" type="date" value={form.valid_until} onChange={handle}
            min={new Date().toISOString().split('T')[0]}
            style={inp}
          />
        </div>

        {/* Section 3 — Cliente */}
        <div style={section}>
          <h2 style={{ color: '#59364A', fontSize: 15, fontWeight: 700, margin: '0 0 16px', display: 'flex', gap: 8 }}>
            <span>👤</span> Destinataire
          </h2>

          <label style={lbl}>Nom ou prénom de la cliente</label>
          <input
            name="client_name" value={form.client_name} onChange={handle}
            placeholder="Ex : Nadia (optionnel)"
            style={inp}
          />

          <label style={lbl}>Notes internes (non visibles par la cliente)</label>
          <textarea
            name="notes" value={form.notes} onChange={handle} rows={2}
            placeholder="Remarques, conditions spéciales, acompte demandé…"
            style={{ ...inp, resize: 'vertical', marginBottom: 0 }}
          />
        </div>

        {/* Récap */}
        {form.price_amount && !isNaN(Number(form.price_amount)) && (
          <div style={{
            background: '#fdf6f9', border: '1.5px solid #e8cede', borderRadius: 12,
            padding: '14px 16px', marginBottom: 20,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ fontWeight: 700, color: '#59364A', fontSize: 14, margin: 0 }}>
                {form.service_title || 'Prestation DJARA'}
              </p>
              {form.duration && <p style={{ color: '#aaa', fontSize: 12, margin: '3px 0 0' }}>⏱ {form.duration}</p>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 800, fontSize: 22, color: '#C77D69', margin: 0 }}>
                {Number(form.price_amount).toLocaleString('fr-DZ')}
              </p>
              <p style={{ color: '#aaa', fontSize: 11, margin: 0 }}>Dinars algériens</p>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '16px', fontSize: 16, fontWeight: 700,
          background: loading ? '#9b7a8a' : '#59364A',
          color: '#fff', border: 'none', borderRadius: 12,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 14px rgba(89,54,74,0.25)',
        }}>
          {loading ? 'Création du devis…' : '📄 Créer et envoyer le devis'}
        </button>

        <p style={{ textAlign: 'center', color: '#ccc', fontSize: 11, marginTop: 12 }}>
          Le devis sera accessible via un lien sécurisé que vous pourrez partager.
        </p>

      </form>
    </main>
  )
}

export default function DevisNouveauPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
        Chargement…
      </main>
    }>
      <DevisNouveauContent />
    </Suspense>
  )
}

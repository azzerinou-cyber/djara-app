'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { checkAdminAccess, can, type AdminRole } from '@/lib/admin'

const COLORS = {
  prune:      '#59364A',
  terracotta: '#C77D69',
  ivoire:     '#FAF7F2',
  sauge:      '#A8B5A2',
  anthracite: '#292929',
}

interface Category {
  id:          string
  name_fr:     string
  name_ar:     string
  icon:        string
  slug:        string
  is_active:   boolean
  sort_order:  number
  created_at:  string
  service_count?: number
}

const EMOJI_OPTIONS = ['🍳', '✂️', '👗', '🎂', '🏡', '💄', '💅', '💇', '🌿', '📚', '🎓', '💻', '📱', '🎨', '🧵', '💐', '🎉', '📷', '✏️', '🧹', '🛁', '📝', '🎪', '🌟', '🤝', '💰', '🛒', '🎭', '🧶', '🪡']

interface FormState {
  name_fr:    string
  name_ar:    string
  icon:       string
  slug:       string
  sort_order: number
}

const EMPTY_FORM: FormState = { name_fr: '', name_ar: '', icon: '🌟', slug: '', sort_order: 0 }

function slugify(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [role,       setRole]       = useState<AdminRole | null>(null)
  const [modal,      setModal]      = useState<'create' | 'edit' | null>(null)
  const [editing,    setEditing]    = useState<Category | null>(null)
  const [form,       setForm]       = useState<FormState>(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    checkAdminAccess().then(({ role: r }) => setRole(r))
  }, [])

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!err && data) setCategories(data as Category[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setError('')
    setModal('create')
  }

  function openEdit(cat: Category) {
    setForm({ name_fr: cat.name_fr, name_ar: cat.name_ar, icon: cat.icon, slug: cat.slug, sort_order: cat.sort_order })
    setEditing(cat)
    setError('')
    setModal('edit')
  }

  async function handleSave() {
    if (!form.name_fr.trim() || !form.icon || !form.slug.trim()) {
      setError('Nom (FR), icône et slug sont requis.')
      return
    }
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()

    if (modal === 'create') {
      const { error: err } = await supabase.from('categories').insert({
        name_fr:    form.name_fr.trim(),
        name_ar:    form.name_ar.trim() || form.name_fr.trim(),
        icon:       form.icon,
        slug:       form.slug.trim(),
        sort_order: form.sort_order,
        is_active:  true,
      })
      if (err) { setError(err.message); setSaving(false); return }
      await supabase.from('admin_audit_log').insert({ admin_id: user?.id, action: 'create_category', target_type: 'category', details: { name_fr: form.name_fr } })
    } else if (editing) {
      const { error: err } = await supabase.from('categories').update({
        name_fr:    form.name_fr.trim(),
        name_ar:    form.name_ar.trim() || form.name_fr.trim(),
        icon:       form.icon,
        slug:       form.slug.trim(),
        sort_order: form.sort_order,
      }).eq('id', editing.id)
      if (err) { setError(err.message); setSaving(false); return }
      await supabase.from('admin_audit_log').insert({ admin_id: user?.id, action: 'update_category', target_type: 'category', target_id: editing.id, details: { name_fr: form.name_fr } })
    }

    await fetchCategories()
    setModal(null)
    setSaving(false)
  }

  async function toggleActive(cat: Category) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    await supabase.from('admin_audit_log').insert({ admin_id: user?.id, action: cat.is_active ? 'deactivate_category' : 'activate_category', target_type: 'category', target_id: cat.id })
    await fetchCategories()
  }

  const canManage = can(role, 'canManageCategories')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.anthracite }}>Catégories</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>
            {canManage ? 'Gestion des catégories de services' : '🔒 Lecture seule — accès Super Admin requis pour modifier'}
          </p>
        </div>
        {canManage && (
          <button onClick={openCreate} style={{
            padding: '10px 20px', borderRadius: 12, border: 'none',
            background: COLORS.prune, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14,
          }}>
            + Nouvelle catégorie
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${COLORS.prune}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {categories.map(cat => (
            <div key={cat.id} style={{
              background: '#fff', borderRadius: 16, padding: '18px 20px',
              border: `1px solid ${cat.is_active ? '#f0ebe4' : '#fecaca'}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              opacity: cat.is_active ? 1 : 0.65,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 28 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.anthracite }}>{cat.name_fr}</div>
                    {cat.name_ar && <div style={{ fontSize: 13, color: '#888', direction: 'rtl' }}>{cat.name_ar}</div>}
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>/{cat.slug}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <span style={{
                    background: cat.is_active ? '#D1FAE5' : '#FEE2E2',
                    color:      cat.is_active ? '#065F46' : '#991B1B',
                    borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 600,
                  }}>
                    {cat.is_active ? '✅ Active' : '❌ Inactive'}
                  </span>
                  <span style={{ fontSize: 11, color: '#bbb' }}>Ordre : {cat.sort_order}</span>
                </div>
              </div>

              {canManage && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button onClick={() => openEdit(cat)} style={{
                    flex: 1, padding: '7px', borderRadius: 10, border: `1.5px solid ${COLORS.prune}`,
                    background: '#fff', color: COLORS.prune, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}>
                    ✏️ Modifier
                  </button>
                  <button onClick={() => toggleActive(cat)} style={{
                    flex: 1, padding: '7px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: cat.is_active ? '#FEE2E2' : '#D1FAE5',
                    color:      cat.is_active ? '#991B1B' : '#065F46',
                  }}>
                    {cat.is_active ? '🔕 Désactiver' : '✅ Activer'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal création / édition */}
      {modal && (
        <div onClick={e => { if (e.target === e.currentTarget) setModal(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: 480, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: COLORS.anthracite }}>
              {modal === 'create' ? '➕ Nouvelle catégorie' : '✏️ Modifier la catégorie'}
            </h2>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Icône */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8 }}>Icône</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EMOJI_OPTIONS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, icon: e }))} style={{
                    width: 38, height: 38, fontSize: 20, borderRadius: 8, cursor: 'pointer',
                    border: form.icon === e ? `2px solid ${COLORS.prune}` : '1.5px solid #e0d8d0',
                    background: form.icon === e ? `${COLORS.ivoire}` : '#fff',
                  }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Nom FR */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>Nom (Français) *</label>
              <input
                value={form.name_fr}
                onChange={e => {
                  const v = e.target.value
                  setForm(f => ({ ...f, name_fr: v, slug: modal === 'create' ? slugify(v) : f.slug }))
                }}
                placeholder="ex : Beauté et bien-être"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0d8d0', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>

            {/* Nom AR */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>Nom (Arabe)</label>
              <input
                value={form.name_ar}
                onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
                placeholder="الجمال والعافية"
                dir="rtl"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0d8d0', fontSize: 14, boxSizing: 'border-box', textAlign: 'right' }}
              />
            </div>

            {/* Slug */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>Slug (URL) *</label>
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                placeholder="beaute-bien-etre"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0d8d0', fontSize: 14, fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>

            {/* Ordre */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>Ordre d'affichage</label>
              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                style={{ width: 100, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e0d8d0', fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1.5px solid #e0d8d0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 2, padding: 12, borderRadius: 12, border: 'none',
                background: COLORS.prune, color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Enregistrement…' : modal === 'create' ? 'Créer la catégorie' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

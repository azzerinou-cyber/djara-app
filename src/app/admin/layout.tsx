'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { checkAdminAccess, type AdminRole } from '@/lib/admin'

const COLORS = {
  prune:      '#59364A',
  terracotta: '#C77D69',
  ivoire:     '#FAF7F2',
  sauge:      '#A8B5A2',
  anthracite: '#292929',
}

const NAV_ITEMS = [
  { href: '/admin',               label: 'Vue d\'ensemble', icon: '📊' },
  { href: '/admin/utilisatrices', label: 'Utilisatrices',   icon: '👥' },
  { href: '/admin/signalements',  label: 'Signalements',    icon: '🚩' },
  { href: '/admin/categories',    label: 'Catégories',      icon: '🗂️'  },
  { href: '/admin/reservations',  label: 'Réservations',    icon: '📅' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [role,    setRole]    = useState<AdminRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess().then(({ allowed, role: r }) => {
      if (!allowed) {
        router.replace('/')
      } else {
        setRole(r)
        setLoading(false)
      }
    })
  }, [router])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: COLORS.ivoire, fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${COLORS.prune}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: COLORS.prune }}>Vérification des accès...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.ivoire, fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: COLORS.prune, color: '#fff',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>DJARA</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Administration</div>
          <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 10px', fontSize: 11, display: 'inline-block' }}>
            {role === 'super_admin' ? '👑 Super Admin' : role === 'moderator' ? '🛡️ Modératrice' : '🎧 Support'}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                fontWeight: active ? 600 : 400, fontSize: 14,
                textDecoration: 'none', transition: 'all 0.15s ease',
              }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none' }}>
            ← Retour à l'app
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 240, flex: 1, padding: '32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}

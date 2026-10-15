'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Lang = 'fr' | 'ar';

interface BottomNavProps {
  lang?: Lang;
}

export default function BottomNav({ lang = 'fr' }: BottomNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = [
    {
      href: '/',
      icon: '🏠',
      label: lang === 'fr' ? 'Accueil' : 'الرئيسية',
    },
    {
      href: '/rechercher',
      icon: '🔍',
      label: lang === 'fr' ? 'Rechercher' : 'بحث',
    },
    {
      href: user ? '/publier' : '/connexion',
      icon: '➕',
      label: lang === 'fr' ? 'Publier' : 'نشر',
    },
    {
      href: user ? '/messages' : '/connexion',
      icon: '💬',
      label: lang === 'fr' ? 'Messages' : 'رسائل',
    },
    {
      href: user ? '/mon-profil' : '/connexion',
      icon: '👤',
      label: lang === 'fr' ? 'Profil' : 'ملفي',
    },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #f0e8e0',
        display: 'flex',
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(89,54,74,0.08)',
      }}
    >
      {items.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              padding: '10px 0 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              background: isActive ? '#fdf6f9' : 'none',
              borderTop: isActive ? '2px solid #59364A' : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span
              style={{
                fontSize: 10,
                color: isActive ? '#59364A' : '#bbb',
                fontWeight: isActive ? 700 : 400,
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

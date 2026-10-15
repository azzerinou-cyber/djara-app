import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes qui nécessitent une authentification
const PROTECTED_ROUTES = ['/publier', '/messages', '/mon-profil']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier si la route est protégée
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Créer un client Supabase compatible SSR (lit/écrit les cookies)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Vérifier la session
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/connexion', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/publier/:path*',
    '/messages/:path*',
    '/mon-profil/:path*',
  ],
}

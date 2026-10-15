// Next.js 16 : `middleware.ts` est déprécié et renommé `proxy.ts` (même fonctionnement).
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Pages réservées aux utilisatrices connectées
const PROTECTED = ['/mon-profil', '/publier', '/messages', '/inscription/profil']
// Pages inutiles une fois connectée
const AUTH_ONLY_GUESTS = ['/connexion', '/auth/inscription']

const matches = (pathname: string, routes: string[]) =>
  routes.some(route => pathname === route || pathname.startsWith(route + '/'))

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
        },
      },
    }
  )

  // getUser() valide le jeton auprès de Supabase et rafraîchit la session si besoin
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname, search } = request.nextUrl

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url))
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie))
    return redirect
  }

  if (!user && matches(pathname, PROTECTED)) {
    return redirectTo(`/connexion?redirect=${encodeURIComponent(pathname + search)}`)
  }

  if (user && matches(pathname, AUTH_ONLY_GUESTS)) {
    return redirectTo('/')
  }

  return response
}

export const config = {
  matcher: [
    // Tout sauf les fichiers statiques, l'optimisation d'images et les assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

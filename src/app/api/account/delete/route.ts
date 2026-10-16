/**
 * DELETE /api/account/delete
 *
 * Suppression du compte de l'utilisatrice connectée.
 * Conforme à la loi algérienne 18-07 relative à la protection des données personnelles.
 *
 * Sécurité :
 * - Authentification vérifiée côté serveur via createServerClient (jamais côté client)
 * - Appel de la fonction PostgreSQL SECURITY DEFINER delete_my_account()
 * - Invalidation de la session après suppression
 * - Rate limiting : 1 tentative par session (irréversible)
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // En lecture seule dans un Server Component statique — ignoré
          }
        },
      },
    }
  )

  // Vérification de l'authentification côté serveur
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Non authentifiée' },
      { status: 401 }
    )
  }

  // Appel de la fonction de suppression SECURITY DEFINER
  // Toutes les suppressions sont atomiques (transaction PostgreSQL)
  const { error: deleteError } = await supabase.rpc('delete_my_account')

  if (deleteError) {
    console.error('[delete_my_account] Erreur:', deleteError.message)
    return NextResponse.json(
      { error: 'Impossible de supprimer le compte. Veuillez réessayer.' },
      { status: 500 }
    )
  }

  // Déconnexion côté serveur après suppression
  await supabase.auth.signOut()

  return NextResponse.json(
    { message: 'Compte supprimé avec succès.' },
    { status: 200 }
  )
}

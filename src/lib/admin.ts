/**
 * Utilitaires admin — vérification du rôle côté client.
 * La vérification d'autorisation réelle est faite côté serveur via RLS.
 */
import { supabase } from '@/lib/supabase'

export type AdminRole = 'super_admin' | 'moderator' | 'support'

export interface AdminUser {
  user_id: string
  role: AdminRole
}

/** Retourne le rôle admin de l'utilisateur courant, ou null s'il n'est pas admin. */
export async function getAdminRole(): Promise<AdminRole | null> {
  const { data, error } = await supabase.rpc('get_admin_role')
  if (error || !data) return null
  return data as AdminRole
}

/** Vérifie si l'utilisateur courant peut accéder au dashboard admin. */
export async function checkAdminAccess(): Promise<{ allowed: boolean; role: AdminRole | null }> {
  const role = await getAdminRole()
  return { allowed: role !== null, role }
}

/** Permissions par rôle */
export const PERMISSIONS = {
  super_admin: {
    canManageAdmins:     true,
    canManageCategories: true,
    canSuspendUsers:     true,
    canHandleReports:    true,
    canViewStats:        true,
  },
  moderator: {
    canManageAdmins:     false,
    canManageCategories: false,
    canSuspendUsers:     true,
    canHandleReports:    true,
    canViewStats:        true,
  },
  support: {
    canManageAdmins:     false,
    canManageCategories: false,
    canSuspendUsers:     false,
    canHandleReports:    true,
    canViewStats:        true,
  },
} as const

export function can(role: AdminRole | null, permission: keyof typeof PERMISSIONS.super_admin): boolean {
  if (!role) return false
  return PERMISSIONS[role][permission]
}

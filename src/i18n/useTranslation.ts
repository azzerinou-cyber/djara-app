/**
 * DJARA — Hook useTranslation
 *
 * Usage dans un composant :
 *
 *   const { lang, setLang, tx, isRTL, dir } = useTranslation()
 *
 *   // Accès aux traductions par namespace :
 *   tx.common.actions.enregistrer  // → 'Enregistrer' | 'حفظ'
 *   tx.auth.connexion.titre        // → 'Connexion' | 'تسجيل الدخول'
 *
 *   // Attribut dir pour le HTML :
 *   <div dir={dir}>
 *
 * La langue est persistée dans localStorage sous la clé 'djara_lang'.
 * Par défaut : 'fr'.
 */

import { useState, useCallback } from 'react'
import { Lang, isRTL as checkRTL, translations } from './translations'

const STORAGE_KEY = 'djara_lang'
const DEFAULT_LANG: Lang = 'fr'

function getSavedLang(): Lang {
  if (typeof window === 'undefined') return DEFAULT_LANG
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'fr' || saved === 'ar') return saved
  } catch {
    // localStorage peut être bloqué (mode privé, permissions)
  }
  return DEFAULT_LANG
}

/**
 * Hook principal — donne accès aux traductions et à la gestion de la langue.
 *
 * @param initialLang - Langue initiale optionnelle (ex: depuis un cookie SSR)
 */
export function useTranslation(initialLang?: Lang) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? getSavedLang())

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    try {
      localStorage.setItem(STORAGE_KEY, newLang)
    } catch {
      // Silencieux
    }
  }, [])

  const isRTL = checkRTL(lang)
  const dir = isRTL ? 'rtl' : 'ltr'

  /**
   * Résout une entrée bilingue en chaîne de caractères pour la langue courante.
   * Permet d'utiliser des chaînes brutes dans les rares cas où c'est nécessaire.
   *
   * @example
   *   resolve({ fr: 'Bonjour', ar: 'مرحبا' }) // → 'Bonjour' en français
   */
  const resolve = useCallback(
    (entry: Record<Lang, string>): string => entry[lang],
    [lang]
  )

  /**
   * Proxy des traductions qui résout automatiquement les entrées bilingues
   * pour la langue courante.
   *
   * Accès direct : tx.common.actions.enregistrer → 'Enregistrer'
   */
  const tx = createProxy(translations, lang)

  return {
    lang,
    setLang,
    isRTL,
    dir,
    resolve,
    tx,
  }
}

/**
 * Crée un proxy récursif qui résout automatiquement les entrées bilingues
 * { fr: string, ar: string } en string pour la langue donnée.
 *
 * Cela permet d'écrire :
 *   tx.common.actions.enregistrer  // string directement
 * plutôt que :
 *   translations.common.actions.enregistrer[lang]
 */
function createProxy<T extends object>(obj: T, lang: Lang): ResolvedTranslations<T> {
  return new Proxy(obj, {
    get(target, prop) {
      const value = (target as Record<string | symbol, unknown>)[prop]
      if (value === null || value === undefined) return value
      // Entrée bilingue : { fr: string, ar: string }
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        'fr' in (value as object) &&
        'ar' in (value as object) &&
        typeof (value as Record<string, unknown>).fr === 'string'
      ) {
        return (value as Record<Lang, string>)[lang]
      }
      // Objet imbriqué → proxy récursif
      if (typeof value === 'object' && !Array.isArray(value)) {
        return createProxy(value as object, lang)
      }
      return value
    },
  }) as ResolvedTranslations<T>
}

/**
 * Type utilitaire : transforme récursivement { fr: string, ar: string } → string
 * pour permettre l'autocomplétion TypeScript correcte.
 */
type ResolvedTranslations<T> = {
  [K in keyof T]: T[K] extends Record<Lang, string>
    ? string
    : T[K] extends object
    ? ResolvedTranslations<T[K]>
    : T[K]
}

/**
 * Version simple sans hook — pour les cas hors composant React (Server Components, utils).
 *
 * @example
 *   const tx = getTranslations('fr')
 *   tx.common.actions.enregistrer // → 'Enregistrer'
 */
export function getTranslations(lang: Lang) {
  return createProxy(translations, lang)
}

export type { Lang }

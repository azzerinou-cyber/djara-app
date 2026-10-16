/**
 * DJARA — Point d'entrée i18n
 *
 * Import unique dans les composants :
 *   import { useTranslation, getTranslations } from '@/i18n'
 *   import type { Lang } from '@/i18n'
 */

export { useTranslation, getTranslations } from './useTranslation'
export { translations, isRTL, RTL_LANGS } from './translations'
export type { Lang, Translations } from './translations'

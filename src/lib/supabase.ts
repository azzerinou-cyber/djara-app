import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client navigateur basé sur les cookies : la session est lisible par src/proxy.ts
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

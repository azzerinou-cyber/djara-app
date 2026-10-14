# DJARA — Configuration Supabase

## Étape 1 — Exécuter le schéma SQL

1. Allez sur [supabase.com](https://supabase.com) → votre projet `pivezflqwinkdwauybwg`
2. Cliquez sur **SQL Editor** dans le menu gauche
3. Cliquez **New query**
4. Copiez-collez le contenu du fichier `supabase/migrations/001_initial_schema.sql`
5. Cliquez **Run** (▶️)

Ce script crée :
- `profiles` — profils des utilisatrices
- `categories` — catégories de services (avec données initiales)
- `services` — annonces publiées
- `bookings` — demandes de prestation
- `conversations` + `messages` — messagerie interne
- `reviews` — évaluations
- `reports` + `blocks` — sécurité
- RLS (Row Level Security) sur toutes les tables
- Fonctions de recherche géolocalisée sécurisées

## Étape 2 — Activer l'authentification par téléphone

1. Dans Supabase → **Authentication** → **Providers**
2. Activez **Phone** 
3. Pour les tests : activez **"Enable phone confirmations"** = OFF (permet d'utiliser n'importe quel code)
   OU configurez un provider SMS (Twilio, Vonage...)

> **Test rapide** : Désactivez la confirmation pour tester sans vrai SMS.

## Étape 3 — Ajouter des données de test

Dans l'éditeur SQL, ajoutez un service de test (après avoir créé un compte) :

```sql
-- Remplacez 'VOTRE_USER_ID' par votre vrai UUID (visible dans Authentication > Users)
insert into public.profiles (id, display_name, wilaya, commune, trust_level, is_verified)
values ('VOTRE_USER_ID', 'Yasmine', 'Alger', 'Bab El Oued', 2, true);

insert into public.services (provider_id, category_id, title, description, price_min, price_unit, wilaya, commune, is_available)
select 
  'VOTRE_USER_ID',
  (select id from categories where slug = 'beaute'),
  'Coiffure à domicile — toutes techniques',
  'Coiffeuse professionnelle avec 5 ans d expérience. Coupe, brushing, coloration.',
  800,
  'séance',
  'Alger',
  'Bab El Oued',
  true;
```

## Variables d'environnement Vercel (déjà configurées ✅)

- `NEXT_PUBLIC_SUPABASE_URL` = `https://pivezflqwinkdwauybwg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = votre clé JWT

> **Note** : Ces variables sont actuellement configurées en **Production** uniquement.
> Pour le développement local, créez un fichier `.env.local` :
> ```
> NEXT_PUBLIC_SUPABASE_URL=https://pivezflqwinkdwauybwg.supabase.co
> NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_ici
> ```

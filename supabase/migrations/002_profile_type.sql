-- ============================================================
-- DJARA — Type de profil
-- Migration 002 — À exécuter dans l'éditeur SQL Supabase
-- ============================================================

-- Nullable pour les profils existants : le formulaire le rend obligatoire
alter table public.profiles
  add column if not exists profile_type text
  check (profile_type in ('particuliere', 'professionnelle'));

comment on column public.profiles.profile_type is 'particuliere ou professionnelle';

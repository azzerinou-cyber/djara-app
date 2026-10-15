-- ============================================================
-- DJARA — Champs des profils professionnels
-- Migration 003 — À exécuter dans l'éditeur SQL Supabase
-- ============================================================

alter table public.profiles
  add column if not exists business_name   text,
  add column if not exists commerce_number text;

comment on column public.profiles.business_name   is 'Nom de l entreprise (profils professionnels)';
comment on column public.profiles.commerce_number is 'Numéro de registre de commerce (profils professionnels)';

-- Obligatoires pour un profil professionnel.
-- "not valid" : la règle s'applique aux nouvelles écritures sans bloquer les profils existants.
alter table public.profiles
  drop constraint if exists profiles_pro_fields_required;
alter table public.profiles
  add constraint profiles_pro_fields_required check (
    profile_type is distinct from 'professionnelle'
    or (nullif(trim(business_name), '') is not null and nullif(trim(commerce_number), '') is not null)
  ) not valid;

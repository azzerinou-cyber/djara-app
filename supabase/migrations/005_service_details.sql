-- ============================================================
-- DJARA — Disponibilités et photos des services
-- Migration 005 — À exécuter dans l'éditeur SQL Supabase
-- ============================================================

-- ------------------------------------------------------------
-- 1. Colonnes services
-- ------------------------------------------------------------
alter table public.services
  add column if not exists available_days text[] not null default '{}',
  add column if not exists photo_urls     text[] not null default '{}';

comment on column public.services.available_days is 'Jours de disponibilité (dimanche … samedi)';
comment on column public.services.photo_urls     is 'URLs publiques des photos (bucket service-photos), 5 maximum';

alter table public.services
  drop constraint if exists services_available_days_valid;
alter table public.services
  add constraint services_available_days_valid check (
    available_days <@ array['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  );

alter table public.services
  drop constraint if exists services_photo_urls_max;
alter table public.services
  add constraint services_photo_urls_max check (cardinality(photo_urls) <= 5);

-- Une prestataire ne publie que ses propres services
drop policy if exists "Prestataires publient leurs services" on public.services;
create policy "Prestataires publient leurs services" on public.services
  for insert to authenticated
  with check (auth.uid() = provider_id);

-- ------------------------------------------------------------
-- 2. Bucket public service-photos
-- Photos d'annonces : lisibles par toutes, chemin {user_id}/{service_id}/...
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-photos', 'service-photos', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public             = true,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Dépôt et suppression uniquement dans son propre dossier
drop policy if exists "Dépôt photos de service propres" on storage.objects;
create policy "Dépôt photos de service propres" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'service-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Suppression photos de service propres" on storage.objects;
create policy "Suppression photos de service propres" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'service-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

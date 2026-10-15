-- ============================================================
-- DJARA — Pièce d'identité (CNI recto ou passeport)
-- Migration 004 — À exécuter dans l'éditeur SQL Supabase
-- Prérequis : migrations 002 et 003
-- ============================================================

-- ------------------------------------------------------------
-- 1. Admins
-- Aucune policy : la table n'est lisible/modifiable que depuis
-- l'éditeur SQL ou la clé service_role.
-- Ajouter une admin :
--   insert into public.admins (user_id) values ('UUID_DE_L_ADMIN');
-- ------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ------------------------------------------------------------
-- 2. Colonnes profiles
-- identity_doc_url contient le chemin dans le bucket privé
-- ({user_id}/identity), jamais une URL publique.
-- ------------------------------------------------------------
alter table public.profiles
  add column if not exists identity_doc_url  text,
  add column if not exists identity_verified boolean not null default false;

comment on column public.profiles.identity_doc_url  is 'Chemin du document dans le bucket privé identity-documents';
comment on column public.profiles.identity_verified is 'Pièce d identité validée par une admin';

-- Pièce d'identité obligatoire pour tous les nouveaux enregistrements
-- ("not valid" : ne bloque pas les profils existants tant qu'ils ne sont pas modifiés).
alter table public.profiles
  drop constraint if exists profiles_identity_doc_required;
alter table public.profiles
  add constraint profiles_identity_doc_required check (identity_doc_url is not null) not valid;

-- ------------------------------------------------------------
-- 3. Verrou : une utilisatrice ne peut ni se valider elle-même,
-- ni pointer vers le document d'une autre.
-- ------------------------------------------------------------
create or replace function public.protect_identity_fields()
returns trigger language plpgsql as $$
begin
  -- SQL editor / service_role / admins : pas de restriction
  if current_user not in ('authenticated', 'anon') or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.identity_verified := false;
  else
    new.identity_verified := old.identity_verified;
    -- Le document change → nouvelle vérification nécessaire
    if new.identity_doc_url is distinct from old.identity_doc_url then
      new.identity_verified := false;
    end if;
  end if;

  if new.identity_doc_url is not null and new.identity_doc_url <> new.id::text || '/identity' then
    raise exception 'identity_doc_url invalide';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_identity on public.profiles;
create trigger profiles_protect_identity
  before insert or update on public.profiles
  for each row execute function public.protect_identity_fields();

-- Les admins peuvent modifier les profils (validation d'identité)
drop policy if exists "Admins modifient les profils" on public.profiles;
create policy "Admins modifient les profils" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- 4. Bucket privé identity-documents
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'identity-documents', 'identity-documents', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public             = false,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Une utilisatrice peut déposer UNIQUEMENT son propre document, à {user_id}/identity.
-- Pas de policy select/update/delete pour elle : une fois envoyé, elle ne peut
-- ni le relire ni le remplacer (une admin doit d'abord le supprimer).
drop policy if exists "Dépôt pièce d'identité propre" on storage.objects;
create policy "Dépôt pièce d'identité propre" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'identity-documents'
    and name = auth.uid()::text || '/identity'
  );

-- Lecture, remplacement et suppression : admins uniquement
drop policy if exists "Admins lisent les pièces d'identité" on storage.objects;
create policy "Admins lisent les pièces d'identité" on storage.objects
  for select to authenticated
  using (bucket_id = 'identity-documents' and public.is_admin());

drop policy if exists "Admins modifient les pièces d'identité" on storage.objects;
create policy "Admins modifient les pièces d'identité" on storage.objects
  for update to authenticated
  using (bucket_id = 'identity-documents' and public.is_admin())
  with check (bucket_id = 'identity-documents' and public.is_admin());

drop policy if exists "Admins suppriment les pièces d'identité" on storage.objects;
create policy "Admins suppriment les pièces d'identité" on storage.objects
  for delete to authenticated
  using (bucket_id = 'identity-documents' and public.is_admin());

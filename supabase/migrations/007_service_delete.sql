-- ============================================================
-- DJARA — Suppression des services par leur propriétaire
-- Migration 007 — À exécuter dans l'éditeur SQL Supabase
-- ============================================================

drop policy if exists "Prestataires suppriment leurs services" on public.services;
create policy "Prestataires suppriment leurs services" on public.services
  for delete to authenticated
  using (auth.uid() = provider_id);

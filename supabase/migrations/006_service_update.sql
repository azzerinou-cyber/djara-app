-- ============================================================
-- DJARA — Modification des services par leur propriétaire
-- Migration 006 — À exécuter dans l'éditeur SQL Supabase
-- ============================================================

-- Une prestataire ne modifie que ses propres services,
-- et ne peut pas les transférer à une autre (with check).
drop policy if exists "Prestataires modifient leurs services" on public.services;
create policy "Prestataires modifient leurs services" on public.services
  for update to authenticated
  using (auth.uid() = provider_id)
  with check (auth.uid() = provider_id);

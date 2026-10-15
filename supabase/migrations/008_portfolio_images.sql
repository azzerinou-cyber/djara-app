-- Migration 008 : Table portfolio_images
-- Galerie de réalisations des prestataires

CREATE TABLE IF NOT EXISTS public.portfolio_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  caption       TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour récupérer rapidement les images d'une prestataire
CREATE INDEX IF NOT EXISTS portfolio_images_provider_id_idx
  ON public.portfolio_images (provider_id, sort_order);

-- RLS
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- Lecture publique : toutes les images de profils actifs
CREATE POLICY "portfolio_images_select_public"
  ON public.portfolio_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = portfolio_images.provider_id
        AND p.is_active = TRUE
    )
  );

-- Une prestataire insère ses propres images
CREATE POLICY "portfolio_images_insert_own"
  ON public.portfolio_images
  FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

-- Une prestataire met à jour ses propres images
CREATE POLICY "portfolio_images_update_own"
  ON public.portfolio_images
  FOR UPDATE
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

-- Une prestataire supprime ses propres images
CREATE POLICY "portfolio_images_delete_own"
  ON public.portfolio_images
  FOR DELETE
  USING (auth.uid() = provider_id);

-- Bucket Storage pour les images (si pas encore créé, à exécuter manuellement
-- dans le dashboard Supabase > Storage > New bucket : "portfolio" public)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', TRUE)
--   ON CONFLICT (id) DO NOTHING;

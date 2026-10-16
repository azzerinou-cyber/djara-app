-- ============================================================
-- Migration 012 — Système de favoris
-- ============================================================
-- Permet aux utilisatrices de sauvegarder des profils prestataires.
-- Table simple : une ligne par (userId, providerId).
-- RLS : chaque utilisatrice ne voit et ne gère que ses propres favoris.
-- ============================================================

-- ── TABLE ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.favorites (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Contrainte d'unicité : un profil ne peut être favori qu'une fois
  CONSTRAINT favorites_unique UNIQUE (user_id, provider_id),

  -- Interdire de se mettre soi-même en favori
  CONSTRAINT favorites_no_self CHECK (user_id <> provider_id)
);

COMMENT ON TABLE public.favorites IS
  'Prestataires sauvegardées par une utilisatrice.';

-- ── INDEX ────────────────────────────────────────────────────────────────────

-- Lookup rapide : tous les favoris d'une utilisatrice (tri par ajout récent)
CREATE INDEX IF NOT EXISTS idx_favorites_user_id
  ON public.favorites (user_id, created_at DESC);

-- Lookup inverse : combien d'utilisatrices ont mis un profil en favori
CREATE INDEX IF NOT EXISTS idx_favorites_provider_id
  ON public.favorites (provider_id);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- SELECT : chaque utilisatrice ne voit que ses propres favoris
CREATE POLICY "favorites_select_own"
  ON public.favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT : une utilisatrice ne peut ajouter que ses propres favoris
CREATE POLICY "favorites_insert_own"
  ON public.favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- DELETE : une utilisatrice ne peut supprimer que ses propres favoris
CREATE POLICY "favorites_delete_own"
  ON public.favorites
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ── FONCTION TOGGLE ──────────────────────────────────────────────────────────
-- toggle_favorite(p_provider_id) : ajoute si absent, supprime si présent.
-- Retourne TRUE si le favori a été ajouté, FALSE s'il a été supprimé.
-- SECURITY DEFINER : la vérification d'identité est côté serveur.

CREATE OR REPLACE FUNCTION public.toggle_favorite(
  p_provider_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_exists  BOOLEAN;
BEGIN
  -- Vérifier l'authentification
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifiée.' USING ERRCODE = 'P0001';
  END IF;

  -- Interdire de se mettre soi-même en favori
  IF v_user_id = p_provider_id THEN
    RAISE EXCEPTION 'Vous ne pouvez pas vous mettre vous-même en favori.' USING ERRCODE = 'P0001';
  END IF;

  -- Vérifier si le favori existe déjà
  SELECT EXISTS (
    SELECT 1 FROM public.favorites
    WHERE user_id = v_user_id AND provider_id = p_provider_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Supprimer
    DELETE FROM public.favorites
    WHERE user_id = v_user_id AND provider_id = p_provider_id;
    RETURN FALSE; -- Favori supprimé
  ELSE
    -- Ajouter
    INSERT INTO public.favorites (user_id, provider_id)
    VALUES (v_user_id, p_provider_id);
    RETURN TRUE;  -- Favori ajouté
  END IF;
END;
$$;

COMMENT ON FUNCTION public.toggle_favorite IS
  'Ajoute ou supprime un favori. Retourne TRUE si ajouté, FALSE si supprimé.';

-- Révoquer l'accès direct à la fonction pour les rôles non authentifiés
REVOKE ALL ON FUNCTION public.toggle_favorite FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_favorite TO authenticated;

-- ── VUE : MES FAVORIS AVEC DONNÉES PROFIL ───────────────────────────────────
-- Vue dénormalisée pour récupérer les favoris avec les infos prestataire
-- en une seule requête.

CREATE OR REPLACE VIEW public.my_favorites AS
SELECT
  f.id          AS favorite_id,
  f.created_at  AS favorited_at,
  p.id          AS provider_id,
  p.display_name,
  p.avatar_url,
  p.commune,
  p.wilaya,
  p.bio,
  p.trust_level,
  p.is_active,
  -- Note moyenne (dénormalisée pour la perf)
  COALESCE(
    (SELECT ROUND(AVG(r.overall_rating)::numeric, 1)
     FROM public.reviews r
     WHERE r.provider_id = p.id),
    0
  ) AS avg_rating,
  -- Nombre d'avis
  (SELECT COUNT(*) FROM public.reviews r WHERE r.provider_id = p.id) AS review_count,
  -- Premier service actif (pour l'affichage de la carte)
  (SELECT s.title FROM public.services s WHERE s.provider_id = p.id AND s.is_active LIMIT 1) AS first_service_title,
  (SELECT s.category FROM public.services s WHERE s.provider_id = p.id AND s.is_active LIMIT 1) AS first_service_category,
  (SELECT s.price_min FROM public.services s WHERE s.provider_id = p.id AND s.is_active LIMIT 1) AS first_service_price
FROM public.favorites f
JOIN public.profiles p ON p.id = f.provider_id
WHERE f.user_id = auth.uid()
ORDER BY f.created_at DESC;

COMMENT ON VIEW public.my_favorites IS
  'Favoris de l''utilisatrice connectée avec données complètes des prestataires.';

-- La vue utilise auth.uid() donc RLS implicite — accessible en lecture seule
GRANT SELECT ON public.my_favorites TO authenticated;

-- ============================================================
-- Migration 013 — Recherche géolocalisée par rayon (PostGIS)
-- ============================================================
-- Fonction RPC : search_providers_nearby
-- Filtre les prestataires dans un rayon donné autour d'un point.
-- Retourne une zone approximative, jamais les coordonnées exactes.
-- SECURITY DEFINER : accès contrôlé côté serveur.
-- ============================================================

-- ── EXTENSION PostGIS (si pas déjà activée) ──────────────────
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── INDEX SPATIAL sur profiles ───────────────────────────────
-- Accélère les requêtes ST_DWithin
CREATE INDEX IF NOT EXISTS idx_profiles_location
  ON public.profiles
  USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ── TYPE RETOUR ──────────────────────────────────────────────
-- On renvoie des données de profil + distance arrondie.
-- Jamais les coordonnées GPS exactes dans la réponse publique.

DROP TYPE IF EXISTS public.provider_search_result CASCADE;
CREATE TYPE public.provider_search_result AS (
  id              UUID,
  display_name    TEXT,
  business_name   TEXT,
  commune         TEXT,
  wilaya          TEXT,
  bio             TEXT,
  trust_level     INT,
  avatar_url      TEXT,
  avg_rating      NUMERIC,
  review_count    BIGINT,
  distance_km     NUMERIC,   -- arrondi au 0.5 km près
  -- Localisation approximative uniquement (centroïde de commune)
  approx_latitude  NUMERIC,  -- arrondi à 2 décimales (~1 km de précision)
  approx_longitude NUMERIC
);

-- ── FONCTION PRINCIPALE ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.search_providers_nearby(
  p_lat          DOUBLE PRECISION,    -- latitude du point de recherche
  p_lng          DOUBLE PRECISION,    -- longitude du point de recherche
  p_radius_km    DOUBLE PRECISION DEFAULT 10,  -- rayon en km (1/3/5/10/25/50)
  p_category_id  UUID             DEFAULT NULL, -- filtre catégorie (optionnel)
  p_search_term  TEXT             DEFAULT NULL  -- filtre texte (optionnel)
)
RETURNS SETOF public.provider_search_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_center   GEOMETRY;
  v_radius_m DOUBLE PRECISION;
BEGIN
  -- Validation du rayon : limité à 50 km
  IF p_radius_km IS NULL OR p_radius_km <= 0 OR p_radius_km > 50 THEN
    p_radius_km := 10;
  END IF;

  v_center   := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326);
  v_radius_m := p_radius_km * 1000;

  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.business_name,
    p.commune,
    p.wilaya,
    p.bio,
    p.trust_level,
    p.avatar_url,
    -- Note moyenne
    COALESCE(
      ROUND(
        (SELECT AVG(r.overall_rating) FROM public.reviews r WHERE r.provider_id = p.id)::NUMERIC,
        1
      ),
      0
    ) AS avg_rating,
    -- Nombre d'avis
    (SELECT COUNT(*) FROM public.reviews r WHERE r.provider_id = p.id) AS review_count,
    -- Distance arrondie au 0.5 km (protection vie privée)
    ROUND(
      (ST_Distance(
        ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::GEOGRAPHY,
        v_center::GEOGRAPHY
      ) / 1000)::NUMERIC * 2
    ) / 2 AS distance_km,
    -- Coordonnées approximatives (±~1 km) — jamais les coords exactes
    ROUND(p.latitude::NUMERIC, 2)  AS approx_latitude,
    ROUND(p.longitude::NUMERIC, 2) AS approx_longitude

  FROM public.profiles p

  -- Jointure avec services pour le filtre catégorie
  WHERE p.is_active = TRUE
    AND p.latitude  IS NOT NULL
    AND p.longitude IS NOT NULL
    -- Filtre spatial : dans le rayon
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::GEOGRAPHY,
      v_center::GEOGRAPHY,
      v_radius_m
    )
    -- Filtre catégorie (optionnel)
    AND (
      p_category_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.services s
        WHERE s.provider_id = p.id
          AND s.is_active = TRUE
          AND s.category_id = p_category_id
      )
    )
    -- Filtre texte (optionnel)
    AND (
      p_search_term IS NULL
      OR p_search_term = ''
      OR p.display_name ILIKE '%' || p_search_term || '%'
      OR p.business_name ILIKE '%' || p_search_term || '%'
      OR p.bio          ILIKE '%' || p_search_term || '%'
    )

  ORDER BY
    -- Priorité : profils vérifiés d'abord, puis par distance
    p.trust_level DESC,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::GEOGRAPHY,
      v_center::GEOGRAPHY
    ) ASC

  LIMIT 50;
END;
$$;

COMMENT ON FUNCTION public.search_providers_nearby IS
  'Recherche de prestataires dans un rayon géographique. '
  'Retourne des coordonnées approximatives (±1 km), jamais les coordonnées exactes.';

-- Accès : utilisatrices authentifiées uniquement
REVOKE ALL ON FUNCTION public.search_providers_nearby FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_providers_nearby TO authenticated;

-- ── FONCTION FALLBACK SANS GPS ────────────────────────────────
-- Utilisée quand l'utilisatrice n'a pas activé la géolocalisation.
-- Recherche textuelle pure (wilaya + commune + terme).

CREATE OR REPLACE FUNCTION public.search_providers_text(
  p_wilaya      TEXT    DEFAULT NULL,
  p_commune     TEXT    DEFAULT NULL,
  p_category_id UUID    DEFAULT NULL,
  p_search_term TEXT    DEFAULT NULL,
  p_limit       INT     DEFAULT 30
)
RETURNS TABLE (
  id            UUID,
  display_name  TEXT,
  business_name TEXT,
  commune       TEXT,
  wilaya        TEXT,
  bio           TEXT,
  trust_level   INT,
  avatar_url    TEXT,
  avg_rating    NUMERIC,
  review_count  BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.display_name,
    p.business_name,
    p.commune,
    p.wilaya,
    p.bio,
    p.trust_level,
    p.avatar_url,
    COALESCE(
      ROUND(
        (SELECT AVG(r.overall_rating) FROM public.reviews r WHERE r.provider_id = p.id)::NUMERIC,
        1
      ),
      0
    ) AS avg_rating,
    (SELECT COUNT(*) FROM public.reviews r WHERE r.provider_id = p.id) AS review_count

  FROM public.profiles p

  WHERE p.is_active = TRUE
    AND (p_wilaya IS NULL OR p_wilaya = ''
         OR p.wilaya ILIKE '%' || p_wilaya || '%')
    AND (p_commune IS NULL OR p_commune = ''
         OR p.commune ILIKE '%' || p_commune || '%')
    AND (p_category_id IS NULL
         OR EXISTS (
           SELECT 1 FROM public.services s
           WHERE s.provider_id = p.id
             AND s.is_active = TRUE
             AND s.category_id = p_category_id
         ))
    AND (p_search_term IS NULL OR p_search_term = ''
         OR p.display_name ILIKE '%' || p_search_term || '%'
         OR p.business_name ILIKE '%' || p_search_term || '%'
         OR p.bio           ILIKE '%' || p_search_term || '%')

  ORDER BY p.trust_level DESC, p.created_at DESC
  LIMIT LEAST(p_limit, 50);
END;
$$;

COMMENT ON FUNCTION public.search_providers_text IS
  'Recherche textuelle de prestataires sans géolocalisation (fallback).';

REVOKE ALL ON FUNCTION public.search_providers_text FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_providers_text TO authenticated;
-- Accès anonyme en lecture pour la page d'accueil non connectée
GRANT EXECUTE ON FUNCTION public.search_providers_text TO anon;

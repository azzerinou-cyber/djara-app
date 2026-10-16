-- Migration 011 : RLS pour reviews et reports
-- Complète les politiques manquantes de la migration 001
-- Toutes les opérations sont idempotentes (DROP IF EXISTS + IF NOT EXISTS)

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1 : RLS sur public.reviews
-- Règle métier : une avis ne peut être soumis que si le booking est 'completed'
-- et que la revieweuse est la cliente (client_id)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Toute utilisatrice peut lire les avis d'une prestataire (profil public)
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT
  USING (true);

-- Insérer un avis : uniquement si le booking correspondant est 'completed'
-- et que l'utilisatrice est bien la cliente de cette réservation
DROP POLICY IF EXISTS "reviews_insert_completed_booking" ON public.reviews;
CREATE POLICY "reviews_insert_completed_booking"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = reviews.booking_id
        AND b.client_id  = auth.uid()
        AND b.provider_id = reviews.provider_id
        AND b.status = 'completed'
    )
  );

-- Pas de modification/suppression par les utilisatrices (modération admin uniquement)
-- → aucune politique UPDATE/DELETE pour les utilisatrices normales

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2 : RLS sur public.reports (signalements)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Une utilisatrice ne voit que ses propres signalements
DROP POLICY IF EXISTS "reports_select_own" ON public.reports;
CREATE POLICY "reports_select_own"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Toute utilisatrice authentifiée peut soumettre un signalement
DROP POLICY IF EXISTS "reports_insert_authenticated" ON public.reports;
CREATE POLICY "reports_insert_authenticated"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id AND auth.uid() IS NOT NULL);

-- Pas de modification/suppression par les utilisatrices → modération admin uniquement

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3 : RLS sur public.blocks
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocks_select_own" ON public.blocks;
CREATE POLICY "blocks_select_own"
  ON public.blocks FOR SELECT
  USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "blocks_insert_own" ON public.blocks;
CREATE POLICY "blocks_insert_own"
  ON public.blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "blocks_delete_own" ON public.blocks;
CREATE POLICY "blocks_delete_own"
  ON public.blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4 : Fonction SECURITY DEFINER pour créer une réservation
-- Vérifie côté serveur : pas d'auto-réservation, service actif, prestataire active
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_booking(
  p_service_id   UUID,
  p_scheduled_at TIMESTAMPTZ DEFAULT NULL,
  p_message      TEXT        DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me          UUID := auth.uid();
  v_provider_id UUID;
  v_booking_id  UUID;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Récupérer le prestataire lié au service (et vérifier que le service est actif)
  SELECT provider_id INTO v_provider_id
  FROM public.services
  WHERE id = p_service_id AND status = 'active';

  IF v_provider_id IS NULL THEN
    RAISE EXCEPTION 'Service introuvable ou inactif';
  END IF;

  IF v_me = v_provider_id THEN
    RAISE EXCEPTION 'Vous ne pouvez pas réserver votre propre service';
  END IF;

  -- Vérifier que la prestataire est active
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_provider_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Cette prestataire n''est plus disponible';
  END IF;

  -- Créer la réservation
  INSERT INTO public.bookings (service_id, client_id, provider_id, scheduled_at, message)
  VALUES (p_service_id, v_me, v_provider_id, p_scheduled_at, p_message)
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5 : Fonction SECURITY DEFINER pour mettre à jour le statut d'une réservation
-- Encode les règles métier : qui peut changer quoi
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_booking_status(
  p_booking_id   UUID,
  p_new_status   TEXT,
  p_provider_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me         UUID := auth.uid();
  v_booking    public.bookings;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id;

  IF v_booking.id IS NULL THEN
    RAISE EXCEPTION 'Réservation introuvable';
  END IF;

  -- Règles pour la PRESTATAIRE (provider)
  IF v_me = v_booking.provider_id THEN
    -- Peut accepter/refuser depuis 'pending'
    IF p_new_status IN ('accepted', 'refused') AND v_booking.status = 'pending' THEN
      NULL; -- autorisé
    -- Peut marquer comme terminé depuis 'accepted'
    ELSIF p_new_status = 'completed' AND v_booking.status = 'accepted' THEN
      NULL; -- autorisé
    -- Peut signaler un litige depuis 'accepted' ou 'completed'
    ELSIF p_new_status = 'disputed' AND v_booking.status IN ('accepted', 'completed') THEN
      NULL; -- autorisé
    ELSE
      RAISE EXCEPTION 'Transition de statut non autorisée pour la prestataire: % → %', v_booking.status, p_new_status;
    END IF;

  -- Règles pour la CLIENTE (client)
  ELSIF v_me = v_booking.client_id THEN
    -- Peut annuler depuis 'pending' ou 'accepted'
    IF p_new_status = 'cancelled' AND v_booking.status IN ('pending', 'accepted') THEN
      NULL; -- autorisé
    -- Peut signaler un litige depuis 'accepted' ou 'completed'
    ELSIF p_new_status = 'disputed' AND v_booking.status IN ('accepted', 'completed') THEN
      NULL; -- autorisé
    ELSE
      RAISE EXCEPTION 'Transition de statut non autorisée pour la cliente: % → %', v_booking.status, p_new_status;
    END IF;

  ELSE
    RAISE EXCEPTION 'Accès non autorisé à cette réservation';
  END IF;

  -- Appliquer la mise à jour
  UPDATE public.bookings
  SET
    status       = p_new_status,
    provider_note = COALESCE(p_provider_note, provider_note),
    updated_at   = NOW()
  WHERE id = p_booking_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6 : Index de performance supplémentaires
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS bookings_service_idx    ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS bookings_updated_idx    ON public.bookings(updated_at DESC);
CREATE INDEX IF NOT EXISTS reviews_booking_idx     ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS reviews_reviewer_idx    ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS reports_reporter_idx    ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS reports_reported_idx    ON public.reports(reported_id);
CREATE INDEX IF NOT EXISTS reports_status_idx      ON public.reports(status);

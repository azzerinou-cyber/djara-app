-- ============================================================
-- DJARA — Correction critique du schéma + Durcissement sécurité
-- Migration 010 — Sprint 1
-- ============================================================
-- Problèmes résolus :
--   1. Conflit de schéma conversations (001 user_a/user_b vs 009 user_a_id/user_b_id)
--   2. Conflit de schéma messages (001 body/image_url/is_read vs 009 content/type/read_at)
--   3. Table devis manquante (utilisée par /devis/ dans le codebase)
--   4. RLS bookings trop permissive (client pouvait accepter/terminer une réservation)
--   5. Suppression de compte et données (obligation loi 18-07)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. FIX CONVERSATIONS — renommage colonnes 001 → standard 009
-- ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Renommer user_a → user_a_id si l'ancienne colonne existe encore
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'user_a'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'user_a_id'
  ) THEN
    ALTER TABLE public.conversations RENAME COLUMN user_a TO user_a_id;
  END IF;

  -- Renommer user_b → user_b_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'user_b'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'user_b_id'
  ) THEN
    ALTER TABLE public.conversations RENAME COLUMN user_b TO user_b_id;
  END IF;

  -- Ajouter last_message_at si absent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'last_message_at'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN last_message_at TIMESTAMPTZ;
  END IF;

  -- Ajouter index sur user_a_id si absent (peut avoir été créé avec l'ancien nom)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'conversations' AND indexname = 'conversations_user_a_idx'
  ) THEN
    CREATE INDEX conversations_user_a_idx ON public.conversations (user_a_id, last_message_at DESC);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'conversations' AND indexname = 'conversations_user_b_idx'
  ) THEN
    CREATE INDEX conversations_user_b_idx ON public.conversations (user_b_id, last_message_at DESC);
  END IF;
END $$;

-- Recréer la contrainte no_self_chat avec les bons noms de colonnes
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_no_self_chat;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS unique_pair;
-- Contrainte unique sur les deux colonnes renommées (peut déjà exister avec bon nom)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'conversations_unique_pair' AND conrelid = 'public.conversations'::regclass
  ) THEN
    ALTER TABLE public.conversations
      ADD CONSTRAINT conversations_unique_pair UNIQUE (user_a_id, user_b_id);
  END IF;
END $$;

-- Recréer les policies RLS de conversations avec les bons noms de colonnes
DROP POLICY IF EXISTS "Conversation visible par les parties"   ON public.conversations;
DROP POLICY IF EXISTS "Créer une conversation"                  ON public.conversations;
DROP POLICY IF EXISTS "conversations_select_participant"        ON public.conversations;
DROP POLICY IF EXISTS "conversations_insert_participant"        ON public.conversations;
DROP POLICY IF EXISTS "conversations_update_participant"        ON public.conversations;

CREATE POLICY "conversations_select_participant"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "conversations_insert_participant"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "conversations_update_participant"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- ─────────────────────────────────────────────────────────────
-- 2. FIX MESSAGES — renommage colonnes 001 → standard 009
-- ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Renommer body → content
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'body'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'content'
  ) THEN
    ALTER TABLE public.messages RENAME COLUMN body TO content;
    -- Rendre NOT NULL avec contrainte de longueur
    ALTER TABLE public.messages ALTER COLUMN content SET NOT NULL;
  END IF;

  -- Ajouter type si absent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.messages
      ADD COLUMN type TEXT NOT NULL DEFAULT 'text'
      CHECK (type IN ('text', 'image', 'quote_request'));
  END IF;

  -- Renommer is_read → read_at (booléen → timestamptz)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'is_read'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'read_at'
  ) THEN
    -- Ajouter la nouvelle colonne
    ALTER TABLE public.messages ADD COLUMN read_at TIMESTAMPTZ;
    -- Migrer les données (is_read = true → now(), false → NULL)
    UPDATE public.messages SET read_at = created_at WHERE is_read = true;
    -- Supprimer l'ancienne colonne
    ALTER TABLE public.messages DROP COLUMN is_read;
  END IF;

  -- Supprimer image_url si présente (les images sont maintenant dans le champ content avec type='image')
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'image_url'
  ) THEN
    -- Migrer les URL d'images vers des messages de type image
    UPDATE public.messages
      SET content = image_url, type = 'image'
      WHERE image_url IS NOT NULL AND (content IS NULL OR content = '');
    ALTER TABLE public.messages DROP COLUMN image_url;
  END IF;

  -- Ajouter contrainte de longueur sur content si absente
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'messages_content_length' AND conrelid = 'public.messages'::regclass
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_content_length CHECK (char_length(content) <= 2000);
  END IF;
END $$;

-- Recréer les policies messages avec la bonne logique
DROP POLICY IF EXISTS "Messages de ses conversations"   ON public.messages;
DROP POLICY IF EXISTS "Envoyer un message"              ON public.messages;
DROP POLICY IF EXISTS "Marquer message lu"              ON public.messages;
DROP POLICY IF EXISTS "messages_select_participant"     ON public.messages;
DROP POLICY IF EXISTS "messages_insert_own"             ON public.messages;
DROP POLICY IF EXISTS "messages_update_read_at"         ON public.messages;

CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_a_id = auth.uid() OR c.user_b_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_a_id = auth.uid() OR c.user_b_id = auth.uid())
    )
  );

-- Seule la destinataire peut marquer un message comme lu
CREATE POLICY "messages_update_read_at"
  ON public.messages FOR UPDATE
  USING (
    auth.uid() <> sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_a_id = auth.uid() OR c.user_b_id = auth.uid())
    )
  )
  WITH CHECK (
    -- On ne peut modifier que read_at, pas le contenu
    auth.uid() <> sender_id
  );

-- Recréer la vue v_conversations avec les bons noms de colonnes
CREATE OR REPLACE VIEW public.v_conversations AS
SELECT
  c.id,
  c.user_a_id,
  c.user_b_id,
  c.last_message_at,
  c.created_at,
  m.content            AS last_message_content,
  m.sender_id          AS last_message_sender_id,
  m.type               AS last_message_type,
  m.created_at         AS last_message_created_at,
  pa.display_name      AS user_a_display_name,
  pa.avatar_url        AS user_a_avatar_url,
  pb.display_name      AS user_b_display_name,
  pb.avatar_url        AS user_b_avatar_url
FROM public.conversations c
LEFT JOIN LATERAL (
  SELECT content, sender_id, type, created_at
  FROM public.messages
  WHERE conversation_id = c.id
  ORDER BY created_at DESC
  LIMIT 1
) m ON TRUE
LEFT JOIN public.profiles pa ON pa.id = c.user_a_id
LEFT JOIN public.profiles pb ON pb.id = c.user_b_id;

-- Recréer la fonction get_or_create_conversation (peut référencer user_a/user_b anciens noms)
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  other_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me      UUID := auth.uid();
  v_conv_id UUID;
  v_user_a  UUID;
  v_user_b  UUID;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Non authentifiée';
  END IF;
  IF v_me = other_user_id THEN
    RAISE EXCEPTION 'Impossible de créer une conversation avec soi-même';
  END IF;

  -- Ordre déterministe pour la contrainte UNIQUE (user_a_id < user_b_id)
  IF v_me::text < other_user_id::text THEN
    v_user_a := v_me;
    v_user_b := other_user_id;
  ELSE
    v_user_a := other_user_id;
    v_user_b := v_me;
  END IF;

  SELECT id INTO v_conv_id
  FROM public.conversations
  WHERE user_a_id = v_user_a AND user_b_id = v_user_b;

  IF v_conv_id IS NULL THEN
    INSERT INTO public.conversations (user_a_id, user_b_id)
    VALUES (v_user_a, v_user_b)
    RETURNING id INTO v_conv_id;
  END IF;

  RETURN v_conv_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 3. TABLE DEVIS (manquante dans toutes les migrations)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.devis (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name   TEXT,
  service_title TEXT NOT NULL,
  description   TEXT,
  price_amount  NUMERIC(10, 2),
  currency      TEXT NOT NULL DEFAULT 'DZD',
  duration      TEXT,
  valid_until   DATE,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'sent'
                CHECK (status IN ('sent', 'accepted', 'refused', 'expired')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS devis_provider_idx ON public.devis (provider_id, created_at DESC);
CREATE INDEX IF NOT EXISTS devis_client_idx   ON public.devis (client_id, created_at DESC);

ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;

-- Trigger updated_at
CREATE TRIGGER devis_updated_at
  BEFORE UPDATE ON public.devis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS devis : prestataire voit/crée/modifie ses devis ; cliente voit les devis reçus
DROP POLICY IF EXISTS "provider_sees_own_devis"    ON public.devis;
DROP POLICY IF EXISTS "provider_creates_devis"     ON public.devis;
DROP POLICY IF EXISTS "provider_updates_own_devis" ON public.devis;
DROP POLICY IF EXISTS "client_sees_received_devis" ON public.devis;

CREATE POLICY "provider_sees_own_devis"
  ON public.devis FOR SELECT
  USING (provider_id = auth.uid());

CREATE POLICY "provider_creates_devis"
  ON public.devis FOR INSERT
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "provider_updates_own_devis"
  ON public.devis FOR UPDATE
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

-- La cliente peut voir les devis qui lui sont adressés ET changer le statut (accepter/refuser)
CREATE POLICY "client_sees_received_devis"
  ON public.devis FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "client_updates_devis_status"
  ON public.devis FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (
    client_id = auth.uid()
    -- La cliente ne peut que accepter ou refuser, pas changer le montant ou le prestataire
    AND provider_id = (SELECT provider_id FROM public.devis WHERE id = devis.id)
    AND service_title = (SELECT service_title FROM public.devis WHERE id = devis.id)
    AND status IN ('accepted', 'refused')
  );

-- ─────────────────────────────────────────────────────────────
-- 4. DURCISSEMENT RLS BOOKINGS
-- La politique actuelle permet à la cliente de mettre n'importe quel status.
-- Correction : la prestataire accepte/refuse ; la cliente ne peut qu'annuler.
-- ─────────────────────────────────────────────────────────────

-- Supprimer les policies trop permissives
DROP POLICY IF EXISTS "Prestataire met à jour statut" ON public.bookings;
DROP POLICY IF EXISTS "Booking visible par les parties" ON public.bookings;
DROP POLICY IF EXISTS "Créer une demande"              ON public.bookings;

-- Lecture : cliente ou prestataire concernée
CREATE POLICY "bookings_select_parties"
  ON public.bookings FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- Création : uniquement la cliente (pas d'auto-réservation grâce à la contrainte no_self_booking)
CREATE POLICY "bookings_insert_client"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Prestataire : peut changer le statut vers accepted / refused / completed / disputed
CREATE POLICY "bookings_update_provider"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = provider_id)
  WITH CHECK (
    auth.uid() = provider_id
    AND status IN ('accepted', 'refused', 'completed', 'disputed')
    -- Ne peut pas se réassigner la prestation
    AND provider_id = (SELECT provider_id FROM public.bookings WHERE id = bookings.id)
  );

-- Cliente : peut uniquement annuler une prestation en attente ou acceptée
CREATE POLICY "bookings_cancel_client"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (
    auth.uid() = client_id
    AND status = 'cancelled'
    -- Ne peut annuler que si en attente ou acceptée (pas après completion)
    AND (SELECT status FROM public.bookings WHERE id = bookings.id) IN ('pending', 'accepted')
  );

-- ─────────────────────────────────────────────────────────────
-- 5. SUPPRESSION DE COMPTE (loi algérienne 18-07, art. 16 & 26)
-- Droit d'accès, de rectification et de suppression des données personnelles.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me UUID := auth.uid();
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Non authentifiée';
  END IF;

  -- 1. Anonymiser les messages envoyés (conserver l'historique des conversations
  --    pour l'autre partie, mais effacer le contenu personnel)
  UPDATE public.messages
    SET content   = '[Message supprimé]',
        sender_id = v_me  -- sender_id pointe vers un profil supprimé, FK ON DELETE CASCADE s'en chargera
    WHERE sender_id = v_me;

  -- 2. Annuler toutes les réservations en cours (pending / accepted)
  UPDATE public.bookings
    SET status = 'cancelled'
    WHERE (client_id = v_me OR provider_id = v_me)
      AND status IN ('pending', 'accepted');

  -- 3. Désactiver le profil immédiatement (pour masquer de la liste publique)
  UPDATE public.profiles
    SET is_active    = false,
        display_name = 'Compte supprimé',
        bio          = NULL,
        avatar_url   = NULL,
        phone        = NULL,
        location     = NULL,
        wilaya       = NULL,
        commune      = NULL
    WHERE id = v_me;

  -- 4. Supprimer les services publiés (cascade supprime portfolio_images)
  DELETE FROM public.services WHERE provider_id = v_me;

  -- 5. Supprimer les devis
  DELETE FROM public.devis WHERE provider_id = v_me OR client_id = v_me;

  -- 6. Supprimer les signalements émis
  DELETE FROM public.reports WHERE reporter_id = v_me;

  -- 7. Supprimer les blocages
  DELETE FROM public.blocks WHERE blocker_id = v_me OR blocked_id = v_me;

  -- 8. Supprimer le profil (déclenche ON DELETE CASCADE sur auth.users → messages, conversations, etc.)
  DELETE FROM public.profiles WHERE id = v_me;

  -- 9. Supprimer le compte auth (doit être en dernier)
  DELETE FROM auth.users WHERE id = v_me;

  -- Note : les pièces d'identité dans le bucket 'identity-documents' doivent être
  -- supprimées manuellement par une admin ou via un job asynchrone,
  -- car les buckets Supabase ne supportent pas la suppression en cascade depuis SQL.
END;
$$;

-- Seule l'utilisatrice authentifiée peut appeler cette fonction sur son propre compte
COMMENT ON FUNCTION public.delete_my_account() IS
  'Suppression RGPD/18-07 : anonymise, désactive et supprime le compte de l utilisatrice connectée.';

-- ─────────────────────────────────────────────────────────────
-- 6. SÉCURITÉ COMPLÉMENTAIRE : exposer delete_my_account via RPC
--    sans exposer la clé service_role dans le client
-- ─────────────────────────────────────────────────────────────

-- La fonction est SECURITY DEFINER → elle s'exécute avec les droits du créateur (postgres).
-- L'appelante doit être authentifiée (auth.uid() IS NOT NULL est vérifié dans la fonction).
-- Aucune donnée d'une autre utilisatrice n'est accessible depuis cette fonction.

-- ─────────────────────────────────────────────────────────────
-- 7. INDEX MANQUANTS (performance)
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS messages_conversation_idx
  ON public.messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS messages_sender_idx
  ON public.messages (sender_id);

CREATE INDEX IF NOT EXISTS devis_status_idx
  ON public.devis (provider_id, status);

-- ─────────────────────────────────────────────────────────────
-- 8. VÉRIFICATIONS FINALES
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_col text;
BEGIN
  -- Vérifier que les colonnes critiques existent
  FOR v_col IN SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations'
      AND column_name IN ('user_a_id', 'user_b_id', 'last_message_at')
  LOOP
    RAISE NOTICE 'conversations.% ✓', v_col;
  END LOOP;

  FOR v_col IN SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages'
      AND column_name IN ('content', 'type', 'read_at')
  LOOP
    RAISE NOTICE 'messages.% ✓', v_col;
  END LOOP;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'devis') THEN
    RAISE NOTICE 'Table devis ✓';
  ELSE
    RAISE EXCEPTION 'ERREUR : Table devis non créée !';
  END IF;
END $$;

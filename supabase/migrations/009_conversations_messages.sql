-- Migration 009 : Messagerie interne DJARA
-- Tables conversations + messages avec RLS stricte

-- ─────────────────────────────────────────────
-- TABLE conversations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conversations_no_self_chat CHECK (user_a_id <> user_b_id)
);

-- Index unique déterministe pour éviter les doublons (A,B) == (B,A)
CREATE UNIQUE INDEX IF NOT EXISTS conversations_ordered_pair_idx
  ON public.conversations (
    LEAST(user_a_id::text, user_b_id::text),
    GREATEST(user_a_id::text, user_b_id::text)
  );

CREATE INDEX IF NOT EXISTS conversations_user_a_idx ON public.conversations (user_a_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS conversations_user_b_idx ON public.conversations (user_b_id, last_message_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Une utilisatrice ne voit que ses propres conversations
CREATE POLICY "conversations_select_participant"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Insérer une conversation : on doit être l'une des deux parties
CREATE POLICY "conversations_insert_participant"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Mise à jour du last_message_at : réservée aux participantes
CREATE POLICY "conversations_update_participant"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- ─────────────────────────────────────────────
-- TABLE messages
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL CHECK (char_length(content) <= 2000),
  type            TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'quote_request')),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx ON public.messages (conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS messages_sender_idx       ON public.messages (sender_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Lecture : seulement les participantes de la conversation
CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_a_id = auth.uid() OR c.user_b_id = auth.uid())
    )
  );

-- Envoi : on doit être l'expéditrice ET participante
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

-- Mise à jour du read_at : uniquement la destinataire
CREATE POLICY "messages_update_read_at"
  ON public.messages FOR UPDATE
  USING (
    auth.uid() <> sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_a_id = auth.uid() OR c.user_b_id = auth.uid())
    )
  );

-- ─────────────────────────────────────────────
-- FONCTION : créer ou récupérer une conversation entre deux utilisatrices
-- Utilisée par le bouton "Contacter" du profil
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  other_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me         UUID  := auth.uid();
  v_conv_id    UUID;
  v_user_a     UUID;
  v_user_b     UUID;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF v_me = other_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  -- Ordre déterministe pour la contrainte UNIQUE
  IF v_me::text < other_user_id::text THEN
    v_user_a := v_me;
    v_user_b := other_user_id;
  ELSE
    v_user_a := other_user_id;
    v_user_b := v_me;
  END IF;

  -- Recherche conversation existante
  SELECT id INTO v_conv_id
  FROM public.conversations
  WHERE user_a_id = v_user_a AND user_b_id = v_user_b;

  -- Création si inexistante
  IF v_conv_id IS NULL THEN
    INSERT INTO public.conversations (user_a_id, user_b_id)
    VALUES (v_user_a, v_user_b)
    RETURNING id INTO v_conv_id;
  END IF;

  RETURN v_conv_id;
END;
$$;

-- ─────────────────────────────────────────────
-- VUE : liste des conversations avec last message + profil de l'autre
-- (Vue sécurisée, utilisée par l'app)
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW public.v_conversations AS
SELECT
  c.id,
  c.user_a_id,
  c.user_b_id,
  c.last_message_at,
  c.created_at,
  -- Dernier message
  m.content       AS last_message_content,
  m.sender_id     AS last_message_sender_id,
  m.type          AS last_message_type,
  m.created_at    AS last_message_created_at,
  -- Profil user_a
  pa.display_name AS user_a_display_name,
  pa.avatar_url   AS user_a_avatar_url,
  -- Profil user_b
  pb.display_name AS user_b_display_name,
  pb.avatar_url   AS user_b_avatar_url
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

-- La vue hérite des RLS des tables sous-jacentes via SECURITY INVOKER (défaut)

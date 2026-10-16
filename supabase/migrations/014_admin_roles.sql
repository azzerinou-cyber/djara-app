-- ============================================================
-- Migration 014 — Admin roles & permissions
-- ============================================================

-- Enum des rôles admin
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('super_admin', 'moderator', 'support');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Table des admins
CREATE TABLE IF NOT EXISTS admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        admin_role NOT NULL DEFAULT 'support',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Table des actions admin (audit log)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  target_type TEXT,          -- 'user', 'service', 'report', 'category', …
  target_id   UUID,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin   ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target  ON admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log(created_at DESC);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE admin_users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Seuls les super_admin peuvent lire la table admin_users
CREATE POLICY admin_users_read ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
    )
  );

-- Seuls les super_admin peuvent gérer les admins
CREATE POLICY admin_users_write ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
    )
  );

-- Tous les admins peuvent lire le log
CREATE POLICY admin_audit_read ON admin_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid())
  );

-- Seul le système (service_role) peut écrire dans le log
CREATE POLICY admin_audit_insert ON admin_audit_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid())
  );

-- ── Fonctions helper ─────────────────────────────────────────────────────────

-- Vérifie si l'utilisateur courant est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
$$;

-- Vérifie si l'utilisateur courant est super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Retourne le rôle de l'utilisateur courant
CREATE OR REPLACE FUNCTION get_admin_role()
RETURNS admin_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM admin_users WHERE user_id = auth.uid();
$$;

-- ── Politiques admin sur les tables existantes ────────────────────────────────

-- Les admins peuvent lire tous les profils
DROP POLICY IF EXISTS admin_read_profiles ON profiles;
CREATE POLICY admin_read_profiles ON profiles
  FOR SELECT USING (is_admin());

-- Les modérateurs peuvent suspendre un compte (is_active = false)
DROP POLICY IF EXISTS admin_update_profiles ON profiles;
CREATE POLICY admin_update_profiles ON profiles
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- Les admins peuvent lire tous les services
DROP POLICY IF EXISTS admin_read_services ON services;
CREATE POLICY admin_read_services ON services
  FOR SELECT USING (is_admin());

-- Les modérateurs peuvent mettre à jour le statut d'un service
DROP POLICY IF EXISTS admin_update_services ON services;
CREATE POLICY admin_update_services ON services
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- Les admins peuvent lire tous les signalements
DROP POLICY IF EXISTS admin_read_reports ON reports;
CREATE POLICY admin_read_reports ON reports
  FOR SELECT USING (is_admin());

-- Les modérateurs peuvent traiter les signalements
DROP POLICY IF EXISTS admin_update_reports ON reports;
CREATE POLICY admin_update_reports ON reports
  FOR UPDATE USING (is_admin())
  WITH CHECK (is_admin());

-- Les super_admin peuvent gérer les catégories
DROP POLICY IF EXISTS admin_manage_categories ON categories;
CREATE POLICY admin_manage_categories ON categories
  FOR ALL USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ── Colonne status sur reports ────────────────────────────────────────────────
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed'));
ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS admin_note  TEXT;

-- Index signalements en attente
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status) WHERE status = 'pending';

-- ── Stats admin (vue anonymisée) ──────────────────────────────────────────────
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles)                                       AS total_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at > now() - interval '7 days') AS new_users_7d,
  (SELECT COUNT(*) FROM profiles WHERE is_active = false)               AS suspended_users,
  (SELECT COUNT(*) FROM services WHERE status = 'active')               AS active_services,
  (SELECT COUNT(*) FROM services WHERE status = 'pending')              AS pending_services,
  (SELECT COUNT(*) FROM reports  WHERE status = 'pending')              AS pending_reports,
  (SELECT COUNT(*) FROM bookings)                                        AS total_bookings,
  (SELECT COUNT(*) FROM bookings WHERE created_at > now() - interval '7 days') AS bookings_7d,
  (SELECT COUNT(*) FROM reviews)                                         AS total_reviews;

-- Seuls les admins peuvent voir ces stats
DROP POLICY IF EXISTS admin_stats_read ON admin_stats; -- c'est une vue, pas de RLS directe
-- La vue hérite des politiques des tables sous-jacentes via is_admin()
GRANT SELECT ON admin_stats TO authenticated;

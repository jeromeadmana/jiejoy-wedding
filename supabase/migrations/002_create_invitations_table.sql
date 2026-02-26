-- ============================================================
-- Jie & Joy Wedding — Invitation System
-- ============================================================

-- Invitations table (one row per physical invitation)
CREATE TABLE jiejoy_invitations (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code          TEXT UNIQUE NOT NULL,
  guest_name    TEXT NOT NULL,
  max_guests    INTEGER NOT NULL DEFAULT 1 CHECK (max_guests >= 1 AND max_guests <= 10),
  rsvp_id       UUID REFERENCES jiejoy_rsvps(id),
  responded     BOOLEAN DEFAULT false NOT NULL,
  responded_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_jiejoy_invitations_code ON jiejoy_invitations(code);
CREATE INDEX idx_jiejoy_invitations_responded ON jiejoy_invitations(responded);

-- Row Level Security
ALTER TABLE jiejoy_invitations ENABLE ROW LEVEL SECURITY;

-- Public can look up invitations by code (needed for RSVP form)
CREATE POLICY "jiejoy_anyone_can_lookup_invitation"
  ON jiejoy_invitations FOR SELECT
  USING (true);

-- Service role has full access (admin API routes)
CREATE POLICY "jiejoy_service_role_invitations"
  ON jiejoy_invitations FOR ALL
  USING (auth.role() = 'service_role');

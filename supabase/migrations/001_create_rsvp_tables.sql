-- ============================================================
-- Jie & Joy Wedding — Shared Database (prefixed with jiejoy_)
-- ============================================================

-- RSVP submissions table
CREATE TABLE jiejoy_rsvps (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  attending     BOOLEAN NOT NULL,
  guest_count   INTEGER NOT NULL DEFAULT 1 CHECK (guest_count >= 0 AND guest_count <= 5),
  dietary_notes TEXT,
  message       TEXT,
  is_deleted    BOOLEAN DEFAULT false NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Guest companions (plus-ones / named guests)
CREATE TABLE jiejoy_rsvp_guests (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rsvp_id     UUID REFERENCES jiejoy_rsvps(id) NOT NULL,
  name        TEXT NOT NULL,
  is_child    BOOLEAN DEFAULT false
);

-- Admin users (simple password-based auth)
CREATE TABLE jiejoy_admin_users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username      TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT jiejoy_admin_users_username_unique UNIQUE (username)
);

-- Indexes
CREATE INDEX idx_jiejoy_rsvps_email ON jiejoy_rsvps(email);
CREATE INDEX idx_jiejoy_rsvps_attending ON jiejoy_rsvps(attending);
CREATE INDEX idx_jiejoy_rsvps_not_deleted ON jiejoy_rsvps(is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_jiejoy_rsvp_guests_rsvp_id ON jiejoy_rsvp_guests(rsvp_id);

-- Row Level Security
ALTER TABLE jiejoy_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE jiejoy_rsvp_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE jiejoy_admin_users ENABLE ROW LEVEL SECURITY;

-- Public can insert RSVPs (no auth required for wedding guests submitting)
CREATE POLICY "jiejoy_anyone_can_submit_rsvp"
  ON jiejoy_rsvps FOR INSERT
  WITH CHECK (true);

-- Public can insert guest companions
CREATE POLICY "jiejoy_anyone_can_add_guests"
  ON jiejoy_rsvp_guests FOR INSERT
  WITH CHECK (true);

-- Service role has full access (used by admin API routes)
CREATE POLICY "jiejoy_service_role_rsvps"
  ON jiejoy_rsvps FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "jiejoy_service_role_rsvp_guests"
  ON jiejoy_rsvp_guests FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "jiejoy_service_role_admin_users"
  ON jiejoy_admin_users FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION jiejoy_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jiejoy_rsvps_updated_at
  BEFORE UPDATE ON jiejoy_rsvps
  FOR EACH ROW EXECUTE FUNCTION jiejoy_update_updated_at();

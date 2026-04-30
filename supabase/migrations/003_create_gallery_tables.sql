-- ============================================================
-- Jie & Joy Wedding — Photo Gallery
-- ============================================================
-- Albums hold ordered collections of photos uploaded to Cloudinary.
-- We store cloudinary_public_id only; URLs are derived in code via
-- transform helpers so quality/sizing presets can change without
-- a data migration.

CREATE TABLE jiejoy_albums (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug            TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  cover_public_id TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT jiejoy_albums_slug_unique UNIQUE (slug),
  CONSTRAINT jiejoy_albums_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE jiejoy_photos (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id             UUID NOT NULL REFERENCES jiejoy_albums(id) ON DELETE CASCADE,
  cloudinary_public_id TEXT NOT NULL,
  width                INTEGER NOT NULL CHECK (width > 0),
  height               INTEGER NOT NULL CHECK (height > 0),
  caption              TEXT,
  sort_order           INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT jiejoy_photos_public_id_unique UNIQUE (cloudinary_public_id)
);

-- Indexes
CREATE INDEX idx_jiejoy_albums_published ON jiejoy_albums(is_published, sort_order) WHERE is_published = true;
CREATE INDEX idx_jiejoy_photos_album_order ON jiejoy_photos(album_id, sort_order);

-- Row Level Security
ALTER TABLE jiejoy_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE jiejoy_photos ENABLE ROW LEVEL SECURITY;

-- Public can read published albums
CREATE POLICY "jiejoy_public_read_published_albums"
  ON jiejoy_albums FOR SELECT
  USING (is_published = true);

-- Public can read photos belonging to published albums
CREATE POLICY "jiejoy_public_read_photos_of_published_albums"
  ON jiejoy_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jiejoy_albums
      WHERE jiejoy_albums.id = jiejoy_photos.album_id
        AND jiejoy_albums.is_published = true
    )
  );

-- Service role has full access (admin API routes)
CREATE POLICY "jiejoy_service_role_albums"
  ON jiejoy_albums FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "jiejoy_service_role_photos"
  ON jiejoy_photos FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-update updated_at on jiejoy_albums (re-uses function from migration 001)
CREATE TRIGGER jiejoy_albums_updated_at
  BEFORE UPDATE ON jiejoy_albums
  FOR EACH ROW EXECUTE FUNCTION jiejoy_update_updated_at();

-- Seed empty albums in event order. is_published=false so they don't
-- appear publicly until the admin populates and publishes each one.
INSERT INTO jiejoy_albums (slug, title, description, sort_order) VALUES
  ('engagement',    'Engagement',     'Pre-wedding portraits and the proposal.',         10),
  ('getting-ready', 'Getting Ready',  'Quiet moments before the ceremony.',              20),
  ('ceremony',      'The Ceremony',   'Vows at Our Lady of Peñafrancia Parish.',         30),
  ('portraits',     'Portraits',      'Couple and family portraits.',                    40),
  ('reception',     'The Reception',  'Toasts, dinner, and tradition at Royale Emelina.', 50),
  ('dance-floor',   'The Dance Floor','After the toasts — the celebration.',             60);

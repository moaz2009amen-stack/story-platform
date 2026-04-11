-- ════════════════════════════════════════════════════
--  قصة واختار — Supabase Database Schema
--  انسخ هذا الكود كاملاً في Supabase SQL Editor
-- ════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ════════════════════════════════════════════════════
--  1. PROFILES
-- ════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ════════════════════════════════════════════════════
--  2. STORIES
-- ════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS stories (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         JSONB NOT NULL DEFAULT '{"ar":"","en":""}',
  description   JSONB DEFAULT '{"ar":"","en":""}',
  cover_image   TEXT,
  author_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category      TEXT DEFAULT 'أخرى',
  tags          TEXT[] DEFAULT '{}',
  reading_time  INTEGER DEFAULT 5,
  scenes        JSONB NOT NULL DEFAULT '{}',
  first_scene   TEXT,
  is_published  BOOLEAN DEFAULT FALSE,
  views         INTEGER DEFAULT 0,
  likes         INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stories_author    ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(is_published);
CREATE INDEX IF NOT EXISTS idx_stories_category  ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_created   ON stories(created_at DESC);

-- Increment views function
CREATE OR REPLACE FUNCTION increment_views(story_id UUID)
RETURNS VOID AS $$
  UPDATE stories SET views = views + 1 WHERE id = story_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ════════════════════════════════════════════════════
--  3. READING HISTORY
-- ════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS reading_history (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id       UUID NOT NULL REFERENCES stories(id)  ON DELETE CASCADE,
  current_scene  TEXT,
  progress       INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  last_read      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, story_id)
);

CREATE INDEX IF NOT EXISTS idx_history_user ON reading_history(user_id);

-- ════════════════════════════════════════════════════
--  4. FAVORITES
-- ════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS favorites (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id   UUID NOT NULL REFERENCES stories(id)  ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, story_id)
);

-- ════════════════════════════════════════════════════
--  5. RATINGS
-- ════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ratings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  story_id   UUID NOT NULL REFERENCES stories(id)   ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, story_id)
);

-- ════════════════════════════════════════════════════
--  6. SETTINGS
-- ════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
  ('platform_name',    '"قصة واختار"'),
  ('allow_signup',     'true'),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- ════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings        ENABLE ROW LEVEL SECURITY;

-- ── profiles ────────────────────────────────────────

CREATE POLICY "profiles: public read"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles: own update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── stories ─────────────────────────────────────────

CREATE POLICY "stories: public read published"
  ON stories FOR SELECT
  USING (is_published = true OR auth.uid() = author_id);

CREATE POLICY "stories: auth insert"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "stories: own update"
  ON stories FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "stories: own delete"
  ON stories FOR DELETE
  USING (auth.uid() = author_id);

-- ── reading_history ──────────────────────────────────

CREATE POLICY "history: own"
  ON reading_history FOR ALL
  USING (auth.uid() = user_id);

-- ── favorites ────────────────────────────────────────

CREATE POLICY "favorites: own"
  ON favorites FOR ALL
  USING (auth.uid() = user_id);

-- ── ratings ──────────────────────────────────────────

CREATE POLICY "ratings: public read"
  ON ratings FOR SELECT USING (true);

CREATE POLICY "ratings: own write"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings: own update"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- ── settings: admin only ─────────────────────────────

CREATE POLICY "settings: public read"
  ON settings FOR SELECT USING (true);

CREATE POLICY "settings: admin update"
  ON settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ════════════════════════════════════════════════════
--  ADMIN OVERRIDE (bypass RLS for admin role)
-- ════════════════════════════════════════════════════

-- Allow admin to manage all stories
CREATE POLICY "stories: admin all"
  ON stories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ════════════════════════════════════════════════════
--  DONE ✅
--  الآن اذهب لـ Authentication > Settings
--  وفعّل Email Confirmations حسب حاجتك
-- ════════════════════════════════════════════════════

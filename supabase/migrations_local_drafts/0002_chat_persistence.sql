-- Persistent Chat (rooms + messages) with RLS and Realtime
-- Safe to re-run (IF NOT EXISTS used where possible)

BEGIN;

-- Rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid,
  user_name text NOT NULL,
  message text NOT NULL CHECK (char_length(message) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Default room
INSERT INTO chat_rooms (name)
VALUES ('global')
ON CONFLICT (name) DO NOTHING;

-- Index for fast recent lookups by room
CREATE INDEX IF NOT EXISTS chat_messages_room_created_idx
  ON chat_messages (room_id, created_at DESC);

COMMIT;

-- Ensure realtime publication exists; add messages table to it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END$$;

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- RLS Policies
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Rooms are publicly listable; manage inserts/updates server-side only
CREATE POLICY IF NOT EXISTS chat_rooms_select_all
ON chat_rooms FOR SELECT USING (true);

-- Messages readable by anyone
CREATE POLICY IF NOT EXISTS chat_messages_select_all
ON chat_messages FOR SELECT USING (true);

-- Allow inserts from anon/auth (checks happen app-side; moderation via server role if needed)
CREATE POLICY IF NOT EXISTS chat_messages_insert_any
ON chat_messages FOR INSERT WITH CHECK (auth.role() IN ('anon','authenticated'));

-- Optional retention via pg_cron (delete older than 7 days hourly)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
    PERFORM cron.schedule(
      job_name => 'purge_old_chat_messages',
      schedule => '0 * * * *',
      command => $$DELETE FROM chat_messages WHERE created_at < now() - interval '7 days';$$
    );
  END IF;
END$$;

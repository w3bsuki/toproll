BEGIN;

-- Rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id uuid,                             -- optional; null for guests
  user_name text NOT NULL,                  -- e.g., 'Guest' or steam persona
  message text NOT NULL CHECK (char_length(message) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Default room
INSERT INTO chat_rooms (id, name)
VALUES (gen_random_uuid(), 'global')
ON CONFLICT (name) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS chat_messages_room_created_idx
  ON chat_messages (room_id, created_at DESC);

COMMIT;

-- Realtime publication
-- Some projects already have this publication. Ignore errors if it exists.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END$$;

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;;

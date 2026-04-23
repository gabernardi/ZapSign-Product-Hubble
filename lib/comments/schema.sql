-- Comments schema para Neon/Postgres.
--
-- Design:
--   - Cada thread pertence a uma página (pageId, ex: "/dashboard/papeis") e
--     é ancorada em um bloco com offset (blockId + startOffset + endOffset).
--   - O texto "quote" original é persistido pra permitir fallback de âncora
--     quando o DOM muda entre deploys.
--   - Comentários pertencem a uma thread (FK com CASCADE).
--   - `thread_reads` guarda timestamp do último "visto" por usuário —
--     deriva "unread" comparando com `threads.last_activity_at`.
--
-- Convenções:
--   - TIMESTAMPTZ (Postgres já normaliza pra UTC).
--   - Reactions em JSONB: `{ "👍": ["a@x.com","b@x.com"], "❤️": [...] }`.
--   - Status em TEXT com CHECK — enum explicito sem sobrecomplicar.

CREATE TABLE IF NOT EXISTS threads (
  id                      TEXT PRIMARY KEY,
  page_id                 TEXT NOT NULL,
  anchor_block_id         TEXT NOT NULL,
  anchor_start_offset     INTEGER NOT NULL,
  anchor_end_offset       INTEGER NOT NULL,
  anchor_quote            TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open', 'resolved')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_email        TEXT NOT NULL,
  created_by_name         TEXT,
  created_by_image        TEXT,
  last_activity_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_by_email  TEXT NOT NULL,
  last_activity_by_name   TEXT,
  last_activity_by_image  TEXT
);

CREATE INDEX IF NOT EXISTS threads_page_id_idx ON threads (page_id);
CREATE INDEX IF NOT EXISTS threads_last_activity_idx
  ON threads (last_activity_at DESC);

CREATE TABLE IF NOT EXISTS comments (
  id                  TEXT PRIMARY KEY,
  thread_id           TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  body                TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_email    TEXT NOT NULL,
  created_by_name     TEXT,
  created_by_image    TEXT,
  reactions           JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS comments_thread_id_idx ON comments (thread_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx
  ON comments (thread_id, created_at);

CREATE TABLE IF NOT EXISTS thread_reads (
  thread_id   TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_email  TEXT NOT NULL,
  read_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (thread_id, user_email)
);

CREATE INDEX IF NOT EXISTS thread_reads_user_idx ON thread_reads (user_email);

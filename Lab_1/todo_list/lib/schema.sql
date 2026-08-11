-- Schema for the local-first todo application.
-- One table only: tasks. Topic and status are plain text columns constrained
-- by CHECK, since neither is user-customisable and neither needs its own table.
--
-- Deliberate omissions:
--   * There is no "overdue" column. Overdue is derived at read time from
--     due_date vs. now, and only for tasks that are not complete.
--   * There is no "archive" table. Archiving sets archived_at; the row never
--     moves and is never deleted, so archived tasks stay viewable.

CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT    NOT NULL DEFAULT '',
  due_date    TEXT,
  topic       TEXT    NOT NULL DEFAULT 'General',
  status      TEXT    NOT NULL DEFAULT 'todo'
                      CHECK (status IN ('todo', 'in_progress', 'complete')),
  archived_at TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- The active list is the hot path: filter on archived_at, order by due date.
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks (archived_at);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks (due_date);

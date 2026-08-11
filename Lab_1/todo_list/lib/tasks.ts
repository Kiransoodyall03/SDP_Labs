import { getDb } from "./db";

export const STATUSES = ["todo", "in_progress", "complete"] as const;
export type Status = (typeof STATUSES)[number];

/** Labels for the UI. The stored values stay snake_case. */
export const STATUS_LABELS: Record<Status, string> = {
  todo: "Todo",
  in_progress: "In-Progress",
  complete: "Complete",
};

/** A task exactly as it is stored. */
export type TaskRow = {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  topic: string;
  status: Status;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

/** A stored task plus the fields worked out at read time. */
export type Task = TaskRow & {
  archived: boolean;
  overdue: boolean;
};

export type TaskInput = {
  title: string;
  description?: string;
  dueDate?: string | null;
  topic?: string;
  status?: Status;
};

/** The calendar date where the user is, as YYYY-MM-DD. */
function localDate(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Overdue is worked out here rather than stored, so it can never go stale and
 * so it stays out of the three statuses. A task is overdue when its due date
 * has already passed and it is still outstanding; finished and archived tasks
 * are not chased.
 *
 * Due dates are whole days, so this compares calendar dates as strings. Reading
 * one into a Date treats "2026-08-11" as UTC midnight, which marks a task due
 * today as overdue from 02:00 local time onwards.
 */
export function isOverdue(row: TaskRow, now = new Date()): boolean {
  if (!row.due_date) return false;
  if (row.status === "complete") return false;
  if (row.archived_at) return false;

  return row.due_date < localDate(now);
}

// node:sqlite hands back null-prototype records rather than typed rows, so the
// shape is asserted in one place instead of at every call site.
function toTask(row: unknown, now = new Date()): Task {
  const stored = row as TaskRow;

  return {
    ...stored,
    archived: stored.archived_at !== null,
    overdue: isOverdue(stored, now),
  };
}

export type SortKey = "due_date" | "topic" | "status";

// Interpolated into the query, so this map is the only source of sort clauses —
// the caller's string never reaches the SQL. Every clause ends with id so the
// order is stable when the leading column ties, and undated tasks always sort
// last rather than first (SQLite puts NULL first on an ASC sort).
const DUE_DATE_ASC = "due_date IS NULL, due_date ASC";

const ORDER_BY: Record<SortKey, string> = {
  due_date: `${DUE_DATE_ASC}, id ASC`,
  topic: `topic COLLATE NOCASE ASC, ${DUE_DATE_ASC}, id ASC`,
  // Workflow order, not alphabetical: sorting the stored values would put
  // Complete at the top and Todo at the bottom.
  status: `CASE status
             WHEN 'todo' THEN 0
             WHEN 'in_progress' THEN 1
             ELSE 2
           END ASC, ${DUE_DATE_ASC}, id ASC`,
};

/**
 * The active tasks. Pass `archived: true` for the archive view — archived tasks
 * are still stored, just kept out of the active list.
 */
export function listTasks(
  opts: { sort?: SortKey; archived?: boolean } = {},
): Task[] {
  const sort = opts.sort ?? "due_date";
  const archived = opts.archived ?? false;

  const rows = getDb()
    .prepare(
      `SELECT * FROM tasks
        WHERE archived_at IS ${archived ? "NOT NULL" : "NULL"}
        ORDER BY ${ORDER_BY[sort]}`,
    )
    .all();

  // One timestamp for the whole list, so every row is judged against the same
  // instant. Passing toTask straight to map would hand it the array index.
  const now = new Date();
  return rows.map((row) => toTask(row, now));
}

export function getTask(id: number): Task | null {
  const row = getDb().prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  return row ? toTask(row) : null;
}

export function createTask(input: TaskInput): Task {
  const info = getDb()
    .prepare(
      `INSERT INTO tasks (title, description, due_date, topic, status)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      input.title.trim(),
      input.description?.trim() ?? "",
      input.dueDate || null,
      input.topic?.trim() || "General",
      input.status ?? "todo",
    );

  return getTask(Number(info.lastInsertRowid))!;
}

/** Overwrites every editable field, so the caller must send the full task. */
export function updateTask(id: number, input: TaskInput): Task | null {
  getDb()
    .prepare(
      `UPDATE tasks
          SET title = ?, description = ?, due_date = ?, topic = ?,
              status = ?, updated_at = datetime('now')
        WHERE id = ?`,
    )
    .run(
      input.title.trim(),
      input.description?.trim() ?? "",
      input.dueDate || null,
      input.topic?.trim() || "General",
      input.status ?? "todo",
      id,
    );

  return getTask(id);
}

/**
 * Archiving is a timestamp on the row, not a delete: the task drops out of the
 * active list but stays readable, which is why there is no deleteTask.
 */
export function archiveTask(id: number): Task | null {
  getDb()
    .prepare(
      `UPDATE tasks SET archived_at = datetime('now'),
                        updated_at = datetime('now')
        WHERE id = ?`,
    )
    .run(id);

  return getTask(id);
}

export function unarchiveTask(id: number): Task | null {
  getDb()
    .prepare(
      `UPDATE tasks SET archived_at = NULL, updated_at = datetime('now')
        WHERE id = ?`,
    )
    .run(id);

  return getTask(id);
}

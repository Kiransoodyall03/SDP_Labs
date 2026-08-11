import { getDb } from "./db";

export const STATUSES = ["todo", "in_progress", "complete"] as const;
export type Status = (typeof STATUSES)[number];

/** Labels for the UI. The stored values stay snake_case. */
export const STATUS_LABELS: Record<Status, string> = {
  todo: "Todo",
  in_progress: "In-Progress",
  complete: "Complete",
};

/** A task as it is stored. */
export type Task = {
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

export type TaskInput = {
  title: string;
  description?: string;
  dueDate?: string | null;
  topic?: string;
  status?: Status;
};

// node:sqlite hands back null-prototype records rather than typed rows, so the
// shape is asserted in one place instead of at every call site.
function toTask(row: unknown): Task {
  return { ...(row as Task) };
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

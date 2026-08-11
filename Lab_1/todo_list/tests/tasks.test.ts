import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

// Point the data layer at a throwaway database before it is imported, so the
// tests never read or write the developer's own todo.db.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "todo-test-"));
process.env.TODO_DB_PATH = path.join(tmpDir, "test.db");

const { getDb } = await import("../lib/db");
const {
  STATUSES,
  archiveTask,
  createTask,
  getTask,
  isOverdue,
  listTasks,
  unarchiveTask,
  updateTask,
} = await import("../lib/tasks");

beforeEach(() => {
  getDb().exec("DELETE FROM tasks");
});

afterAll(() => {
  getDb().close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

/** A date offset from today, as the YYYY-MM-DD a date input would submit. */
function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

describe("creating and editing", () => {
  it("stores all four fields and reads them back", () => {
    const created = createTask({
      title: "Write lab report",
      description: "Sections 1 and 2",
      dueDate: "2026-09-01",
      topic: "COMS3011A",
    });

    const found = getTask(created.id)!;
    expect(found.title).toBe("Write lab report");
    expect(found.description).toBe("Sections 1 and 2");
    expect(found.due_date).toBe("2026-09-01");
    expect(found.topic).toBe("COMS3011A");
    expect(found.status).toBe("todo");
  });

  it("keeps an edit, and leaves created_at alone", () => {
    const created = createTask({ title: "Draft", topic: "Admin" });

    updateTask(created.id, {
      title: "Draft v2",
      description: "with notes",
      dueDate: "2026-10-05",
      topic: "Admin",
      status: "in_progress",
    });

    const found = getTask(created.id)!;
    expect(found.title).toBe("Draft v2");
    expect(found.description).toBe("with notes");
    expect(found.due_date).toBe("2026-10-05");
    expect(found.status).toBe("in_progress");
    expect(found.created_at).toBe(created.created_at);
  });
});

describe("archiving", () => {
  it("takes the task off the active list but keeps it readable", () => {
    const kept = createTask({ title: "Keep me", topic: "Admin" });
    const gone = createTask({ title: "Archive me", topic: "Admin" });

    archiveTask(gone.id);

    expect(listTasks().map((t) => t.title)).toEqual(["Keep me"]);
    expect(listTasks({ archived: true }).map((t) => t.title)).toEqual([
      "Archive me",
    ]);

    // Archiving is not a delete: the row is still there, with a timestamp.
    const found = getTask(gone.id)!;
    expect(found.title).toBe("Archive me");
    expect(found.archived).toBe(true);
    expect(found.archived_at).not.toBeNull();
    expect(getTask(kept.id)!.archived).toBe(false);
  });

  it("puts a restored task back on the active list", () => {
    const task = createTask({ title: "Back again", topic: "Admin" });

    archiveTask(task.id);
    unarchiveTask(task.id);

    expect(listTasks().map((t) => t.title)).toEqual(["Back again"]);
    expect(listTasks({ archived: true })).toEqual([]);
    expect(getTask(task.id)!.archived_at).toBeNull();
  });
});

describe("the overdue rule", () => {
  // A fixed clock, so these cases do not depend on when the suite runs.
  const now = new Date(2026, 7, 11, 22, 30);

  const row = (due: string | null, over: Partial<{ status: string }> = {}) => ({
    id: 1,
    title: "t",
    description: "",
    due_date: due,
    topic: "General",
    status: "todo",
    archived_at: null,
    created_at: "2026-08-01 08:00:00",
    updated_at: "2026-08-01 08:00:00",
    ...over,
  });

  it("flags a due date that has passed", () => {
    expect(isOverdue(row("2026-08-10") as never, now)).toBe(true);
  });

  it("does not flag a task due today, whatever the time of day", () => {
    expect(isOverdue(row("2026-08-11") as never, now)).toBe(false);
  });

  it("does not flag completed, archived, future or undated tasks", () => {
    expect(isOverdue(row("2026-08-10", { status: "complete" }) as never, now))
      .toBe(false);
    expect(
      isOverdue(
        { ...row("2026-08-10"), archived_at: "2026-08-11 09:00:00" } as never,
        now,
      ),
    ).toBe(false);
    expect(isOverdue(row("2026-08-12") as never, now)).toBe(false);
    expect(isOverdue(row(null) as never, now)).toBe(false);
  });

  it("reaches the list as a derived flag", () => {
    createTask({ title: "Late", dueDate: daysFromToday(-3) });
    createTask({ title: "Soon", dueDate: daysFromToday(3) });

    const byTitle = Object.fromEntries(
      listTasks().map((t) => [t.title, t.overdue]),
    );
    expect(byTitle).toEqual({ Late: true, Soon: false });
  });

  it("is not one of the storable statuses", () => {
    expect(STATUSES).toEqual(["todo", "in_progress", "complete"]);
    expect(() =>
      getDb()
        .prepare("INSERT INTO tasks (title, status) VALUES (?, ?)")
        .run("Bad", "overdue"),
    ).toThrow();
  });
});

describe("sorting", () => {
  beforeEach(() => {
    createTask({
      title: "B",
      topic: "Zoology",
      dueDate: "2026-08-20",
      status: "complete",
    });
    createTask({
      title: "A",
      topic: "admin",
      dueDate: "2026-09-05",
      status: "in_progress",
    });
    createTask({
      title: "C",
      topic: "Maths",
      dueDate: "2026-08-25",
      status: "todo",
    });
    createTask({ title: "D", topic: "Maths", status: "todo" });
  });

  it("sorts by due date, undated last", () => {
    expect(listTasks({ sort: "due_date" }).map((t) => t.title)).toEqual([
      "B",
      "C",
      "A",
      "D",
    ]);
  });

  it("sorts by topic, ignoring case", () => {
    expect(listTasks({ sort: "topic" }).map((t) => t.title)).toEqual([
      "A",
      "C",
      "D",
      "B",
    ]);
  });

  it("sorts by status in workflow order, not alphabetically", () => {
    expect(listTasks({ sort: "status" }).map((t) => t.title)).toEqual([
      "C",
      "D",
      "A",
      "B",
    ]);
  });
});

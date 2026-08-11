"use server";

import { revalidatePath } from "next/cache";
import {
  createTask,
  updateTask,
  STATUSES,
  type Status,
  type TaskInput,
} from "@/lib/tasks";

function parseStatus(value: FormDataEntryValue | null): Status {
  const s = String(value ?? "todo");
  return (STATUSES as readonly string[]).includes(s) ? (s as Status) : "todo";
}

/** Form fields are all strings; empty ones become null or a default. */
function readForm(formData: FormData): TaskInput {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    dueDate: String(formData.get("dueDate") ?? "") || null,
    topic: String(formData.get("topic") ?? ""),
    status: parseStatus(formData.get("status")),
  };
}

export async function createTaskAction(formData: FormData) {
  const input = readForm(formData);
  // A task with no title is not worth storing; the form also marks it required.
  if (!input.title.trim()) return;

  createTask(input);
  // Without this the client router keeps its cached copy of the page and the
  // new task only shows up after a manual reload.
  revalidatePath("/");
}

export async function updateTaskAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const input = readForm(formData);
  if (!input.title.trim()) return;

  updateTask(id, input);
  revalidatePath("/");
}

import { STATUSES, STATUS_LABELS, type Task } from "@/lib/tasks";

/**
 * The four fields a task carries, plus its status. Posts straight to a server
 * action — no client-side state, so nothing to keep in sync.
 *
 * Used for both creating and editing: pass `task` to prefill the fields, which
 * also sends the id along so the action knows which row to update.
 */
export function TaskForm({
  action,
  task,
  submitLabel = "Add task",
}: {
  action: (formData: FormData) => void | Promise<void>;
  task?: Task;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-3">
      {task && <input type="hidden" name="id" value={task.id} />}

      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          name="title"
          required
          defaultValue={task?.title}
          placeholder="What needs doing?"
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          name="description"
          rows={2}
          defaultValue={task?.description}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Due date
          <input
            type="date"
            name="dueDate"
            defaultValue={task?.due_date ?? ""}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Topic
          <input
            name="topic"
            defaultValue={task?.topic}
            placeholder="General"
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Status
          <select
            name="status"
            defaultValue={task?.status ?? "todo"}
            className="rounded border border-gray-300 px-3 py-2"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="self-start rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}

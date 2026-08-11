import { STATUSES, STATUS_LABELS } from "@/lib/tasks";

/**
 * The four fields a task carries, plus its status. Posts straight to a server
 * action — no client-side state, so nothing to keep in sync.
 */
export function TaskForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          name="title"
          required
          placeholder="What needs doing?"
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          name="description"
          rows={2}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Due date
          <input
            type="date"
            name="dueDate"
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Topic
          <input
            name="topic"
            placeholder="General"
            className="rounded border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Status
          <select
            name="status"
            defaultValue="todo"
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
        Add task
      </button>
    </form>
  );
}

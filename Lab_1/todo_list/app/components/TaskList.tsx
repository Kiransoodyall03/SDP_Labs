import Link from "next/link";
import { STATUS_LABELS, type Task } from "@/lib/tasks";
import { archiveTaskAction, unarchiveTaskAction } from "@/app/actions";

function formatDate(value: string | null) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TaskList({
  tasks,
  archived = false,
}: {
  tasks: Task[];
  /** The archive view swaps Edit/Archive for a single Restore button. */
  archived?: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <p className="rounded border border-dashed border-gray-300 p-6 text-center text-gray-500">
        {archived ? "Nothing archived yet." : "No tasks yet. Add one above."}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <li key={task.id} className="rounded border border-gray-300 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium">{task.title}</h3>

              {task.description && (
                <p className="mt-1 text-sm text-gray-600">{task.description}</p>
              )}

              <p className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                <span>Topic: {task.topic}</span>
                <span>Status: {STATUS_LABELS[task.status]}</span>
                <span>Due: {formatDate(task.due_date)}</span>
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-sm">
              {archived ? (
                <form action={unarchiveTaskAction}>
                  <input type="hidden" name="id" value={task.id} />
                  <button className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-100">
                    Restore
                  </button>
                </form>
              ) : (
                <>
                  <Link
                    href={`/tasks/${task.id}/edit`}
                    className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-100"
                  >
                    Edit
                  </Link>
                  <form action={archiveTaskAction}>
                    <input type="hidden" name="id" value={task.id} />
                    <button className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-100">
                      Archive
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

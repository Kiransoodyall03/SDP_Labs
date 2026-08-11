import Link from "next/link";
import { STATUS_LABELS, type Task } from "@/lib/tasks";

function formatDate(value: string | null) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded border border-dashed border-gray-300 p-6 text-center text-gray-500">
        No tasks yet. Add one above.
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

            <Link
              href={`/tasks/${task.id}/edit`}
              className="shrink-0 rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-100"
            >
              Edit
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

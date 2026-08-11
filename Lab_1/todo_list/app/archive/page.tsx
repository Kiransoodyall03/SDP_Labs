import Link from "next/link";
import { listTasks } from "@/lib/tasks";
import { TaskList } from "../components/TaskList";

export default function ArchivePage() {
  const tasks = listTasks({ archived: true });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Archive</h1>
        <Link href="/" className="text-sm underline">
          Back to tasks
        </Link>
      </header>

      <p className="text-sm text-gray-500">
        Archived tasks are kept, never deleted. Restore one to put it back on
        the active list.
      </p>

      <section>
        <TaskList tasks={tasks} archived />
      </section>
    </main>
  );
}

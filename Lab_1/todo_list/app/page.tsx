import Link from "next/link";
import { listTasks, type SortKey } from "@/lib/tasks";
import { createTaskAction } from "./actions";
import { TaskForm } from "./components/TaskForm";
import { SortBar, TaskList } from "./components/TaskList";

const VALID_SORTS: SortKey[] = ["due_date", "topic", "status"];

/** Anything unrecognised in ?sort= falls back to the default. */
function parseSort(value: string | undefined): SortKey {
  return VALID_SORTS.includes(value as SortKey) ? (value as SortKey) : "due_date";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const sort = parseSort((await searchParams).sort);
  const tasks = listTasks({ sort, archived: false });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <Link href="/archive" className="text-sm underline">
          View archive
        </Link>
      </header>

      <section className="rounded border border-gray-300 p-4">
        <h2 className="mb-3 font-medium">New task</h2>
        <TaskForm action={createTaskAction} />
      </section>

      <section className="flex flex-col gap-3">
        <SortBar sort={sort} basePath="/" />
        <TaskList tasks={tasks} />
      </section>
    </main>
  );
}

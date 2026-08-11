import Link from "next/link";
import { listTasks, type SortKey } from "@/lib/tasks";
import { SortBar, TaskList } from "../components/TaskList";

const VALID_SORTS: SortKey[] = ["due_date", "topic", "status"];

function parseSort(value: string | undefined): SortKey {
  return VALID_SORTS.includes(value as SortKey) ? (value as SortKey) : "due_date";
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const sort = parseSort((await searchParams).sort);
  const tasks = listTasks({ sort, archived: true });

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

      <section className="flex flex-col gap-3">
        <SortBar sort={sort} basePath="/archive" />
        <TaskList tasks={tasks} archived />
      </section>
    </main>
  );
}

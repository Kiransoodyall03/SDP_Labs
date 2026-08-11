import Link from "next/link";
import { notFound } from "next/navigation";
import { getTask } from "@/lib/tasks";
import { updateTaskAction } from "@/app/actions";
import { TaskForm } from "@/app/components/TaskForm";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = getTask(Number(id));

  if (!task) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Edit task</h1>
        <Link href="/" className="text-sm underline">
          Cancel
        </Link>
      </header>

      <section className="rounded border border-gray-300 p-4">
        <TaskForm
          action={updateTaskAction}
          task={task}
          submitLabel="Save changes"
        />
      </section>
    </main>
  );
}

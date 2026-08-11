import { listTasks } from "@/lib/tasks";
import { createTaskAction } from "./actions";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";

export default function Home() {
  const tasks = listTasks();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>

      <section className="rounded border border-gray-300 p-4">
        <h2 className="mb-3 font-medium">New task</h2>
        <TaskForm action={createTaskAction} />
      </section>

      <section>
        <TaskList tasks={tasks} />
      </section>
    </main>
  );
}

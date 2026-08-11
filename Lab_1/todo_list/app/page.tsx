import { createTaskAction } from "./actions";
import { TaskForm } from "./components/TaskForm";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>

      <section className="rounded border border-gray-300 p-4">
        <h2 className="mb-3 font-medium">New task</h2>
        <TaskForm action={createTaskAction} />
      </section>
    </main>
  );
}

import { TaskItem } from '@/components/tasks/TaskItem'
import type { Task } from '@/types/task'

type TaskListProps = {
  tasks: Task[]
  error: string | null
}

// Veriyi kendisi cekmiyor ve sadece props ile aliyor.
// Bu sayede TaskList'i server component olarak kullanabiliyoruz.
export function TaskList({ tasks, error }: TaskListProps) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
      >
        {error}
      </p>
    )
  }

  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/15 px-4 py-8 text-center text-sm opacity-60 dark:border-white/20">
        Henüz bir iş eklemedin. Yukarıdaki formla başlayabilirsin.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}

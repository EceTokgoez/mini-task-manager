import { TaskItem } from '@/components/tasks/TaskItem'
import type { SharedTask } from '@/types/task'

type TaskListProps = {
  tasks: SharedTask[]
  error: string | null
  isFiltered: boolean
  readOnly?: boolean
  // Paylasim sayfasindaki ziyaretciye "yukaridaki formla ekle" demek anlamsiz
  // olurdu; bos liste metni disaridan verilebiliyor.
  emptyMessage?: string
}

// Veriyi kendisi cekmiyor ve sadece props ile aliyor.
// Bu sayede TaskList'i server component olarak kullanabiliyoruz.
export function TaskList({
  tasks,
  error,
  isFiltered,
  readOnly = false,
  emptyMessage,
}: TaskListProps) {
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

  // Bos liste iki farkli sey anlatabilir: hic is yok ya da filtreye uyan is
  // yok. Ayni mesaji verirsek kullanici filtreyi unutup isleri kayboldu sanar.
  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/15 px-4 py-8 text-center text-sm opacity-60 dark:border-white/20">
        {emptyMessage ??
          (isFiltered
            ? 'Bu filtreye uyan iş yok.'
            : 'Henüz bir iş eklemedin. Yukarıdaki formla başlayabilirsin.')}
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} readOnly={readOnly} />
      ))}
    </ul>
  )
}

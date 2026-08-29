import { TaskDeleteButton } from '@/components/tasks/TaskDeleteButton'
import { TaskStatusSelect } from '@/components/tasks/TaskStatusSelect'
import { PRIORITY_LABELS, type Task, type TaskPriority } from '@/types/task'

// react component olarak TaskItem'i ayri bir dosyaya tasidik ki, TaskList'de map ile render ederken
// her bir TaskItem kendi state'ini tutabilsin.

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  low: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  high: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function TaskItem({ task }: { task: Task }) {
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-black/10 p-4 dark:border-white/15">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h3
          className={`font-medium ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
        >
          {task.title}
        </h3>

        <div className="flex shrink-0 items-start gap-2">
          <TaskStatusSelect taskId={task.id} status={task.status} />
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE[task.priority]}`}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
      </div>

      {task.description ? (
        <p className="text-sm whitespace-pre-line opacity-70">{task.description}</p>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <time dateTime={task.created_at} className="text-xs opacity-50">
          {dateFormatter.format(new Date(task.created_at))}
        </time>

        <TaskDeleteButton taskId={task.id} />
      </div>
    </li>
  )
}

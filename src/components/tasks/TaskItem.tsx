import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '@/types/task'

// react component olarak TaskItem'i ayri bir dosyaya tasidik ki, TaskList'de map ile render ederken
// her bir TaskItem kendi state'ini tutabilsin.

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  low: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  high: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

const STATUS_BADGE: Record<TaskStatus, string> = {
  todo: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  done: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
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

        <div className="flex shrink-0 gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[task.status]}`}
          >
            {STATUS_LABELS[task.status]}
          </span>
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

      <time dateTime={task.created_at} className="text-xs opacity-50">
        {dateFormatter.format(new Date(task.created_at))}
      </time>
    </li>
  )
}

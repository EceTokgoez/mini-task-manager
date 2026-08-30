import { TaskDeleteButton } from '@/components/tasks/TaskDeleteButton'
import { TaskStatusSelect } from '@/components/tasks/TaskStatusSelect'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type SharedTask,
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

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

// due_date bir date kolonu, yani saat bilgisi yok. Bu yuzden Date nesnesine
// cevirip karsilastirmak yerine 'YYYY-MM-DD' dizgilerini karsilastiriyoruz —
// bu format sozluk sirasinda da kronolojik sirali oldugu icin dogru sonuc verir
// ve araya saat dilimi cevrimi girmez.
function isOverdue(task: SharedTask): boolean {
  if (!task.due_date) {
    return false
  }

  // Tamamlanmis bir isi geciken olarak isaretlemek yaniltici olurdu.
  if (task.status === 'done') {
    return false
  }

  const today = new Date().toISOString().slice(0, 10)

  return task.due_date < today
}

const STATUS_BADGE: Record<TaskStatus, string> = {
  todo: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  done: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
}

type TaskItemProps = {
  // Task degil SharedTask: bu component user_id'yi hic kullanmiyor, o yuzden
  // daha dar olan tipi istiyor. Task zaten bu sekle uydugu icin ikisi de gecer.
  task: SharedTask
  // Paylasim sayfasinda durum degistirme ve silme yok; durum salt okunur
  // bir rozet olarak gosteriliyor.
  readOnly?: boolean
}

export function TaskItem({ task, readOnly = false }: TaskItemProps) {
  const overdue = isOverdue(task)

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-black/10 p-4 dark:border-white/15">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h3
          className={`font-medium break-words ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
        >
          {task.title}
        </h3>

        <div className="flex shrink-0 items-start gap-2">
          {readOnly ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[task.status]}`}
            >
              {STATUS_LABELS[task.status]}
            </span>
          ) : (
            <TaskStatusSelect taskId={task.id} status={task.status} />
          )}
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

      {task.due_date ? (
        <p
          className={`flex items-center gap-1.5 text-xs ${
            overdue
              ? 'font-medium text-red-600 dark:text-red-400'
              : 'opacity-60'
          }`}
        >
          <span aria-hidden="true">{overdue ? '⚠' : '📅'}</span>
          <span>
            Son tarih:{' '}
            <time dateTime={task.due_date}>
              {dateFormatter.format(new Date(`${task.due_date}T00:00:00`))}
            </time>
          </span>
          {/* Renk tek basina anlam tasimamali; gecikmeyi yaziyla da soyluyoruz. */}
          {overdue ? <span>— gecikti</span> : null}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <time dateTime={task.created_at} className="text-xs opacity-50">
          {dateFormatter.format(new Date(task.created_at))}
        </time>

        {readOnly ? null : <TaskDeleteButton taskId={task.id} />}
      </div>
    </li>
  )
}

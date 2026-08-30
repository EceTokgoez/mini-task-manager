'use client'

import { useState, useTransition } from 'react'

import { updateTaskStatus } from '@/actions/tasks'
import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from '@/types/task'

type TaskStatusSelectProps = {
  taskId: string
  status: TaskStatus
}

const STATUS_STYLE: Record<TaskStatus, string> = {
  todo: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  done: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
}

export function TaskStatusSelect({ taskId, status }: TaskStatusSelectProps) {
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState<TaskStatus>(status)
  const [error, setError] = useState<string | null>(null)

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const previous = value
    const next = event.target.value as TaskStatus

    // Once ekranda degistiriyoruz ki secim aninda tepki versin; sunucu
    // reddederse asagida eski degere geri donuyoruz.
    setValue(next)
    setError(null)

    startTransition(async () => {
      const result = await updateTaskStatus(taskId, next)

      if (result.error) {
        setValue(previous)
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="sr-only" htmlFor={`status-${taskId}`}>
        Durum
      </label>
      <select
        id={`status-${taskId}`}
        value={value}
        onChange={handleChange}
        disabled={isPending}
        className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-black/30 disabled:opacity-50 dark:focus-visible:ring-white/40 ${STATUS_STYLE[value]}`}
      >
        {TASK_STATUSES.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABELS[option]}
          </option>
        ))}
      </select>

      {error ? (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : null}
    </div>
  )
}

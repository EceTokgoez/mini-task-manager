'use client'

import { useOptimistic, useState, useTransition } from 'react'

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
  const [error, setError] = useState<string | null>(null)

  // useState degil useOptimistic: useState'in baslangic degeri yalnizca ilk
  // montajda okunur, dolayisiyla Realtime ya da revalidate sonrasi gelen yeni
  // status prop'u ekrana yansimazdi -- baska bir sekmede durum degistiginde
  // select eski degerinde takili kalirdi.
  //
  // useOptimistic gecici degeri yalnizca transition suresince tutuyor, sonra
  // gercek prop'a donuyor. Bu iki sey birden sagliyor: secim aninda tepki
  // (istek beklenmeden) ve sunucu reddederse otomatik geri alma -- elle
  // "onceki degeri sakla, hatada geri koy" yazmaya gerek kalmiyor.
  const [value, setOptimisticValue] = useOptimistic(status)

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as TaskStatus

    setError(null)

    startTransition(async () => {
      setOptimisticValue(next)

      const result = await updateTaskStatus(taskId, next)

      if (result.error) {
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

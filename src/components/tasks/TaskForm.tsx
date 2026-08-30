'use client'

import { useActionState, useEffect, useRef } from 'react'

import { createTask, type TaskFormState } from '@/actions/tasks'
import { PRIORITY_LABELS, TASK_PRIORITIES } from '@/types/task'

const initialState: TaskFormState = { error: null, success: false }

const fieldClassName =
  'rounded-lg border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-black/50 disabled:opacity-60 dark:border-white/20 dark:focus:border-white/60'

export function TaskForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(createTask, initialState)

  // Kayit basariliysa formu bosaltmak icin useEffect kullanıyoruz.
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-black/10 p-4 dark:border-white/15"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Başlık</span>
        <input
          type="text"
          name="title"
          required
          maxLength={120}
          placeholder="Ne yapman gerekiyor?"
          disabled={isPending}
          className={fieldClassName}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Açıklama</span>
        <textarea
          name="description"
          rows={3}
          maxLength={500}
          placeholder="İstersen detay ekle"
          disabled={isPending}
          className={`${fieldClassName} resize-y`}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Son tarih</span>
        <input
          type="date"
          name="due_date"
          disabled={isPending}
          className={fieldClassName}
        />
        <span className="text-xs opacity-60">İstersen boş bırakabilirsin.</span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Öncelik</span>
        <select
          name="priority"
          defaultValue="medium"
          disabled={isPending}
          className={fieldClassName}
        >
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </label>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? 'Ekleniyor...' : 'İş ekle'}
      </button>
    </form>
  )
}

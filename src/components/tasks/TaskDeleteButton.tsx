'use client'

import { useState, useTransition } from 'react'

import { deleteTask } from '@/actions/tasks'

export function TaskDeleteButton({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition()
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    setError(null)

    startTransition(async () => {
      const result = await deleteTask(taskId)

      if (result.error) {
        setError(result.error)
        setIsConfirming(false)
      }
      // Silme basarili olursa TaskList server component'i yeniden render edecek ve bu button kaybolacak. 

    })
  }

  // Eger silme onayi alindiysa, kullaniciya iki secenek sunuyoruz.
  if (isConfirming) {
    return (
      <div className="-mr-2 flex items-center gap-1 text-xs">
        <span className="opacity-60">Silinsin mi?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="px-2 py-1.5 font-medium text-red-600 underline underline-offset-2 disabled:opacity-50 dark:text-red-400"
        >
          {isPending ? 'Siliniyor...' : 'Evet'}
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          disabled={isPending}
          className="px-2 py-1.5 opacity-60 underline underline-offset-2 disabled:opacity-50"
        >
          Vazgeç
        </button>
      </div>
    )
  }

  return (
    <div className="-mr-2 flex items-center gap-1 text-xs">
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="px-2 py-1.5 opacity-60 transition-opacity hover:text-red-600 hover:opacity-100 dark:hover:text-red-400"
      >
        Sil
      </button>

      {error ? (
        <span role="alert" className="text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : null}
    </div>
  )
}

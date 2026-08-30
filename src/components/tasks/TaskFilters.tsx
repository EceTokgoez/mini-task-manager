'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '@/types/task'

const selectClassName =
  'rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/50 disabled:opacity-60 dark:border-white/20 dark:focus:border-white/60'

export function TaskFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const status = searchParams.get('status') ?? ''
  const priority = searchParams.get('priority') ?? ''
  const hasFilters = status !== '' || priority !== ''

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams)

    // Bos secim filtreyi kaldirmali, yoksa URL'de "?status=" gibi anlamsiz
    // bir parametre kalir.
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

// user filtreyi degistirdiginde sayfa yeniden render ediliyor, bu yuzden
// router.replace()'i startTransition() icine aliyoruz ki UI donuk kalmasin.
    startTransition(() => {
      router.replace(params.size > 0 ? `${pathname}?${params}` : pathname, {
        scroll: false,
      })
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        <span className="opacity-60">Durum</span>
        <select
          value={status}
          onChange={(event) => setFilter('status', event.target.value)}
          disabled={isPending}
          className={selectClassName}
        >
          <option value="">Hepsi</option>
          {TASK_STATUSES.map((option) => (
            <option key={option} value={option}>
              {STATUS_LABELS[option]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <span className="opacity-60">Öncelik</span>
        <select
          value={priority}
          onChange={(event) => setFilter('priority', event.target.value)}
          disabled={isPending}
          className={selectClassName}
        >
          <option value="">Hepsi</option>
          {TASK_PRIORITIES.map((option) => (
            <option key={option} value={option}>
              {PRIORITY_LABELS[option]}
            </option>
          ))}
        </select>
      </label>

      {hasFilters ? (
        <button
          type="button"
          onClick={() =>
            startTransition(() => router.replace(pathname, { scroll: false }))
          }
          disabled={isPending}
          className="text-sm underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100 disabled:opacity-40"
        >
          Filtreleri temizle
        </button>
      ) : null}
    </div>
  )
}

import { TaskListSkeleton } from '@/components/tasks/TaskListSkeleton'

// Suspense fallback'i TasksLoading component'i. TasksPage'de Suspense ile sarmalanmis parcayi
// beklerken goruntuleniyor. TasksPage'in geri kalani (baslik, form, filtreler) hemen goruntuleniyor.
export default function TasksLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <div className="h-8 w-40 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      <div className="mt-8 h-56 animate-pulse rounded-xl bg-black/5 dark:bg-white/5" />
      <div className="mt-8">
        <TaskListSkeleton />
      </div>
    </main>
  )
}

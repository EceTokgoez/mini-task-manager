import { TaskListSkeleton } from '@/components/tasks/TaskListSkeleton'
import { PageContainer } from '@/components/ui/PageContainer'

// Suspense fallback'i TasksLoading component'i. TasksPage'de Suspense ile sarmalanmis parcayi
// beklerken goruntuleniyor. TasksPage'in geri kalani (baslik, form, filtreler) hemen goruntuleniyor.
export default function TasksLoading() {
  return (
    <PageContainer>
      <div className="h-8 w-40 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      <div className="mt-8 h-56 animate-pulse rounded-xl bg-black/5 dark:bg-white/5" />
      <div className="mt-8">
        <TaskListSkeleton />
      </div>
    </PageContainer>
  )
}

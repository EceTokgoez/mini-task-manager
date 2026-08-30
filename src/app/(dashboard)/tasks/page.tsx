import { redirect } from 'next/navigation'

import { signOut } from '@/actions/auth'
import { getTasks } from '@/actions/tasks'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskList } from '@/components/tasks/TaskList'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'İşlerim' }

// PageProps<'/tasks'>, yani searchParams'in tipini '/tasks' rotasina gore aliyoruz.
function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function TasksPage({ searchParams }: PageProps<'/tasks'>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware zaten koruyor ama user'a burada da ihtiyacımız var,
  // yoksa TypeScript'e göre null olabilir.
  if (!user) {
    redirect('/login')
  }

  const { status, priority } = await searchParams
  const filters = {
    status: firstValue(status),
    priority: firstValue(priority),
  }

  const { tasks, error } = await getTasks(filters)
  const isFiltered = Boolean(filters.status || filters.priority)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">İşlerim</h1>
          <p className="text-sm opacity-60">{user.email}</p>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="rounded-lg border border-black/15 px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Çıkış yap
          </button>
        </form>
      </header>

      <section className="mt-8">
        <h2 className="sr-only">Yeni iş ekle</h2>
        <TaskForm />
      </section>

      <section className="mt-8">
        <h2 className="sr-only">İşler</h2>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TaskFilters />
          <span className="text-sm opacity-60">{tasks.length} iş</span>
        </div>

        <TaskList tasks={tasks} error={error} isFiltered={isFiltered} />
      </section>
    </main>
  )
}

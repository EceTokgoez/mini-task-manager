import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { signOut } from '@/actions/auth'
import { getShareToken } from '@/actions/shares'
import { getTasks, type TaskFilters as Filters } from '@/actions/tasks'
import { TaskFilters } from '@/components/tasks/TaskFilters'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskList } from '@/components/tasks/TaskList'
import { ShareLinkPanel } from '@/components/tasks/ShareLinkPanel'
import { TaskListSkeleton } from '@/components/tasks/TaskListSkeleton'
import { TaskRealtime } from '@/components/tasks/TaskRealtime'
import { PageContainer } from '@/components/ui/PageContainer'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'İşlerim' }

// Ayni parametre URL'de birden fazla kez gecebiliyor (?status=todo&status=done),
// o zaman Next dizi veriyor. Filtrelerde tek deger bekliyoruz, ilkini aliyoruz.
function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

// Veri ceken kismi ayri bir component'e aldik ki Suspense sadece bu parcayi
// beklesin. Sayfanin geri kalani (baslik, form, filtreler) hemen goruntuleniyor.
async function TaskSection({ filters }: { filters: Filters }) {
  const { tasks, error } = await getTasks(filters)
  const isFiltered = Boolean(filters.status || filters.priority)

  return (
    <>
      <p className="mb-3 text-sm opacity-60">{tasks.length} iş</p>
      <TaskList tasks={tasks} error={error} isFiltered={isFiltered} />
    </>
  )
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

  const { token: shareToken } = await getShareToken()

  // Paylasim adresini istek basliklarindan uretiyoruz: hem localhost'ta hem
  // Vercel'de dogru calisiyor, ayri bir ortam degiskeni gerekmiyor.
  // Vercel ters vekil arkasinda oldugu icin protokol x-forwarded-proto'dan.
  const headerList = await headers()
  const host = headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') ?? 'http'
  const shareUrl =
    shareToken && host ? `${protocol}://${host}/share/${shareToken}` : null

  const { status, priority } = await searchParams
  const filters: Filters = {
    status: firstValue(status),
    priority: firstValue(priority),
  }

  return (
    <PageContainer>
      <TaskRealtime userId={user.id} />

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

        <div className="mb-4">
          <TaskFilters />
        </div>

        {/* key filtre degisince degisiyor; React eski agaci atip Suspense'i
            yeniden tetikliyor, boylece her filtrede iskelet goruluyor. */}
        <Suspense
          key={`${filters.status ?? ''}-${filters.priority ?? ''}`}
          fallback={<TaskListSkeleton />}
        >
          <TaskSection filters={filters} />
        </Suspense>
      </section>

      <section className="mt-8">
        <h2 className="sr-only">Paylaşım</h2>
        <ShareLinkPanel token={shareToken} shareUrl={shareUrl} />
      </section>
    </PageContainer>
  )
}

import { notFound } from 'next/navigation'

import { getSharedTasks } from '@/actions/shares'
import { TaskList } from '@/components/tasks/TaskList'
import { PageContainer } from '@/components/ui/PageContainer'

export const metadata = {
  title: 'Paylaşılan işler',
  // Linki bilen herkes gorebilsin ama arama motorlari indekslemesin:
  // paylasim linki "gizli adres" mantigiyla calisiyor, aranabilir olursa
  // token'in gizliligi anlamini yitirir.
  robots: { index: false, follow: false },
}

// Token uuid kolonuyla karsilastiriliyor; bicimi bozuk bir deger sorguda
// hataya yol acar. Veritabanina gitmeden once eleyip 404 donuyoruz.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function SharePage({ params }: PageProps<'/share/[token]'>) {
  const { token } = await params

  if (!UUID_PATTERN.test(token)) {
    notFound()
  }

  const { tasks, exists, error } = await getSharedTasks(token)

  // Gecersiz ya da iptal edilmis link: 404. Ozel bir mesaj gostermiyoruz,
  // "bu token vardi ama iptal edildi" bilgisi bile gereksiz.
  if (!error && !exists) {
    notFound()
  }

  return (
    <PageContainer>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Paylaşılan işler</h1>
        <p className="mt-1 text-sm opacity-60">
          Bu liste salt okunurdur; değişiklik yapılamaz.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium opacity-60">{tasks.length} iş</h2>

        <TaskList
          tasks={tasks}
          error={error}
          isFiltered={false}
          readOnly
          emptyMessage="Bu listede henüz iş yok."
        />
      </section>
    </PageContainer>
  )
}

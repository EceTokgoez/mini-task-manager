import { redirect } from 'next/navigation'

import { signOut } from '@/actions/auth'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'İşlerim' }

export default async function TasksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware zaten koruyor ama user'a burada da ihtiyacımız var,
  // yoksa TypeScript'e göre null olabilir.
  if (!user) {
    redirect('/login')
  }

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
    </main>
  )
}

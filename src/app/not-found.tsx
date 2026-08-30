import Link from 'next/link'

export const metadata = { title: 'Sayfa bulunamadı' }

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Sayfa bulunamadı</h1>

      <p className="text-sm opacity-70">
        Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>

      <Link
        href="/tasks"
        className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        İşlerime dön
      </Link>
    </main>
  )
}

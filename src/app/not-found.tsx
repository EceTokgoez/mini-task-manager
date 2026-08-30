import Link from 'next/link'

import { PageContainer } from '@/components/ui/PageContainer'

export const metadata = { title: 'Sayfa bulunamadı' }

export default function NotFound() {
  return (
    <PageContainer className="items-start gap-4">
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
    </PageContainer>
  )
}

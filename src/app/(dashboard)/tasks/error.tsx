'use client'

import { useEffect } from 'react'

import { PageContainer } from '@/components/ui/PageContainer'

// Hata ekraninda hata loglaniyor. Gercek projede buraya bir hata izleme servisi gireriz.
export default function TasksError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    // Gercek projede buraya bir hata izleme servisi girer ve error'u loglariz. Bu sayede hata tekrarlandiginda loglardan arama yapabiliriz.
    console.error(error)
  }, [error])

  return (
    <PageContainer className="items-start gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Bir şeyler ters gitti</h1>

      <p className="text-sm opacity-70">
        İşlerin yüklenirken beklenmedik bir hata oluştu. Tekrar denemek sorunu
        çözmezse birazdan yeniden dene.
      </p>

      {/* Hatanin kendisini degil digest'ini gosteriyoruz: mesaj icinde
          sunucuya dair detay olabilir, digest ise loglarda arama yapmaya yarar. */}
      {error.digest ? (
        <p className="text-xs opacity-50">Hata kodu: {error.digest}</p>
      ) : null}

      <button
        type="button"
        onClick={() => retry()}
        className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Tekrar dene
      </button>
    </PageContainer>
  )
}

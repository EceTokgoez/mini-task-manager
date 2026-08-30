'use client'

import { useState, useTransition } from 'react'

import { createShareLink, revokeShareLink } from '@/actions/shares'

type ShareLinkPanelProps = {
  token: string | null
  // Tam adres sunucuda istek basliklarindan uretiliyor. Tarayicidan okusaydik
  // ilk render'da bos kalir, hydration uyumsuzlugu riski dogardi; ayrica
  // ortam degiskeni tanimlamak zorunda kalmadan localhost ve canli ortamda
  // dogru adres uretiliyor.
  shareUrl: string | null
}

export function ShareLinkPanel({ token, shareUrl }: ShareLinkPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function run(action: () => Promise<{ error: string | null }>) {
    setError(null)
    setCopied(false)

    startTransition(async () => {
      const result = await action()

      if (result.error) {
        setError(result.error)
      }
    })
  }

  async function handleCopy() {
    if (!shareUrl) {
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
    } catch {
      // Panoya erisim reddedilebilir; adres zaten ekranda, elle kopyalanabilir.
      setError('Panoya kopyalanamadı. Adresi elle kopyalayabilirsin.')
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/15">
      <div>
        <h3 className="text-sm font-medium">Paylaşım linki</h3>
        <p className="mt-1 text-xs opacity-60">
          Bu linke sahip olan herkes işlerini giriş yapmadan görebilir, ama
          değiştiremez.
        </p>
      </div>

      {token && shareUrl ? (
        <>
          <input
            type="text"
            readOnly
            value={shareUrl}
            onFocus={(event) => event.target.select()}
            className="w-full rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/20"
          />

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={handleCopy}
              disabled={isPending || !shareUrl}
              className="rounded-lg border border-black/15 px-3 py-1.5 font-medium transition-colors hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
            >
              {copied ? 'Kopyalandı' : 'Kopyala'}
            </button>

            <button
              type="button"
              onClick={() => run(revokeShareLink)}
              disabled={isPending}
              className="underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100 disabled:opacity-40"
            >
              {isPending ? 'İşleniyor...' : 'Linki iptal et'}
            </button>
          </div>
        </>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => run(createShareLink)}
            disabled={isPending}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Oluşturuluyor...' : 'Paylaşım linki oluştur'}
          </button>
        </div>
      )}

      {error ? (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}

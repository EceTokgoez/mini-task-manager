'use client'

import type { RealtimeChannel } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { createClient } from '@/lib/supabase/client'

// Gorunur ciktisi olmayan bir component: yalnizca abonelik kuruyor ve
// degisiklikte sunucu bilesenlerini yeniden cektiriyor.
//
// Neden router.refresh()? Liste sunucuda render ediliyor. Gelen olayin
// icerigiyle istemcide bir state guncelleseydik ayni veriyi iki yerde tutmus
// olurduk. refresh() sunucudan taze veriyi getiriyor; tek dogru kaynak
// veritabani olarak kaliyor.
export function TaskRealtime({ userId }: { userId: string }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    let channel: RealtimeChannel | null = null
    let cancelled = false

    async function subscribe() {
      // Kritik adim: oturum cookie'lerden asenkron cozuluyor. Hemen abone
      // olsaydik soket token'siz baglanir, postgres_changes olaylari RLS'e
      // takilir ve hicbir sey gelmezdi -- ustelik hata da vermeden.
      // Bu yuzden once token'i alip Realtime'a veriyoruz.
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (cancelled) {
        return
      }

      await supabase.realtime.setAuth(session?.access_token ?? null)

      if (cancelled) {
        return
      }

      channel = supabase
        .channel(`tasks-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            // RLS zaten baskasinin satirlarini gondermiyor; bu filtre guvenlik
            // icin degil, gereksiz olaylarin ag uzerinden gelmemesi icin.
            filter: `user_id=eq.${userId}`,
          },
          () => {
            router.refresh()
          },
        )
        .subscribe((status) => {
          // Abonelik sessizce basarisiz olabiliyor. Hatayi yutmak yerine
          // konsola yaziyoruz ki "calismiyor ama sebebi belli degil"
          // durumuna dusmeyelim.
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`Realtime aboneliği kurulamadı: ${status}`)
          }
        })
    }

    subscribe()

    // Sayfa degistiginde aboneligi kapatiyoruz; aksi halde her gezinmede
    // yeni bir kanal birikirdi.
    return () => {
      cancelled = true

      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [router, userId])

  return null
}

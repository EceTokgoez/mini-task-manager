import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { supabaseKey, supabaseUrl } from './env'

// Server Component'ler ve Server Action'larda kullanılır.
// Her istekte yeni bir client oluşturuyoruz, çünkü cookie'ler isteğe özel.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Component'ten çağrıldığında cookie yazılamaz.
          // Session'ı zaten middleware yeniliyor, o yüzden burayı yutabiliriz.
        }
      },
    },
  })
}

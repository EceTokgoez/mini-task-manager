import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { supabaseKey, supabaseUrl } from './env'

// Auth token'ı süresi dolmadan yeniler ve yeni cookie'leri response'a yazar.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // getUser() token'ı Supabase'e doğrulatır, getSession() gibi cookie'ye güvenmez.
  await supabase.auth.getUser()

  return response
}

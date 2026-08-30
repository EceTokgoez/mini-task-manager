import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { supabaseKey, supabaseUrl } from './env'

// Giriş yapmış kullanıcının işi olmayan sayfalar: buradayken /tasks'a atılır.
const AUTH_ROUTES = ['/login', '/register']

// Herkese açık ön ekler. Paylaşım sayfası hem giriş yapmamış ziyaretçiye
// açık olmalı hem de giriş yapmış kullanıcı linke tıkladığında /tasks'a
// atılmamalı; bu yüzden AUTH_ROUTES'tan ayrı tutuluyor.
const PUBLIC_PREFIXES = ['/share']

// Auth token'ı süresi dolmadan yeniler ve giriş durumuna göre yönlendirir.
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute = AUTH_ROUTES.includes(pathname)
  const isPublicRoute =
    isAuthRoute ||
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/tasks', request.url))
  }

  return response
}

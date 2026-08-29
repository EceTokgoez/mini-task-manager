'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export type AuthState = {
  error: string | null
  message: string | null
  // Hata durumunda formu tamamen sıfırlamamak için e-postayı geri veriyoruz.
  email: string
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  }
}

export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = readCredentials(formData)

  if (!email || !password) {
    return { error: 'E-posta ve şifre zorunlu.', message: null, email }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Hangisinin yanlış olduğunu söylemiyoruz, yoksa kayıtlı e-postalar tespit edilebilir.
    return { error: 'E-posta veya şifre hatalı.', message: null, email }
  }

  revalidatePath('/', 'layout')
  redirect('/tasks')
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = readCredentials(formData)

  if (!email || !password) {
    return { error: 'E-posta ve şifre zorunlu.', message: null, email }
  }

  if (password.length < 6) {
    return { error: 'Şifre en az 6 karakter olmalı.', message: null, email }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message, message: null, email }
  }

  // Supabase'de e-posta onayı açıksa kayıt sonrası session gelmiyor.
  if (!data.session) {
    return {
      error: null,
      message: 'Hesabını doğrulamak için e-postandaki linke tıkla.',
      email,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/tasks')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}

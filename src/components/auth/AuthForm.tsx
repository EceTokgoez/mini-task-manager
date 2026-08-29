'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import type { AuthState } from '@/actions/auth'

// 'use server' dosyaları sadece async fonksiyon export edebiliyor,
// o yüzden başlangıç state'i burada duruyor.
const initialState: AuthState = { error: null, message: null, email: '' }

type AuthFormProps = {
  title: string
  submitLabel: string
  pendingLabel: string
  action: (state: AuthState, formData: FormData) => Promise<AuthState>
  footer: { text: string; linkLabel: string; href: string }
  passwordAutoComplete: 'current-password' | 'new-password'
  passwordHint?: string
}

// Login ve register formları alan olarak aynı, sadece action'ları ve
// yazıları farklı. İkisini ayrı ayrı yazmak yerine tek component yaptım.
export function AuthForm({
  title,
  submitLabel,
  pendingLabel,
  action,
  footer,
  passwordAutoComplete,
  passwordHint,
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">E-posta</span>
          <input
            type="email"
            name="email"
            required
            defaultValue={state.email}
            autoComplete="email"
            disabled={isPending}
            className="rounded-lg border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-black/50 disabled:opacity-60 dark:border-white/20 dark:focus:border-white/60"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Şifre</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete={passwordAutoComplete}
            disabled={isPending}
            className="rounded-lg border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-black/50 disabled:opacity-60 dark:border-white/20 dark:focus:border-white/60"
          />
          {passwordHint ? (
            <span className="text-xs opacity-60">{passwordHint}</span>
          ) : null}
        </label>

        {state.error ? (
          <p
            role="alert"
            className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
          >
            {state.error}
          </p>
        ) : null}

        {state.message ? (
          <p
            role="status"
            className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
      </form>

      <p className="mt-6 text-sm opacity-70">
        {footer.text}{' '}
        <Link href={footer.href} className="font-medium underline underline-offset-4">
          {footer.linkLabel}
        </Link>
      </p>
    </div>
  )
}

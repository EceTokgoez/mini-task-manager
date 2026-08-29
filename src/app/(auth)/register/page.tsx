import { signUp } from '@/actions/auth'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata = { title: 'Kayıt ol' }

export default function RegisterPage() {
  return (
    <AuthForm
      title="Kayıt ol"
      submitLabel="Kayıt ol"
      pendingLabel="Kayıt olunuyor..."
      action={signUp}
      passwordAutoComplete="new-password"
      passwordHint="En az 6 karakter."
      footer={{
        text: 'Zaten hesabın var mı?',
        linkLabel: 'Giriş yap',
        href: '/login',
      }}
    />
  )
}

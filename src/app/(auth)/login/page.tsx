import { signIn } from '@/actions/auth'
import { AuthForm } from '@/components/auth/AuthForm'

export const metadata = { title: 'Giriş yap' }

export default function LoginPage() {
  return (
    <AuthForm
      title="Giriş yap"
      submitLabel="Giriş yap"
      pendingLabel="Giriş yapılıyor..."
      action={signIn}
      passwordAutoComplete="current-password"
      footer={{
        text: 'Hesabın yok mu?',
        linkLabel: 'Kayıt ol',
        href: '/register',
      }}
    />
  )
}

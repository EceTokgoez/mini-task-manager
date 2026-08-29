import { redirect } from 'next/navigation'

// Ayrı bir landing sayfasına gerek yok; giriş yapmamışsa middleware
// buradan /login'e yönlendiriyor.
export default function HomePage() {
  redirect('/tasks')
}

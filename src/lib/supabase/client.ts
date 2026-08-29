import { createBrowserClient } from '@supabase/ssr'

import { supabaseKey, supabaseUrl } from './env'

// Client Component'lerde kullanılır.
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey)
}

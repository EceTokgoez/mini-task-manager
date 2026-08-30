'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import type { SharedTask } from '@/types/task'

export type ShareResult = { error: string | null }

// Postgres'in unique constraint ihlali kodu. Migration'daki kismi unique
// index (kullanici basina tek aktif link) tetiklenirse bu kod geliyor.
const UNIQUE_VIOLATION = '23505'

export async function getShareToken(): Promise<{
  token: string | null
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { token: null, error: 'Oturumun sona ermiş. Lütfen tekrar giriş yap.' }
  }

  // maybeSingle: aktif link olmayabilir, bu bir hata degil.
  const { data, error } = await supabase
    .from('task_shares')
    .select('share_token')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    return { token: null, error: 'Paylaşım linki okunamadı.' }
  }

  return { token: data?.share_token ?? null, error: null }
}

export async function createShareLink(): Promise<ShareResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Oturumun sona ermiş. Lütfen tekrar giriş yap.' }
  }

  // share_token'i uygulamada uretmiyoruz; kolonun default'u gen_random_uuid().
  // rasgele bir UUID uretiyor, tahmin edilemez ve yeterince uzun. Bu sayede
  // paylasim linki tahmin edilemez oluyor. Uygulama tarafinda token uretilirse
  // tahmin edilebilir token uretecek bir algoritma yazilabilir ve linkler
  // kolayca kirilabilir.
  const { error } = await supabase.from('task_shares').insert({ user_id: user.id })

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: 'Zaten aktif bir paylaşım linkin var.' }
    }

    return { error: 'Paylaşım linki oluşturulamadı. Lütfen tekrar dene.' }
  }

  revalidatePath('/tasks')

  return { error: null }
}

export async function revokeShareLink(): Promise<ShareResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Oturumun sona ermiş. Lütfen tekrar giriş yap.' }
  }

  // Satiri silmiyoruz, pasife cekiyoruz: link olurken kayit duruyor.
  const { data, error } = await supabase
    .from('task_shares')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true)
    .select('id')

  if (error) {
    return { error: 'Paylaşım linki iptal edilemedi. Lütfen tekrar dene.' }
  }

  // tasks action'larindakiyle ayni kontrol: RLS eslesmeyen satiri sessizce
  // gizledigi icin "hatasiz ama etkisiz" bir guncellemeyi basarili saymiyoruz.
  if (data.length === 0) {
    return { error: 'İptal edilecek aktif bir link bulunamadı.' }
  }

  revalidatePath('/tasks')

  return { error: null }
}

// Paylasim sayfasi giris yapmamis ziyaretcilere de acik. Bu yuzden burada
// auth kontrolu YOK; yetkilendirmeyi token'in kendisi ve veritabanindaki
// fonksiyon yapiyor. tasks tablosuna dogrudan sorgu atmiyoruz: anon rolunun
// o tabloda hicbir politikasi yok, erisim yalnizca fonksiyon uzerinden.
export async function getSharedTasks(token: string): Promise<{
  tasks: SharedTask[]
  exists: boolean
  error: string | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_shared_tasks', {
    p_token: token,
  })

  if (error) {
    return { tasks: [], exists: false, error: 'Liste yüklenemedi.' }
  }

  const tasks = (data ?? []) as SharedTask[]

  if (tasks.length > 0) {
    return { tasks, exists: true, error: null }
  }

  // Bos liste iki sey anlamina gelebilir: token gecersiz ya da kullanicinin
  // hic isi yok. Ayirt etmek icin ikinci fonksiyonu yalnizca bu durumda
  // cagiriyoruz; dolu listelerde ekstra sorgu maliyeti olusmuyor.
  const { data: exists, error: existsError } = await supabase.rpc('share_exists', {
    p_token: token,
  })

  if (existsError) {
    return { tasks: [], exists: false, error: 'Liste yüklenemedi.' }
  }

  return { tasks: [], exists: Boolean(exists), error: null }
}

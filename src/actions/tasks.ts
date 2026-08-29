'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { TASK_PRIORITIES, type Task, type TaskPriority } from '@/types/task'

export type TaskFormState = {
  error: string | null
  // Basarili kayittan sonra formu temizlemek icin success true oluyor.
  success: boolean
}

const TITLE_MAX_LENGTH = 120
const DESCRIPTION_MAX_LENGTH = 500

function isTaskPriority(value: string): value is TaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(value)
}

export async function createTask(
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const supabase = await createClient()


  //session sona ermis olabilir, bu yuzden tekrar user'i aliyoruz.
  // Middleware zaten koruyor ama user'a burada da ihtiyacımız var, yoksa TypeScript'e göre null olabilir.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Oturumun sona ermiş. Lütfen tekrar giriş yap.', success: false }
  }

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const priority = String(formData.get('priority') ?? 'medium')

  if (!title) {
    return { error: 'Başlık zorunlu.', success: false }
  }

  if (title.length > TITLE_MAX_LENGTH) {
    return {
      error: `Başlık en fazla ${TITLE_MAX_LENGTH} karakter olabilir.`,
      success: false,
    }
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return {
      error: `Açıklama en fazla ${DESCRIPTION_MAX_LENGTH} karakter olabilir.`,
      success: false,
    }
  }

  // sadece TASK_PRIORITIES içindeki değerler geçerli kabul edilecek.
  // Bu sayede veritabanındaki check constraint ile uyumlu oluyor.
  if (!isTaskPriority(priority)) {
    return { error: 'Geçersiz öncelik değeri.', success: false }
  }

  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title,
    description: description || null,
    priority,
  })

  if (error) {
    // Veritabani hatasini yansıtmamak için genel bir hata mesajı dönüyoruz.
    return { error: 'İş kaydedilemedi. Lütfen tekrar dene.', success: false }
  }

  revalidatePath('/tasks')

  return { error: null, success: true }
}

export async function getTasks(): Promise<{ tasks: Task[]; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { tasks: [], error: 'Oturumun sona ermiş. Lütfen tekrar giriş yap.' }
  }

  // RLS filtreyi uyguluyor ama yine de sorguya ekliyoruz ki TypeScript'e göre user.id null olmasın.

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { tasks: [], error: 'İşler yüklenemedi. Lütfen sayfayı yenile.' }
  }

  return { tasks: data as Task[], error: null }
}

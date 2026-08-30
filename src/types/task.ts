export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const
export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const

export type TaskPriority = (typeof TASK_PRIORITIES)[number]
export type TaskStatus = (typeof TASK_STATUSES)[number]

export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  created_at: string
  updated_at: string
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Yapılacak',
  in_progress: 'Devam ediyor',
  done: 'Tamamlandı',
}

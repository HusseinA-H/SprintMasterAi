type TaskInput = Record<string, unknown>

export const normalizeTaskInput = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') return data

  const taskData = data as TaskInput
  if (taskData.estimated == null && taskData.order != null) {
    taskData.estimated = taskData.order
  }

  return taskData
}

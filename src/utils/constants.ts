import type { Id } from '../types'

export const STORAGE_KEY = 'kanban-tasks'
export const PENDING_DELETES_KEY = 'kanban-pending-deletes'

export const COLUMN_TO_STATUS_MAP: Record<Id, 'todo' | 'inProgress' | 'done'> = {
	1: 'todo',
	2: 'inProgress',
	3: 'done',
}

export const STATUS_TO_COLUMN_MAP: Record<'todo' | 'inProgress' | 'done', Id> = {
	todo: 1,
	inProgress: 2,
	done: 3,
}

import type { Task } from '../types'
import { STORAGE_KEY, PENDING_DELETES_KEY } from './constants'
import { createTaskOnServer, updateTaskOnServer, deleteTaskOnServer, checkServerConnection } from './api'

export function loadTasksFromStorage(): Task[] {
	try {
		const storedTasks = localStorage.getItem(STORAGE_KEY)
		if (storedTasks) {
			const parsedTasks = JSON.parse(storedTasks)
			if (Array.isArray(parsedTasks)) {
				return parsedTasks
			}
		}
	} catch (error) {
		console.error('Failed to load tasks from localStorage:', error)
	}
	return []
}

export function saveTasksToStorage(tasks: Task[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
	} catch (error) {
		console.error('Failed to save tasks to localStorage:', error)
	}
}

export function getTaskFromStorage(taskId: string | number): Task | null {
	try {
		const tasks = loadTasksFromStorage()
		return tasks.find((t) => String(t.id) === String(taskId)) || null
	} catch (error) {
		console.error('Failed to load task from localStorage:', error)
		return null
	}
}

/**
 * Gets list of pending deletions (tasks deleted locally but not on server)
 */
function getPendingDeletes(): (string | number)[] {
	try {
		const pending = localStorage.getItem(PENDING_DELETES_KEY)
		if (pending) {
			return JSON.parse(pending)
		}
	} catch (error) {
		console.error('Failed to load pending deletes:', error)
	}
	return []
}

/**
 * Saves list of pending deletions
 */
function savePendingDeletes(deletes: (string | number)[]): void {
	try {
		localStorage.setItem(PENDING_DELETES_KEY, JSON.stringify(deletes))
	} catch (error) {
		console.error('Failed to save pending deletes:', error)
	}
}

/**
 * Adds task ID to pending deletions
 */
function addPendingDelete(taskId: string | number): void {
	const pending = getPendingDeletes()
	if (!pending.includes(taskId)) {
		pending.push(taskId)
		savePendingDeletes(pending)
	}
}

/**
 * Removes task ID from pending deletions
 */
function removePendingDelete(taskId: string | number): void {
	const pending = getPendingDeletes().filter((id) => String(id) !== String(taskId))
	savePendingDeletes(pending)
}

/**
 * Saves task to localStorage and syncs with server
 * For new tasks first creates on server gets ID then saves to localStorage
 * For existing tasks updates in localStorage then syncs with server
 */
export async function saveTask(task: Task | Omit<Task, 'id'>): Promise<Task> {
	const tasks = loadTasksFromStorage()
	const taskWithId = task as Task
	const existingIndex = tasks.findIndex((t) => taskWithId.id && String(t.id) === String(taskWithId.id))

	// If task is new no ID or not found in localStorage
	if (!taskWithId.id || existingIndex < 0) {
		// First create on server to get ID
		try {
			const isConnected = await checkServerConnection()
			if (isConnected) {
				const serverTask = await createTaskOnServer(task)
				// Use ID from server
				const taskWithServerId = { ...task, id: serverTask.id } as Task
				tasks.push(taskWithServerId)
				saveTasksToStorage(tasks)
				return taskWithServerId
			}
		} catch (error) {
			console.error('Failed to create task on server:', error)
			// If server unavailable use temporary ID
		}

		// If server unavailable generate temporary ID will be replaced on next sync
		const tempId = `temp-${Date.now()}-${Math.random()}`
		const taskWithTempId = { ...task, id: tempId } as Task
		tasks.push(taskWithTempId)
		saveTasksToStorage(tasks)
		return taskWithTempId
	} else {
		// Update existing task
		tasks[existingIndex] = taskWithId
		saveTasksToStorage(tasks)

		// Sync with server
		try {
			const isConnected = await checkServerConnection()
			if (isConnected) {
				await updateTaskOnServer(taskWithId.id, taskWithId)
			}
		} catch (error) {
			console.error('Failed to sync task to server:', error)
		}

		return taskWithId
	}
}

/**
 * Deletes task from localStorage and syncs with server
 */
export async function removeTask(taskId: string | number): Promise<void> {
	// First delete from localStorage
	const tasks = loadTasksFromStorage()
	const filteredTasks = tasks.filter((t) => String(t.id) !== String(taskId))
	saveTasksToStorage(filteredTasks)

	// Check if task exists on server (not a temp task)
	const isTempTask = String(taskId).startsWith('temp-')

	if (!isTempTask) {
		// Add to pending deletes if server is unavailable
		try {
			const isConnected = await checkServerConnection()
			if (isConnected) {
				await deleteTaskOnServer(taskId)
				// Successfully deleted, no need to track
			} else {
				// Server unavailable, track for later deletion
				addPendingDelete(taskId)
			}
		} catch (error) {
			console.error('Failed to delete task from server:', error)
			// Server unavailable or error, track for later deletion
			addPendingDelete(taskId)
		}
	}
}

/**
 * Updates task in localStorage and syncs with server using PATCH request
 * If task does not exist on server creates it
 * Priority is always given to localStorage version
 */
export async function updateTask(taskId: string | number, updates: Partial<Task>): Promise<void> {
	// First update in localStorage (priority)
	const tasks = loadTasksFromStorage()
	const taskToUpdate = tasks.find((task) => String(task.id) === String(taskId))

	if (!taskToUpdate) {
		console.warn(`Task with id ${taskId} not found in localStorage`)
		return
	}

	const updatedTask = {
		...taskToUpdate,
		...updates,
		updatedAt: new Date().toISOString(),
	}

	const updatedTasks = tasks.map((task) => {
		if (String(task.id) === String(taskId)) {
			return updatedTask
		}
		return task
	})
	saveTasksToStorage(updatedTasks)

	// Then sync with server if available
	// updateTaskOnServer automatically creates task if it does not exist on server
	try {
		const isConnected = await checkServerConnection()
		if (isConnected) {
			// Pass full updated task so it can be created if it does not exist on server
			await updateTaskOnServer(taskId, updatedTask)
		}
		// If server unavailable, the local version will be synced when server becomes available
	} catch (error) {
		console.error('Failed to update task on server:', error)
		// Continue working even if server unavailable
		// Local version will be synced when server becomes available
	}
}

/**
 * Syncs all pending operations when server becomes available
 * - Creates temporary tasks on server
 * - Deletes tasks that were deleted locally
 * - Updates tasks that were modified locally (localStorage has priority)
 * - Removes old temp entries, fetches from server, updates localStorage
 */
export async function syncTemporaryTasks(): Promise<Task[]> {
	const localTasks = loadTasksFromStorage()
	const tempTasks = localTasks.filter((task) => String(task.id).startsWith('temp-'))

	if (tempTasks.length === 0) {
		return localTasks
	}

	try {
		const isConnected = await checkServerConnection()
		if (!isConnected) {
			return localTasks
		}

		// Step 1: Delete tasks that were deleted locally
		const pendingDeletes = getPendingDeletes()
		for (const taskId of pendingDeletes) {
			try {
				// Check if task still exists on server (might have been deleted already)
				const { taskExistsOnServer } = await import('./api')
				if (await taskExistsOnServer(taskId)) {
					await deleteTaskOnServer(taskId)
				}
				removePendingDelete(taskId)
			} catch (error) {
				console.error(`Failed to delete task ${taskId} from server:`, error)
				// Keep in pending deletes for retry
			}
		}

		// Step 2: Create all temporary tasks on server
		const createdTasks: Task[] = []
		const failedTempTasks: Task[] = []

		for (const tempTask of tempTasks) {
			try {
				const serverTask = await createTaskOnServer(tempTask)
				createdTasks.push(serverTask)
			} catch (error) {
				console.error(`Failed to create temporary task on server:`, error)
				// Keep temp task if creation failed
				failedTempTasks.push(tempTask)
			}
		}

		// Step 3: Remove only successfully created temporary tasks from localStorage
		// Keep failed ones for retry later
		const failedTempTaskIds = new Set(failedTempTasks.map((t) => String(t.id)))
		const tasksWithoutTemp = localTasks.filter(
			(task) => !String(task.id).startsWith('temp-') || failedTempTaskIds.has(String(task.id))
		)

		// Step 4: Sync all local tasks to server (localStorage has priority)
		// Create/update tasks that exist locally but not on server or differ
		const { fetchTasks } = await import('./api')
		const serverTasks = await fetchTasks()
		const serverTasksMap = new Map(serverTasks.map((t) => [String(t.id), t]))

		for (const localTask of tasksWithoutTemp) {
			const serverTask = serverTasksMap.get(String(localTask.id))

			if (!serverTask) {
				// Task doesn't exist on server, create it
				try {
					await createTaskOnServer(localTask)
				} catch (error) {
					console.error(`Failed to create task ${localTask.id} on server:`, error)
				}
			} else {
				// Task exists, but localStorage version has priority - update server
				try {
					await updateTaskOnServer(localTask.id, localTask)
				} catch (error) {
					console.error(`Failed to update task ${localTask.id} on server:`, error)
				}
			}
		}

		// Step 5: Fetch all tasks from server to get latest versions (after our updates)
		const updatedServerTasks = await fetchTasks()
		const updatedServerTasksMap = new Map(updatedServerTasks.map((t) => [String(t.id), t]))

		// Step 6: Merge: localStorage has priority, but add new tasks from server
		const mergedTasks: Task[] = []
		const processedIds = new Set<string>()

		// First, add all local tasks (localStorage has priority)
		for (const localTask of tasksWithoutTemp) {
			const serverTask = updatedServerTasksMap.get(String(localTask.id))
			// Use local version (has priority), but merge with server data if needed
			if (serverTask) {
				// Use local version as base, but ensure we have latest server metadata
				mergedTasks.push(localTask)
				processedIds.add(String(localTask.id))
			} else {
				// Task not on server yet (might be in process of creation), use local version
				mergedTasks.push(localTask)
				processedIds.add(String(localTask.id))
			}
		}

		// Add server tasks that weren't in localStorage (new tasks from other sources)
		for (const serverTask of updatedServerTasks) {
			if (!processedIds.has(String(serverTask.id))) {
				// Check if this task was deleted locally
				if (!pendingDeletes.includes(serverTask.id)) {
					mergedTasks.push(serverTask)
				}
			}
		}

		// Save merged data to localStorage
		saveTasksToStorage(mergedTasks)

		// Dispatch custom event to notify components about sync completion
		window.dispatchEvent(new CustomEvent('tasksSynced', { detail: mergedTasks }))

		return mergedTasks
	} catch (error) {
		console.error('Failed to sync temporary tasks:', error)
		return localTasks
	}
}

/**
 * Syncs data on app load
 * Priority given to data from localStorage
 */
export async function syncOnAppLoad(): Promise<Task[]> {
	const localTasks = loadTasksFromStorage()

	try {
		const isConnected = await checkServerConnection()
		if (isConnected) {
			// First sync temporary tasks and pending operations if any
			const syncedTasks = await syncTemporaryTasks()

			// Also process any remaining pending deletes
			const pendingDeletes = getPendingDeletes()
			if (pendingDeletes.length > 0) {
				const { taskExistsOnServer, deleteTaskOnServer } = await import('./api')
				for (const taskId of pendingDeletes) {
					try {
						if (await taskExistsOnServer(taskId)) {
							await deleteTaskOnServer(taskId)
						}
						removePendingDelete(taskId)
					} catch (error) {
						console.error(`Failed to delete pending task ${taskId}:`, error)
					}
				}
			}

			const serverTasks = await import('./api').then((api) => api.fetchTasks())

			// Create Map for fast lookup
			const localTasksMap = new Map(syncedTasks.map((t) => [String(t.id), t]))
			const serverTasksMap = new Map(serverTasks.map((t) => [String(t.id), t]))

			// Merge priority to localStorage
			const mergedTasks: Task[] = []
			const allTaskIds = new Set([...Array.from(localTasksMap.keys()), ...Array.from(serverTasksMap.keys())])

			for (const taskId of allTaskIds) {
				const localTask = localTasksMap.get(taskId)
				const serverTask = serverTasksMap.get(taskId)

				// Priority to localStorage
				if (localTask) {
					// Check if ID is temporary (should not happen after syncTemporaryTasks, but just in case)
					const isTempId = String(localTask.id).startsWith('temp-')

					if (isTempId) {
						// If ID is still temporary, create task on server and get real ID
						try {
							const serverTaskWithId = await createTaskOnServer(localTask)
							// Replace temporary ID with real ID
							const updatedTask = { ...localTask, id: serverTaskWithId.id }
							mergedTasks.push(updatedTask)
						} catch (error) {
							console.error(`Failed to create task ${taskId} on server:`, error)
							// Keep temporary ID if failed to create on server
							mergedTasks.push(localTask)
						}
					} else {
						// localStorage has priority - always use local version
						mergedTasks.push(localTask)
						// Sync local version to server
						if (!serverTask) {
							// Task does not exist on server create it
							try {
								await createTaskOnServer(localTask)
							} catch (error) {
								console.error(`Failed to create task ${taskId} on server:`, error)
							}
						} else {
							// Task exists on server - update server with local version (localStorage has priority)
							try {
								await updateTaskOnServer(localTask.id, localTask)
							} catch (error) {
								console.error(`Failed to sync task ${taskId} to server:`, error)
							}
						}
					}
				} else if (serverTask) {
					// If task does not exist in localStorage but exists on server add to localStorage
					mergedTasks.push(serverTask)
				}
			}

			// Save merged data to localStorage
			saveTasksToStorage(mergedTasks)
			return mergedTasks
		}
	} catch (error) {
		console.error('Failed to sync on app load:', error)
		// Continue working with data from localStorage
	}

	return localTasks
}

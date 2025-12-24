import type { Task } from '../types'

const API_BASE_URL = 'http://localhost:3001'

export interface ServerStatus {
	isConnected: boolean
	lastChecked?: Date
}

let serverStatus: ServerStatus = {
	isConnected: false,
}

/**
 * Checks server availability
 */
export async function checkServerConnection(): Promise<boolean> {
	try {
		const response = await fetch(`${API_BASE_URL}/tasks`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			signal: AbortSignal.timeout(300000), // 30 seconds
		})
		const isConnected = response.ok
		serverStatus = {
			isConnected,
			lastChecked: new Date(),
		}
		return isConnected
	} catch {
		serverStatus = {
			isConnected: false,
			lastChecked: new Date(),
		}
		return false
	}
}

/**
 * Gets current server status
 */
export function getServerStatus(): ServerStatus {
	return serverStatus
}

/**
 * Gets all tasks from server
 */
export async function fetchTasks(): Promise<Task[]> {
	try {
		const response = await fetch(`${API_BASE_URL}/tasks`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const tasks = await response.json()
		return Array.isArray(tasks) ? tasks : []
	} catch (error) {
		console.error('Failed to fetch tasks from server:', error)
		throw error
	}
}

/**
 * Creates new task on server
 * Server automatically assigns ID
 */
export async function createTaskOnServer(task: Omit<Task, 'id'> | Task): Promise<Task> {
	try {
		// Remove id from task if present server will assign ID
		const taskObj = task as Task
		const taskToSend = { ...taskObj }
		delete (taskToSend as Partial<Task>).id

		const response = await fetch(`${API_BASE_URL}/tasks`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(taskToSend),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		// Return task with ID from server
		return await response.json()
	} catch (error) {
		console.error('Failed to create task on server:', error)
		throw error
	}
}

/**
 * Checks if task exists on server
 */
export async function taskExistsOnServer(taskId: string | number): Promise<boolean> {
	try {
		const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		return response.ok
	} catch {
		return false
	}
}

/**
 * Updates task on server using PATCH request
 * If task does not exist creates it using POST request
 */
export async function updateTaskOnServer(taskId: string | number, updates: Partial<Task> | Task): Promise<Task> {
	try {
		// First check if task exists
		const exists = await taskExistsOnServer(taskId)

		if (!exists) {
			// If task does not exist on server create it
			// If updates is full task use it otherwise need to get full task from localStorage
			const fullTask = updates as Task
			if (fullTask.id && fullTask.title) {
				// This is full task
				return await createTaskOnServer(fullTask)
			} else {
				// This is partial update but task does not exist on server
				// Need to get full task from localStorage or create new one
				throw new Error(`Task ${taskId} does not exist on server and cannot be updated with partial data`)
			}
		}

		// If task exists update using PATCH
		const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updates),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		return await response.json()
	} catch (error) {
		console.error('Failed to update task on server:', error)
		throw error
	}
}

/**
 * Deletes task from server
 */
export async function deleteTaskOnServer(taskId: string | number): Promise<void> {
	try {
		const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
	} catch (error) {
		console.error('Failed to delete task on server:', error)
		throw error
	}
}

/**
 * Syncs all tasks to server using PUT request for full replacement
 */
export async function syncAllTasksToServer(tasks: Task[]): Promise<void> {
	try {
		// Delete all existing tasks
		const existingTasks = await fetchTasks()
		await Promise.all(existingTasks.map((task) => deleteTaskOnServer(task.id)))

		// Create new tasks
		await Promise.all(tasks.map((task) => createTaskOnServer(task)))
	} catch (error) {
		console.error('Failed to sync all tasks to server:', error)
		throw error
	}
}

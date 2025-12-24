import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import type { Column, Id, Task } from '../../types'
import ColumnContainer from './ColumnContainer'
import type { TaskFilters } from './TaskFilters'
import {
	DndContext,
	DragOverlay,
	useSensors,
	useSensor,
	PointerSensor,
	type DragStartEvent,
	type DragEndEvent,
	type DragOverEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'
import { createPortal } from 'react-dom'
import TaskCard from './TaskCard'
import Modal from '../ui/modal'
import { COLUMN_TO_STATUS_MAP, STATUS_TO_COLUMN_MAP } from '../../utils/constants'
import {
	loadTasksFromStorage,
	saveTasksToStorage,
	syncOnAppLoad,
	saveTask,
	removeTask,
	updateTask as syncTaskToServer,
} from '../../utils/storage'

// Custom event type for tasks sync
declare global {
	interface WindowEventMap {
		tasksSynced: CustomEvent<Task[]>
	}
}

interface KanbanBoardProps {
	searchQuery?: string
	filters?: TaskFilters
	onTagClick?: (tag: string) => void
}

const KanbanBoard = ({ searchQuery = '', filters, onTagClick }: KanbanBoardProps) => {
	const [columns, setColumns] = useState<Column[]>([
		{ id: 1, title: 'todo' },
		{ id: 2, title: 'in progress' },
		{ id: 3, title: 'done' },
	])
	const [activeColumn, setActiveColumn] = useState<Column | null>(null)
	const [activeTask, setActiveTask] = useState<Task | null>(null)
	const lastDragOverRef = useRef<{ activeId: Id; overId: Id } | null>(null)
	const [tasks, setTasks] = useState<Task[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const columnsId = useMemo(() => columns.map((col) => col.id), [columns])

	// Sync on app load
	useEffect(() => {
		const loadAndSync = async () => {
			setIsLoading(true)
			try {
				const syncedTasks = await syncOnAppLoad()
				setTasks(syncedTasks)
			} catch (error) {
				console.error('Failed to sync on load:', error)
				setTasks(loadTasksFromStorage())
			} finally {
				setIsLoading(false)
			}
		}
		loadAndSync()
	}, [])

	// Listen for tasks sync events (when server becomes available and syncs temporary tasks)
	useEffect(() => {
		const handleTasksSynced = (event: CustomEvent<Task[]>) => {
			const syncedTasks = event.detail
			setTasks(syncedTasks)
		}

		window.addEventListener('tasksSynced', handleTasksSynced as EventListener)

		return () => {
			window.removeEventListener('tasksSynced', handleTasksSynced as EventListener)
		}
	}, [])
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 3 },
		})
	)

	const filteredTasks = useMemo(() => {
		let result = tasks

		// Filter by search query (title)
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim()
			result = result.filter((task) => task.title.toLowerCase().includes(query))
		}

		// Filter by status (only if status is selected and not empty)
		if (filters?.status && filters.status.length > 0) {
			const statusValue = filters.status as 'todo' | 'inProgress' | 'done'
			result = result.filter((task) => task.status === statusValue)
		}

		// Filter by priority (only if priority is selected and not empty)
		if (filters?.priority && filters.priority.length > 0) {
			const priorityValue = filters.priority as 'low' | 'medium' | 'high'
			result = result.filter((task) => task.priority === priorityValue)
		}

		// Filter by tags (task must have all selected tags)
		if (filters?.tags && filters.tags.length > 0) {
			result = result.filter((task) => {
				return filters.tags!.every((tag) => task.tags.includes(tag))
			})
		}

		return result
	}, [tasks, searchQuery, filters])

	// Save to localStorage when tasks change
	useEffect(() => {
		if (!isLoading && tasks.length >= 0) {
			saveTasksToStorage(tasks)
		}
	}, [tasks, isLoading])

	const taskModalRef = useRef<HTMLDialogElement>(null)
	const [selectedColumnId, setSelectedColumnId] = useState<Id | null>(null)
	const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null)
	function openTaskModal(columnId?: Id) {
		if (columnId) {
			setSelectedColumnId(columnId)
		}
		setSelectedTaskForEdit(null)
		taskModalRef.current?.showModal()
	}

	async function createNewTask(
		columnId: Id,
		data: {
			title: string
			description: string
			status: string
			priority: string
			tags: string[]
			deadline: string
		}
	) {
		const taskStatus = (data.status || COLUMN_TO_STATUS_MAP[columnId] || 'todo') as 'todo' | 'inProgress' | 'done'
		const defaultStatus = COLUMN_TO_STATUS_MAP[columnId] || 'todo'
		const targetColumnId = taskStatus !== defaultStatus ? STATUS_TO_COLUMN_MAP[taskStatus] : columnId

		// Create task without ID server will assign it
		const newTask: Omit<Task, 'id'> = {
			columnId: targetColumnId,
			description: data.description,
			title: data.title,
			status: taskStatus,
			priority: data.priority as 'low' | 'medium' | 'high',
			deadline: data.deadline,
			tags: data.tags,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			number: tasks.length + 1,
		}

		// Create task on server and get ID
		const savedTask = await saveTask(newTask)
		// Update task list with task that has ID from server
		setTasks([...tasks, savedTask])
	}

	async function deleteTask(id: Id) {
		setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id))
		// Sync with server happens through removeTask
		await removeTask(id)
	}

	function updateTask(id: Id) {
		const taskToEdit = tasks.find((task) => task.id === id)
		if (taskToEdit) {
			setSelectedTaskForEdit(taskToEdit)
			setSelectedColumnId(taskToEdit.columnId)
			taskModalRef.current?.showModal()
		}
	}

	async function updateExistingTask(
		taskId: Id,
		data: {
			title: string
			description: string
			status: string
			priority: string
			tags: string[]
			deadline: string
		}
	) {
		// define status of task from form
		const taskStatus = (data.status || 'todo') as 'todo' | 'inProgress' | 'done'
		const targetColumnId = STATUS_TO_COLUMN_MAP[taskStatus]

		const updatedTask = {
			title: data.title,
			description: data.description,
			status: taskStatus,
			priority: data.priority as 'low' | 'medium' | 'high',
			tags: data.tags,
			deadline: data.deadline,
			columnId: targetColumnId,
		}

		setTasks((prevTasks) => {
			return prevTasks.map((task) => {
				if (task.id !== taskId) return task
				return {
					...task,
					...updatedTask,
					updatedAt: new Date().toISOString(),
				}
			})
		})

		// Sync with server using syncTaskToServer PATCH request
		await syncTaskToServer(taskId, updatedTask)
	}

	async function updateTaskStatus(id: Id, status: string) {
		const newStatus = status as 'todo' | 'inProgress' | 'done'
		const targetColumnId = STATUS_TO_COLUMN_MAP[newStatus]

		const updates = {
			status: newStatus,
			columnId: targetColumnId,
		}

		setTasks((prevTasks) => {
			return prevTasks.map((task) => {
				if (task.id !== id) return task
				return {
					...task,
					...updates,
					updatedAt: new Date().toISOString(),
				}
			})
		})

		// Sync with server using syncTaskToServer PATCH request
		await syncTaskToServer(id, updates)
	}

	function onDragStart(event: DragStartEvent) {
		if (event.active.data.current?.type === 'Column') {
			setActiveColumn(event.active.data.current.column)
			return
		}
		if (event.active.data.current?.type === 'Task') {
			setActiveTask(event.active.data.current.task)
			return
		}
	}

	function onDragEnd(event: DragEndEvent) {
		setActiveColumn(null)
		setActiveTask(null)

		const { active, over } = event
		if (!over) {
			lastDragOverRef.current = null
			return
		}

		const isActiveAColumn = active.data.current?.type === 'Column'
		const isActiveATask = active.data.current?.type === 'Task'

		if (isActiveAColumn) {
			const activeColumnId = active.id
			const overColumnId = over.id
			if (activeColumnId === overColumnId) {
				lastDragOverRef.current = null
				return
			}

			const isOverAColumn = over.data.current?.type === 'Column'
			if (!isOverAColumn) {
				lastDragOverRef.current = null
				return
			}

			setColumns((prevColumns) => {
				const activeColumnIndex = prevColumns.findIndex((col) => col.id === activeColumnId)
				const overColumnIndex = prevColumns.findIndex((col) => col.id === overColumnId)
				return arrayMove(prevColumns, activeColumnIndex, overColumnIndex)
			})
			lastDragOverRef.current = null
			return
		}

		if (isActiveATask) {
			const activeId = active.id
			const overId = over.id

			if (activeId === overId) {
				lastDragOverRef.current = null
				return
			}

			const isOverATask = over.data.current?.type === 'Task'
			const isOverAColumn = over.data.current?.type === 'Column'

			if (!isOverATask && !isOverAColumn) {
				lastDragOverRef.current = null
				return
			}

			setTasks((prevTasks) => {
				const activeIndex = prevTasks.findIndex((t) => t.id === activeId)
				if (activeIndex === -1) return prevTasks

				const activeTaskData = prevTasks[activeIndex]
				let finalTargetColumnId: Id | undefined
				let newIndex = activeIndex

				if (isOverATask) {
					const overIndex = prevTasks.findIndex((t) => t.id === overId)
					if (overIndex === -1) return prevTasks
					finalTargetColumnId = prevTasks[overIndex].columnId
					newIndex = overIndex
				} else if (isOverAColumn) {
					finalTargetColumnId = overId
				}

				if (!finalTargetColumnId) {
					return prevTasks
				}

				const newStatus = COLUMN_TO_STATUS_MAP[finalTargetColumnId]
				if (!newStatus) {
					return prevTasks
				}

				if (activeTaskData.columnId === finalTargetColumnId && newIndex === activeIndex) {
					return prevTasks
				}

				const newTasks = prevTasks.map((task) => {
					if (task.id === activeId) {
						return {
							...task,
							columnId: finalTargetColumnId!,
							status: newStatus,
							updatedAt: new Date().toISOString(),
						}
					}
					return task
				})

				const finalTasks = newIndex !== activeIndex ? arrayMove(newTasks, activeIndex, newIndex) : newTasks

				// Sync with server after status change via drag and drop
				// Use syncTaskToServer from storage which automatically creates task if it does not exist on server
				const updatedTask = finalTasks.find((t) => t.id === activeId)
				if (updatedTask) {
					syncTaskToServer(activeId, {
						columnId: finalTargetColumnId!,
						status: newStatus,
					}).catch((error: unknown) => {
						console.error('Failed to sync task status update:', error)
					})
				}

				return finalTasks
			})
		}

		lastDragOverRef.current = null
	}

	const onDragOver = useCallback((event: DragOverEvent) => {
		const { active, over } = event
		if (!over) {
			lastDragOverRef.current = null
			return
		}

		const activeId = active.id
		const overId = over.id

		if (activeId === overId) return

		const isActiveATask = active.data.current?.type === 'Task'
		if (!isActiveATask) return

		const isOverATask = over.data.current?.type === 'Task'
		const isOverAColumn = over.data.current?.type === 'Column'

		if (!isOverATask && !isOverAColumn) return

		const currentDrag = { activeId, overId }
		lastDragOverRef.current = currentDrag
	}, [])

	if (isLoading) {
		return (
			<div className='flex justify-center items-center min-h-[60vh]'>
				<span className='loading loading-spinner loading-lg'></span>
			</div>
		)
	}

	return (
		<div className='flex w-full overflow-x-auto overflow-y-hidden'>
			<DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
				<div className='flex lg:flex-row flex-col gap-4 w-full'>
					<SortableContext items={columnsId}>
						{columns.map((col) => (
							<ColumnContainer
								key={col.id}
								column={col}
								openTaskModal={() => openTaskModal(col.id)}
								tasks={filteredTasks.filter((task) => task.columnId === col.id)}
								deleteTask={deleteTask}
								updateTask={updateTask}
								updateTaskStatus={updateTaskStatus}
								createTask={createNewTask}
								onTagClick={onTagClick}
								activeTags={filters?.tags || []}
							/>
						))}
					</SortableContext>
				</div>
				{createPortal(
					<DragOverlay>
						{activeColumn && (
							<ColumnContainer
								column={activeColumn}
								openTaskModal={openTaskModal}
								tasks={filteredTasks.filter((task) => task.columnId === activeColumn.id)}
								deleteTask={deleteTask}
								updateTask={updateTask}
								updateTaskStatus={updateTaskStatus}
								createTask={createNewTask}
								onTagClick={onTagClick}
								activeTags={filters?.tags || []}
							/>
						)}
						{activeTask && (
							<TaskCard
								task={activeTask}
								deleteTask={deleteTask}
								updateTask={updateTask}
								updateTaskStatus={updateTaskStatus}
							/>
						)}
					</DragOverlay>,
					document.body
				)}
			</DndContext>
			<Modal
				ref={taskModalRef}
				task={selectedTaskForEdit}
				editTask={!!selectedTaskForEdit}
				createNewTask={createNewTask}
				updateExistingTask={updateExistingTask}
				columnId={selectedColumnId}
			/>
		</div>
	)
}
export default KanbanBoard

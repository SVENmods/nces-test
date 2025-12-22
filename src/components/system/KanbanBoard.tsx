import { useState, useMemo, useRef } from 'react'
import type { Column, Id, Task } from '../../types'
import ColumnContainer from './ColumnContainer'
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

const KanbanBoard = () => {
	const [columns, setColumns] = useState<Column[]>([
		{ id: 1, title: 'todo' },
		{ id: 2, title: 'in progress' },
		{ id: 3, title: 'done' },
	])
	const [activeColumn, setActiveColumn] = useState<Column | null>(null)
	const [activeTask, setActiveTask] = useState<Task | null>(null)
	const [tasks, setTasks] = useState<Task[]>([])
	const columnsId = useMemo(() => columns.map((col) => col.id), [columns])
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 3 },
		})
	)

	// mapping between columns and statuses
	const columnToStatusMap: Record<Id, 'todo' | 'inProgress' | 'done'> = {
		1: 'todo',
		2: 'inProgress',
		3: 'done',
	}

	// mapping between statuses and columns
	const statusToColumnMap: Record<'todo' | 'inProgress' | 'done', Id> = {
		todo: 1,
		inProgress: 2,
		done: 3,
	}

	function generateId() {
		return Math.floor(Math.random() * 1000) + 1
	}

	const taskModalRef = useRef<HTMLDialogElement>(null)
	const [selectedColumnId, setSelectedColumnId] = useState<Id | null>(null)

	function openTaskModal(columnId?: Id) {
		if (columnId) {
			setSelectedColumnId(columnId)
		}
		taskModalRef.current?.showModal()
	}

	function createNewTask(
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
		// define status of task from form
		const taskStatus = (data.status || columnToStatusMap[columnId] || 'todo') as 'todo' | 'inProgress' | 'done'

		// define original status of column
		const defaultStatus = columnToStatusMap[columnId] || 'todo'

		// if status changed by user, find column with corresponding status
		// or use original column
		const targetColumnId = taskStatus !== defaultStatus ? statusToColumnMap[taskStatus] : columnId

		const newTask: Task = {
			id: generateId(),
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
		setTasks([...tasks, newTask])
	}

	function deleteTask(id: Id) {
		const newTasks = tasks.filter((task) => task.id !== id)
		setTasks(newTasks)
	}

	function updateTask(id: Id) {
		const newTasks = tasks.map((task) => {
			if (task.id !== id) return task
			return { ...task }
		})
		setTasks(newTasks)
	}

	function updateTaskStatus(id: Id, status: string) {
		const newStatus = status as 'todo' | 'inProgress' | 'done'
		const targetColumnId = statusToColumnMap[newStatus]

		setTasks((tasks) => {
			return tasks.map((task) => {
				if (task.id !== id) return task
				return {
					...task,
					status: newStatus,
					columnId: targetColumnId,
					updatedAt: new Date().toISOString(),
				}
			})
		})
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
		if (!over) return

		// Only move columns if we're dragging a column, not a task
		const isActiveAColumn = active.data.current?.type === 'Column'
		if (!isActiveAColumn) return

		const activeColumnId = active.id
		const overColumnId = over.id
		if (activeColumnId === overColumnId) return

		// Only move columns if we're dropping over another column
		const isOverAColumn = over.data.current?.type === 'Column'
		if (!isOverAColumn) return

		setColumns((columns) => {
			const activeColumnIndex = columns.findIndex((col) => col.id === activeColumnId)
			const overColumnIndex = columns.findIndex((col) => col.id === overColumnId)
			return arrayMove(columns, activeColumnIndex, overColumnIndex)
		})
	}

	function onDragOver(event: DragOverEvent) {
		const { active, over } = event
		if (!over) return

		const activeId = active.id
		const overId = over.id

		if (activeId === overId) return
		const isActiveATask = active.data.current?.type === 'Task'
		const isOverATask = over.data.current?.type === 'Task'

		if (!isActiveATask) return

		// dropping a task over another task
		if (isActiveATask && isOverATask) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId)
				const overIndex = tasks.findIndex((t) => t.id === overId)
				const targetColumnId = tasks[overIndex].columnId
				const targetStatus = columnToStatusMap[targetColumnId]

				tasks[activeIndex].columnId = targetColumnId
				tasks[activeIndex].status = targetStatus
				tasks[activeIndex].updatedAt = new Date().toISOString()

				return arrayMove(tasks, activeIndex, overIndex)
			})
		}

		const isOverAColumn = over.data.current?.type === 'Column'
		//dropping a task over another column
		if (isActiveATask && isOverAColumn) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId)
				const targetColumnId = overId
				const targetStatus = columnToStatusMap[targetColumnId]

				tasks[activeIndex].columnId = targetColumnId
				tasks[activeIndex].status = targetStatus
				tasks[activeIndex].updatedAt = new Date().toISOString()

				return arrayMove(tasks, activeIndex, activeIndex)
			})
		}
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
								tasks={tasks.filter((task) => task.columnId === col.id)}
								deleteTask={deleteTask}
								updateTask={updateTask}
								updateTaskStatus={updateTaskStatus}
								createTask={createNewTask}
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
								tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
								deleteTask={deleteTask}
								updateTask={updateTask}
								updateTaskStatus={updateTaskStatus}
								createTask={createNewTask}
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
			<Modal ref={taskModalRef} task={activeTask} createNewTask={createNewTask} columnId={selectedColumnId} />
		</div>
	)
}
export default KanbanBoard

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

	function generateId() {
		return Math.floor(Math.random() * 1000) + 1
	}

	const createTaskModalRef = useRef<HTMLDialogElement>(null)

	function createTask(columnId: Id) {
		createTaskModalRef.current?.showModal()
	}

	function setNewTask(columnId: Id) {
		const newTask: Task = {
			id: generateId(),
			columnId,
			description: `Task №${tasks.length + 1} description`,
			title: `Task №${tasks.length + 1}`,
			status: 'todo',
			priority: 'low',
			deadline: new Date().toISOString(),
			tags: ['tag1', 'tag2'],
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

	function updateTask(id: Id, content: string) {
		const newTasks = tasks.map((task) => {
			if (task.id !== id) return task
			return { ...task, content }
		})
		setTasks(newTasks)
	}

	function onDragStart(event: DragStartEvent) {
		console.log('Drag Start', event)
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

		const activeColumnId = active.id
		const overColumnId = over.id
		if (activeColumnId === overColumnId) return

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
				tasks[activeIndex].columnId = tasks[overIndex].columnId
				return arrayMove(tasks, activeIndex, overIndex)
			})
		}

		const isOverAColumn = over.data.current?.type === 'Column'
		//dropping a task over another column
		if (isActiveATask && isOverAColumn) {
			setTasks((tasks) => {
				const activeIndex = tasks.findIndex((t) => t.id === activeId)
				tasks[activeIndex].columnId = overId
				return arrayMove(tasks, activeIndex, activeIndex)
			})
		}
	}

	return (
		<div className='flex w-full min-h-screen overflow-x-auto overflow-y-hidden'>
			<DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
				<div className='flex lg:flex-row flex-col gap-4 w-full'>
					<SortableContext items={columnsId}>
						{columns.map((col) => (
							<ColumnContainer
								key={col.id}
								column={col}
								createTask={createTask}
								tasks={tasks.filter((task) => task.columnId === col.id)}
								deleteTask={deleteTask}
								updateTask={updateTask}
								setNewTask={setNewTask}
							/>
						))}
					</SortableContext>
				</div>
				{createPortal(
					<DragOverlay>
						{activeColumn && (
							<ColumnContainer
								column={activeColumn}
								createTask={createTask}
								tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
								deleteTask={deleteTask}
								updateTask={updateTask}
								setNewTask={setNewTask}
							/>
						)}
						{activeTask && (
							<TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />
						)}
					</DragOverlay>,
					document.body
				)}
			</DndContext>
			<Modal ref={createTaskModalRef} task={activeTask} />
		</div>
	)
}
export default KanbanBoard

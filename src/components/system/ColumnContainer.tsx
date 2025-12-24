import { useMemo, useState } from 'react'
import type { Column, Id } from '../../types'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PlusIcon from './icons/PlusIcon'
import type { Task } from '../../types'
import TaskCard from './TaskCard'
import SortButton, { type SortType, type SortDirection } from '../ui/SortButton'

interface Props {
	column: Column
	tasks: Task[]
	deleteTask: (id: Id) => void
	updateTask: (id: Id) => void
	updateTaskStatus: (id: Id, status: string) => void
	createTask: (
		columnId: Id,
		data: {
			title: string
			description: string
			status: 'todo' | 'inProgress' | 'done'
			priority: 'low' | 'medium' | 'high'
			tags: string[]
			deadline: string
		}
	) => void
	openTaskModal: () => void
	onTagClick?: (tag: string) => void
	activeTags?: string[]
}

const ColumnContainer = (props: Props) => {
	const { column, openTaskModal, tasks, deleteTask, updateTask, updateTaskStatus, onTagClick, activeTags } = props
	const [sortState, setSortState] = useState<{ type: SortType; direction: SortDirection } | null>(null)

	const sortedTasks = useMemo(() => {
		if (!sortState || !sortState.direction) {
			return tasks
		}

		const sorted = [...tasks].sort((a, b) => {
			let comparison = 0

			if (sortState.type === 'dateCreated') {
				const dateA = new Date(a.createdAt).getTime()
				const dateB = new Date(b.createdAt).getTime()
				comparison = dateA - dateB
			} else if (sortState.type === 'deadline') {
				const dateA = new Date(a.deadline).getTime()
				const dateB = new Date(b.deadline).getTime()
				comparison = dateA - dateB
			}

			return sortState.direction === 'asc' ? comparison : -comparison
		})

		return sorted
	}, [tasks, sortState])

	const tasksIds = useMemo(() => {
		return sortedTasks.map((task) => task.id)
	}, [sortedTasks])

	const handleSortChange = (type: SortType, direction: SortDirection) => {
		if (direction === null) {
			setSortState(null)
		} else {
			setSortState({ type, direction })
		}
	}
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
		id: column.id,
		data: { type: 'Column', column },
	})
	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	}

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className='flex flex-col bg-base-200 border-2 border-rose-500 rounded-md w-full w-min-[350px] max-h-[500px] overflow-hidden'
			></div>
		)
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className='flex flex-col bg-base-300 rounded-md w-full h-fit max-h-[80vh] overflow-auto'
		>
			<div
				{...attributes}
				{...listeners}
				className='flex xl:flex-row flex-col justify-between items-start gap-3 p-3 border border-gray-500 rounded-lg font-bold text-md cursor-grab'
			>
				<div className='flex gap-2'>
					<div className='flex justify-center items-center px-2.5 py-1 rounded-full text-lg capitalize'>
						{column.title}
					</div>
				</div>
				<div className='flex gap-2'>
					<SortButton sortType='dateCreated' currentSort={sortState} onSortChange={handleSortChange} />
					<SortButton sortType='deadline' currentSort={sortState} onSortChange={handleSortChange} />
				</div>
			</div>

			<div className='flex flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto grow'>
				<SortableContext items={tasksIds} strategy={verticalListSortingStrategy}>
					{sortedTasks.map((task) => (
						<TaskCard
							key={task.id}
							task={task}
							deleteTask={deleteTask}
							updateTask={updateTask}
							updateTaskStatus={updateTaskStatus}
							onTagClick={onTagClick}
							activeTags={activeTags}
						/>
					))}
				</SortableContext>
			</div>

			<button
				onClick={() => {
					openTaskModal()
				}}
				className='flex items-center gap-2 hover:bg-mainBackgroundColor active:bg-black p-2 border-columnBackgroundColor border-x-columnBackgroundColor rounded-md hover:text-rose-500 border2'
			>
				<PlusIcon />
				Add Task to {column.title}
			</button>
		</div>
	)
}

export default ColumnContainer

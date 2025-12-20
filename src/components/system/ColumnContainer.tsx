import { useMemo } from 'react'
import type { Column, Id } from '../../types'
import { useSortable, SortableContext } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PlusIcon from './icons/PlusIcon'
import type { Task } from '../../types'
import TaskCard from './TaskCard'

interface Props {
	column: Column
	tasks: Task[]
	createTask: (columnId: Id) => void
	deleteTask: (id: Id) => void
	updateTask: (id: Id, content: string) => void
	setNewTask: (columnId: Id) => void
}

const ColumnContainer = (props: Props) => {
	const { column, createTask, tasks, deleteTask, updateTask } = props
	const tasksIds = useMemo(() => {
		return tasks.map((task) => task.id)
	}, [tasks])
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
				className='flex flex-col bg-base-200 border-2 border-rose-500 rounded-md w-full w-min-[350px] h-[500px] max-h-[500px]'
			></div>
		)
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className='flex flex-col bg-base-300 rounded-md w-full h-[500px] max-h-[500px]'
		>
			{/* Column Title*/}
			<div
				{...attributes}
				{...listeners}
				className='flex justify-between items-center bg-mainBackgroundColor p-3 border-4 border-columnBackgroundColor rounded-b-none h-[60px] font-bold text-md cursor-grab'
			>
				<div className='flex gap-2'>
					<div className='flex justify-center items-center bg-columnBackgroundColor px-2.5 py-1 rounded-full text-sm'>
						{column.title}
					</div>
				</div>
			</div>

			{/* Column Task Container*/}
			<div className='flex flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto grow'>
				<SortableContext items={tasksIds}>
					{tasks.map((task) => (
						<TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />
					))}
				</SortableContext>
			</div>

			{/* Column Footer*/}
			<button
				onClick={() => {
					createTask(column.id)
				}}
				className='flex items-center gap-2 hover:bg-mainBackgroundColor active:bg-black p-2 border-columnBackgroundColor border-x-columnBackgroundColor rounded-md hover:text-rose-500 border2'
			>
				<PlusIcon />
				Add Task
			</button>
		</div>
	)
}

export default ColumnContainer

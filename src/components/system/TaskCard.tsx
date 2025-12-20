import { useState } from 'react'
import TrashIcon from './icons/TrashIcon'
import type { Id, Task } from '../../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
	task: Task
	deleteTask: (id: Id) => void
	updateTask: (id: Id, content: string) => void
}

const TaskCard = ({ task, deleteTask, updateTask }: Props) => {
	const [mouseIsOver, setMouseIsOver] = useState(false)
	const [editMode, setEditMode] = useState(false)
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
		id: task.id,
		data: { type: 'Task', task },
		disabled: editMode,
	})
	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	}

	const toggleEditMode = () => {
		setEditMode((prev) => !prev)
	}

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className='relative flex flex-left items-center bg-mainBackgroundColor opacity-30 p-2.5 border-2 border-rose-500 rounded-xl h-[100px] min-h-[100px] cursor-grab'
			/>
		)
	}

	if (editMode) {
		return (
			<div
				{...attributes}
				{...listeners}
				ref={setNodeRef}
				style={style}
				className='relative flex flex-left items-center bg-base-100 p-2.5 rounded-xl hover:ring-2 hover:ring-rose-500 hover:ring-inset h-[100px] min-h-[100px] cursor-grab task'
			>
				<textarea
					className='bg-transparent border-none rounded focus:outline-none w-full h-[90%] text-white resize-none'
					value={task.title}
					autoFocus
					placeholder='Task content here'
					onBlur={toggleEditMode}
					onKeyDown={(e) => {
						if (e.shiftKey && e.key == 'Enter') toggleEditMode()
					}}
					onChange={(e) => updateTask(task.id, e.target.value)}
				></textarea>
			</div>
		)
	}

	return (
		<div
			onClick={toggleEditMode}
			onMouseEnter={() => {
				setMouseIsOver(true)
			}}
			onMouseLeave={() => {
				setMouseIsOver(false)
			}}
			{...attributes}
			{...listeners}
			ref={setNodeRef}
			style={style}
			className='relative flex flex-left items-center bg-base-200 p-2.5 rounded-xl hover:ring-2 hover:ring-rose-500 hover:ring-inset h-[100px] min-h-[100px] cursor-grab'
		>
			<p className='my-auto w-full h-[90%] overflow-x-hidden overflow-y-auto whitespace-pre-wrap'>
				{' '}
				{task.title}
			</p>
			{mouseIsOver && (
				<button
					onClick={() => {
						deleteTask(task.id)
					}}
					className='top-1/2 right-4 absolute bg-columnBackgroundColor stroke-white p-2 rounded -translate-y-1/2'
				>
					<TrashIcon />
				</button>
			)}
		</div>
	)
}

export default TaskCard

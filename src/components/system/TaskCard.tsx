import { useState } from 'react'
import TrashIcon from './icons/TrashIcon'
import type { Id, Task } from '../../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import cls from 'classnames'
import PenIcon from './icons/PenIcon'
import Select from '../ui/form/SelectStatus'

interface Props {
	task: Task
	deleteTask: (id: Id) => void
	updateTask: (id: Id) => void
	updateTaskStatus: (id: Id, status: string) => void
}

const TaskCard = ({ task, deleteTask, updateTask, updateTaskStatus }: Props) => {
	const [mouseIsOver, setMouseIsOver] = useState(false)
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
		id: task.id,
		data: { type: 'Task', task },
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
				className='relative flex flex-left items-center bg-mainBackgroundColor opacity-30 p-2.5 border-2 border-rose-500 rounded-xl h-[100px] min-h-[100px] overflow-hidden cursor-grab'
			/>
		)
	}

	function calcTimeToDeadLine(time: string): string {
		const now = new Date()
		const deadline = new Date(time)

		// Reset time to start of day for accurate day calculation
		const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
		const deadlineStart = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())

		const diff = deadlineStart.getTime() - nowStart.getTime()
		const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24))

		console.log(diffInDays)

		if (diffInDays === 0) {
			return 'today'
		}

		if (diffInDays === 1) {
			return 'tomorrow'
		}

		if (diffInDays === -1) {
			return 'yesterday'
		}

		if (diffInDays < 0) {
			return 'overdue'
		} else {
			return `in ${diffInDays} days`
		}
	}

	return (
		<div
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
			className={cls(
				'relative flex flex-col bg-base-200 p-3 border-2 border-transparent  rounded-xl hover:ring-2 hover:ring-gray-500 hover:ring-inset h-fit transition-all duration-300 cursor-grab',
				task.status === 'todo' && 'border-l-red-500',
				task.status === 'inProgress' && 'border-l-yellow-500',
				task.status === 'done' && 'border-l-green-500'
			)}
		>
			<div className=''>
				<div className='flex flex-row flex-wrap justify-between gap-2'>
					<div className=''>
						<span className='font-bold'>{task.title}</span>
					</div>
					<div
						className={cls(
							'px-2 py-1 rounded-md text-[.75rem]',
							task.priority === 'low'
								? 'bg-green-700'
								: task.priority === 'medium'
								? 'bg-yellow-700'
								: 'bg-red-700'
						)}
					>
						{task.priority}
					</div>
				</div>
				<div className='flex flex-col gap-2 mt-3'>
					<div className=''>{task.description}</div>
					<div className=''>
						<Select
							options={[
								{ label: 'Todo', value: 'todo' },
								{ label: 'In Progress', value: 'inProgress' },
								{ label: 'Done', value: 'done' },
							]}
							id='status'
							name='status'
							title='Status'
							className='bg-base-200 p-0 focus:border-transparent focus:outline-0 w-full select-ghost'
							value={task.status}
							floatLabel={false}
							onChange={(e) => {
								updateTaskStatus(task.id, e.target.value)
							}}
						/>
					</div>
				</div>
				<div className='mt-3'>{calcTimeToDeadLine(task.deadline)}</div>
				<div className='mt-3'>
					<div className='flex flex-row flex-wrap gap-2'>
						{task.tags.map((tag) => (
							<div
								className='flex flex-row items-center gap-1 px-2 py-1 border rounded-md text-[.75rem]'
								key={tag}
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									strokeWidth={1.5}
									stroke='currentColor'
									className='size-3'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='m8.25 4.5 7.5 7.5-7.5 7.5'
									/>
								</svg>

								<span>{tag}</span>
							</div>
						))}
					</div>
				</div>
			</div>
			<div
				className={cls(
					'right-2 bottom-0 absolute flex flex-row gap-2 transition-opacity duration-400 ease-in',
					mouseIsOver && 'opacity-100',
					!mouseIsOver && 'opacity-0'
				)}
			>
				<div className=''>
					<button
						onClick={() => {
							updateTask(task.id)
						}}
						className='stroke-base-content cursor-pointer'
					>
						<PenIcon />
					</button>
				</div>
				<div className=''>
					<button
						onClick={() => {
							deleteTask(task.id)
						}}
						className='stroke-base-content cursor-pointer'
					>
						<TrashIcon />
					</button>
				</div>
			</div>
		</div>
	)
}

export default TaskCard

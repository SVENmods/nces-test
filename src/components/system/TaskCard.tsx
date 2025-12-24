import { useState, useRef, useCallback } from 'react'
import TrashIcon from './icons/TrashIcon'
import type { Id, Task } from '../../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import cls from 'classnames'
import PenIcon from './icons/PenIcon'
import Select from '../ui/form/selectStatus'
import { Link } from 'react-router-dom'
import DeleteConfirmModal from '../ui/DeleteConfirmModal'
import { calcTimeToDeadline, formatDate } from '../../utils/dateUtils'

interface Props {
	task: Task
	deleteTask: (id: Id) => void
	updateTask: (id: Id) => void
	updateTaskStatus: (id: Id, status: string) => void
	onTagClick?: (tag: string) => void
	activeTags?: string[]
}

const TaskCard = ({ task, deleteTask, updateTask, updateTaskStatus, onTagClick, activeTags = [] }: Props) => {
	const [mouseIsOver, setMouseIsOver] = useState(false)
	const deleteModalRef = useRef<HTMLDialogElement>(null)
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
		id: task.id,
		data: { type: 'Task', task },
	})
	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	}

	function handleDeleteClick(e: React.MouseEvent) {
		e.stopPropagation()
		deleteModalRef.current?.showModal()
	}

	function handleConfirmDelete() {
		deleteTask(task.id)
	}

	const handleTagClick = useCallback(
		(tag: string, e: React.MouseEvent) => {
			e.stopPropagation()
			onTagClick?.(tag)
		},
		[onTagClick]
	)

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className='relative flex flex-col bg-base-200 p-3 border-2 border-base-content rounded-xl h-[250px] overflow-hidden cursor-grab'
			/>
		)
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
				'relative flex flex-col bg-base-200 p-3 border-2 border-transparent rounded-xl hover:ring-2 hover:ring-gray-500 hover:ring-inset h-fit transition-all duration-300 cursor-grab ',
				task.status === 'todo' && 'border-l-red-500',
				task.status === 'inProgress' && 'border-l-yellow-500',
				task.status === 'done' && 'border-l-green-500'
			)}
		>
			<div>
				<div className='flex flex-row justify-between items-start gap-2'>
					<Link to={`/tasks/${task.id}`} className='block w-full'>
						<span
							className='tooltip-bottom font-bold hover:text-gray-500 transition-all duration-300 tooltip'
							data-tip={'Open task'}
						>
							{task.title.length > 30 ? task.title.slice(0, 30) + '...' : task.title}
						</span>
					</Link>
					<div
						className={cls(
							'px-2 py-1 rounded-md text-[.75rem] text-white',
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
					{task.description && <div className='line-clamp-3'>{task.description}</div>}
					<div>
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
							onChange={(e) => {
								updateTaskStatus(task.id, e.target.value)
							}}
						/>
					</div>
				</div>
				<div className='mt-3'>
					<div className='flex flex-row flex-wrap justify-between gap-2'>
						<div className=''>
							<h3 className='font-semibold text-gray-500 text-sm'>Deadline</h3>
							<div className={'tooltip tooltip-right'} data-tip={formatDate(task.deadline)}>
								<div className={cls(calcTimeToDeadline(task.deadline).color, 'mt-1')}>
									{calcTimeToDeadline(task.deadline).text}
								</div>
							</div>
						</div>

						<div>
							<h3 className='font-semibold text-gray-500 text-sm'>Created</h3>
							<span className='mt-1 text-sm'>{formatDate(task.createdAt)}</span>
						</div>
					</div>
				</div>
				<div className='mt-3'>
					<div className='flex flex-row flex-wrap gap-2'>
						{task.tags.map((tag) => {
							const isActive = activeTags.includes(tag)
							return (
								<div
									className={cls(
										'flex flex-row items-center gap-1 px-2 py-1 border rounded-md text-[.75rem] transition-all cursor-pointer',
										isActive
											? 'bg-primary text-primary-content border-primary shadow-md'
											: 'hover:bg-base-300 hover:border-base-content'
									)}
									key={tag}
									onClick={(e) => handleTagClick(tag, e)}
									title={isActive ? 'Click to remove filter' : 'Click to filter by this tag'}
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
							)
						})}
					</div>
				</div>
			</div>
			<div
				className={cls(
					'flex flex-row justify-end gap-2 transition-opacity duration-400 ease-in',
					mouseIsOver && 'opacity-100',
					!mouseIsOver && 'opacity-0'
				)}
			>
				<button
					onClick={() => updateTask(task.id)}
					className='stroke-base-content cursor-pointer'
					aria-label='Edit task'
				>
					<PenIcon />
				</button>
				<button
					onClick={handleDeleteClick}
					className='stroke-base-content cursor-pointer'
					aria-label='Delete task'
				>
					<TrashIcon />
				</button>
			</div>
			<DeleteConfirmModal ref={deleteModalRef} task={task} onConfirm={handleConfirmDelete} />
		</div>
	)
}

export default TaskCard

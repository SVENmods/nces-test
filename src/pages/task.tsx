import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import type { Task, Id } from '../types'
import cls from 'classnames'
import Modal from '../components/ui/modal'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import PenIcon from '../components/system/icons/PenIcon'
import TrashIcon from '../components/system/icons/TrashIcon'
import { STATUS_TO_COLUMN_MAP } from '../utils/constants'
import {
	getTaskFromStorage,
	loadTasksFromStorage,
	updateTask as syncTaskToServer,
	removeTask,
	saveTasksToStorage,
} from '../utils/storage'
import { calcTimeToDeadline, formatDate } from '../utils/dateUtils'

const TaskPage = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const [task, setTask] = useState<Task | null>(null)
	const [loading, setLoading] = useState(true)
	const taskModalRef = useRef<HTMLDialogElement>(null)
	const deleteModalRef = useRef<HTMLDialogElement>(null)
	const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null)

	useEffect(() => {
		if (!id) return

		const loadTask = async () => {
			setLoading(true)
			const foundTask = getTaskFromStorage(id)
			setTask(foundTask)
			setLoading(false)
		}

		loadTask()
	}, [id])

	function updateTask() {
		if (task) {
			setSelectedTaskForEdit(task)
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
		const tasks = loadTasksFromStorage()
		const taskStatus = (data.status || 'todo') as 'todo' | 'inProgress' | 'done'
		const targetColumnId = STATUS_TO_COLUMN_MAP[taskStatus]

		const updatedTasks = tasks.map((t) => {
			if (t.id !== taskId) return t
			return {
				...t,
				title: data.title,
				description: data.description,
				status: taskStatus,
				priority: data.priority as 'low' | 'medium' | 'high',
				tags: data.tags,
				deadline: data.deadline,
				columnId: targetColumnId,
				updatedAt: new Date().toISOString(),
			}
		})

		const updatedTask = updatedTasks.find((t) => t.id === taskId) || null
		setTask(updatedTask)
		setSelectedTaskForEdit(null)

		// Sync with server using syncTaskToServer PATCH request
		await syncTaskToServer(taskId, {
			title: data.title,
			description: data.description,
			status: taskStatus,
			priority: data.priority as 'low' | 'medium' | 'high',
			tags: data.tags,
			deadline: data.deadline,
			columnId: targetColumnId,
		})
	}

	async function deleteTask() {
		if (!task) return

		const tasks = loadTasksFromStorage()
		const updatedTasks = tasks.filter((t) => t.id !== task.id)
		// Save to localStorage
		saveTasksToStorage(updatedTasks)

		// Sync with server using removeTask
		await removeTask(task.id)

		navigate('/')
	}

	function handleDeleteClick() {
		if (task) {
			deleteModalRef.current?.showModal()
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'todo':
				return 'Todo'
			case 'inProgress':
				return 'In Progress'
			case 'done':
				return 'Done'
			default:
				return status
		}
	}

	if (loading) {
		return (
			<div className='flex justify-center items-center min-h-[60vh]'>
				<span className='loading loading-spinner loading-lg'></span>
			</div>
		)
	}

	if (!task) {
		return (
			<div className='flex flex-col justify-center items-center gap-4 min-h-[60vh]'>
				<h2 className='font-bold text-2xl'>Task not found</h2>
				<p className='text-gray-500'>The task with ID {id} does not exist.</p>
				<button onClick={() => navigate('/')} className='rounded-lg btn btn-primary'>
					Go to Home
				</button>
			</div>
		)
	}

	return (
		<div className='mx-auto px-4 py-8 max-w-4xl overflow-x-hidden container'>
			<button onClick={() => navigate('/')} className='rounded-lg btn btn-ghost'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth={1.5}
					stroke='currentColor'
					className='mr-2 w-5 h-5'
				>
					<path strokeLinecap='round' strokeLinejoin='round' d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18' />
				</svg>
				Back to Home
			</button>

			<div className='bg-base-200 shadow-lg mt-6 p-6 rounded-xl'>
				<div className='flex md:flex-row flex-col md:justify-between md:items-start gap-4'>
					<div className='flex-1'>
						{/* <span className='block border border-base-content rounded-lg badge badge-lg'>
							#{task.number}
						</span> */}
						<div className='flex items-center gap-3 mt-2'>
							<h1 className='font-bold text-3xl'>{task.title}</h1>
						</div>
						{task.description && <p className='mt-2 text-gray-600'>{task.description}</p>}
					</div>
					<div className='flex items-center gap-3'>
						<div
							className={cls(
								'px-4 py-2 rounded-lg font-semibold text-sm',
								task.status === 'todo' && 'bg-red-100 text-red-800',
								task.status === 'inProgress' && 'bg-yellow-100 text-yellow-800',
								task.status === 'done' && 'bg-green-100 text-green-800'
							)}
						>
							{getStatusLabel(task.status)}
						</div>
						<div className='flex gap-2'>
							<button
								onClick={updateTask}
								className='stroke-base-content cursor-pointer btn btn-sm btn-ghost'
								title='Edit task'
							>
								<PenIcon />
							</button>
							<button
								onClick={handleDeleteClick}
								className='stroke-base-content cursor-pointer btn btn-sm btn-ghost'
								title='Delete task'
							>
								<TrashIcon />
							</button>
						</div>
					</div>
				</div>

				<div className='gap-6 grid grid-cols-1 md:grid-cols-2 mt-6'>
					<div>
						<h3 className='mb-0 font-semibold text-gray-500 text-sm'>Priority</h3>
						<div
							className={cls(
								'inline-block px-3 py-1 rounded-md text-sm font-medium mt-2',
								task.priority === 'low'
									? 'bg-green-700 text-white'
									: task.priority === 'medium'
									? 'bg-yellow-700 text-white'
									: 'bg-red-700 text-white'
							)}
						>
							{task.priority}
						</div>
					</div>

					<div>
						<h3 className='mb-0 font-semibold text-gray-500 text-sm'>Deadline</h3>
						<div className='flex flex-col mt-2'>
							<span className='font-medium'>{calcTimeToDeadline(task.deadline).text}</span>
							<span className='text-gray-500 text-sm'>{formatDate(task.deadline)}</span>
						</div>
					</div>

					<div>
						<h3 className='mb-0 font-semibold text-gray-500 text-sm'>Created</h3>
						<span className='mt-2 text-sm'>{formatDate(task.createdAt)}</span>
					</div>

					<div>
						<h3 className='mb-0 font-semibold text-gray-500 text-sm'>Last Updated</h3>
						<span className='mt-2 text-sm'>{formatDate(task.updatedAt)}</span>
					</div>
				</div>

				{task.tags && task.tags.length > 0 && (
					<div className='mt-6'>
						<h3 className='mb-0 font-semibold text-gray-500 text-sm'>Tags</h3>
						<div className='flex flex-wrap gap-2 mt-3'>
							{task.tags.map((tag) => (
								<div
									key={tag}
									className='flex items-center gap-1 bg-base-100 px-3 py-1 border rounded-md text-sm'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										strokeWidth={1.5}
										stroke='currentColor'
										className='w-4 h-4'
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
				)}

				<div
					className={cls(
						'h-2 rounded-b-xl -mx-6 mt-6',
						task.status === 'todo' && 'bg-red-500',
						task.status === 'inProgress' && 'bg-yellow-500',
						task.status === 'done' && 'bg-green-500'
					)}
				></div>
			</div>

			<Modal
				ref={taskModalRef}
				task={selectedTaskForEdit}
				editTask={!!selectedTaskForEdit}
				createNewTask={() => {}}
				updateExistingTask={updateExistingTask}
				columnId={task?.columnId || null}
			/>

			<DeleteConfirmModal ref={deleteModalRef} task={task} onConfirm={deleteTask} />
		</div>
	)
}

export default TaskPage

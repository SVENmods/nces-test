import { forwardRef, useState, useRef, useMemo, useEffect, startTransition } from 'react'
import type { FormEvent } from 'react'
import type { Task, Id } from '../../types'
import Input from './form/Input'
import Textarea from './form/textarea'
import Select from './form/selectStatus'
import RadioGroup from './form/radioGroup'
import DatePicker from './form/DatePicker'
import MultiSelect from './form/MultiSelect'
import { COLUMN_TO_STATUS_MAP } from '../../utils/constants'

interface Props {
	editTask?: boolean
	task?: Task | null
	columnId?: Id | null
	createNewTask: (
		columnId: Id,
		data: {
			title: string
			description: string
			status: string
			priority: string
			tags: string[]
			deadline: string
		}
	) => void
	updateExistingTask?: (
		taskId: Id,
		data: {
			title: string
			description: string
			status: string
			priority: string
			tags: string[]
			deadline: string
		}
	) => void
}

const Modal = forwardRef<HTMLDialogElement, Props>(
	({ editTask = false, task, createNewTask, updateExistingTask, columnId }, ref) => {
		const formRef = useRef<HTMLFormElement>(null)

		const initialStatus = useMemo(() => {
			if (editTask && task) {
				return task.status
			}
			return columnId ? COLUMN_TO_STATUS_MAP[columnId] || 'todo' : 'todo'
		}, [columnId, editTask, task])

		// Calculate initial values for state
		const initialDate = useMemo(() => {
			if (editTask && task?.deadline) {
				return new Date(task.deadline)
			}
			return undefined
		}, [editTask, task])

		const initialTags = useMemo(() => {
			if (editTask && task) {
				return task.tags || []
			}
			return []
		}, [editTask, task])

		const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate)
		const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)
		const [dateError, setDateError] = useState<string>('')
		const [validationErrors, setValidationErrors] = useState<{
			title?: string
			description?: string
			status?: string
			priority?: string
			deadline?: string
			tags?: string
		}>({})

		// Update state only when initial values changed
		useEffect(() => {
			startTransition(() => {
				if (editTask && task) {
					if (initialDate !== undefined) {
						setSelectedDate(initialDate)
					}
					setSelectedTags(initialTags)
				} else {
					setSelectedDate(undefined)
					setSelectedTags([])
					setDateError('')
					setValidationErrors({})
				}
			})
		}, [editTask, task, initialDate, initialTags])

		// Update form values separately
		useEffect(() => {
			if (editTask && task && formRef.current) {
				const titleInput = formRef.current.querySelector('[name="title"]') as HTMLInputElement
				if (titleInput) {
					titleInput.value = task.title
				}

				const descriptionInput = formRef.current.querySelector(
					'[name="description"]'
				) as HTMLTextAreaElement
				if (descriptionInput) {
					descriptionInput.value = task.description || ''
				}

				const statusSelect = formRef.current.querySelector('[name="status"]') as HTMLSelectElement
				if (statusSelect) {
					statusSelect.value = task.status
				}
			} else {
				if (formRef.current) {
					formRef.current.reset()
				}
				startTransition(() => {
					setValidationErrors({})
				})
			}
		}, [editTask, task])

		useEffect(() => {
			if (!editTask && formRef.current && columnId) {
				const statusSelect = formRef.current.querySelector('[name="status"]') as HTMLSelectElement
				if (statusSelect) {
					statusSelect.value = initialStatus
				}
			}
		}, [columnId, initialStatus, editTask])

		const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
			e.preventDefault()

			const form = formRef.current
			if (!form) return

			const formData = new FormData(form)
			const title = (formData.get('title') as string)?.trim() || ''
			const description = (formData.get('description') as string)?.trim() || ''
			const status = (formData.get('status') as string)?.trim() || ''
			const priority = (formData.get('priority') as string)?.trim() || ''

			// Validation errors
			const errors: typeof validationErrors = {}

			// Validation deadline
			if (!selectedDate) {
				errors.deadline = 'Please select a deadline date'
				setDateError('Please select a deadline date')
			}

			// Validation tags
			if (!selectedTags || selectedTags.length === 0) {
				errors.tags = 'Please select at least one tag'
			}

			// If there are errors, show them all at once and do not send the form
			if (Object.keys(errors).length > 0) {
				setValidationErrors(errors)
				return
			}

			// If there are no errors, clear the error state and send the form
			setValidationErrors({})
			setDateError('')

			if (editTask && task && updateExistingTask) {
				updateExistingTask(task.id, {
					title,
					description: description || '',
					status: status || 'todo',
					priority: priority || 'low',
					tags: selectedTags,
					deadline: selectedDate!.toISOString(),
				})
			} else {
				if (!columnId) return
				createNewTask(columnId, {
					title,
					description: description || '',
					status: status || 'todo',
					priority: priority || 'low',
					tags: selectedTags,
					deadline: selectedDate!.toISOString(),
				})
			}

			if (ref && 'current' in ref && ref.current) {
				ref.current.close()
			}

			form.reset()
			setSelectedDate(undefined)
			setSelectedTags([])
			setDateError('')
			setValidationErrors({})
		}

		const resetForm = () => {
			if (formRef.current && !editTask) {
				formRef.current.reset()
				setDateError('')
				setValidationErrors({})
			}
		}

		return (
			<>
				<dialog ref={ref} id='create-task-modal' className='modal'>
					<div className='w-full max-w-5xl h-fit modal-box'>
						<form method='dialog' onSubmit={resetForm}>
							<button
								className='top-2 right-2 absolute btn btn-sm btn-circle btn-ghost'
								aria-label='Close modal'
							>
								✕
							</button>
						</form>
						<h3 className='font-bold text-lg'>
							{editTask && task ? `Edit Task ${task.number}` : 'Create Task'}
						</h3>
						<form ref={formRef} className='mt-4' onSubmit={handleSubmit}>
							<div className='flex flex-col'>
								<div>
									<Input
										label='Title'
										placeholder='Enter title'
										type='text'
										className='w-full validator'
										minLength={5}
										required={true}
										id='title'
										name='title'
										pattern='^[a-zA-Z0-9А-Яа-я ]+$'
										title='Title must be more than 5 characters and less than 255 characters and contain only letters, numbers, and spaces.'
										validatorText='Title must be more than 5 characters and less than 255 characters and contain only letters, numbers, and spaces.'
										maxLength={255}
									/>
								</div>
								<div className='mt-2'>
									<Textarea
										placeholder='Description must be less than 500 characters.'
										id='description'
										name='description'
										className='w-full'
										maxLength={500}
										title='Description'
									/>
								</div>
								<div className='mt-6.5'>
									<Select
										key={`status-${
											editTask ? task?.id : 'new'
										}-${initialStatus}-${columnId}`}
										options={[
											{ label: 'Todo', value: 'todo' },
											{ label: 'In Progress', value: 'inProgress' },
											{ label: 'Done', value: 'done' },
										]}
										id='status'
										name='status'
										title='Status'
										className='w-full'
										defaultValue={initialStatus}
										floatLabel={'status'}
										required={true}
									/>
								</div>
								<div className='mt-4.5'>
									<RadioGroup
										key={`priority-${editTask ? task?.id : 'new'}-${
											editTask && task ? task.priority : 'low'
										}`}
										name='priority'
										id='priority'
										defaultValue={
											editTask && task
												? (task.priority as 'low' | 'medium' | 'high')
												: 'low'
										}
									/>
								</div>
								<div className='mt-4.5'>
									<DatePicker
										name='deadline'
										id='deadline'
										selectedDate={selectedDate}
										onDateChange={(date) => {
											setSelectedDate(date)
											if (date) {
												setDateError('')
												setValidationErrors((prev) => {
													const newErrors = { ...prev }
													delete newErrors.deadline
													return newErrors
												})
											}
										}}
										required={true}
									/>
									{(dateError || validationErrors.deadline) && (
										<p className='mt-1 text-[0.75rem] text-error'>
											{dateError || validationErrors.deadline}
										</p>
									)}
								</div>
								<div className='mt-4.5'>
									<MultiSelect
										name='tags'
										id='tags'
										onTagsChange={(tags) => {
											setSelectedTags(tags)
											if (tags && tags.length > 0) {
												setValidationErrors((prev) => {
													const newErrors = { ...prev }
													delete newErrors.tags
													return newErrors
												})
											}
										}}
										value={selectedTags}
										required={true}
									/>
									{validationErrors.tags && (
										<p className='mt-1 text-[0.75rem] text-error'>
											{validationErrors.tags}
										</p>
									)}
								</div>
							</div>
							<button type='submit' className='mt-6 rounded-lg btn btn-primary'>
								{editTask ? 'Update Task' : 'Create Task'}
							</button>
						</form>
					</div>
					<form method='dialog' className='modal-backdrop' onSubmit={resetForm}>
						<button>close</button>
					</form>
				</dialog>
			</>
		)
	}
)

Modal.displayName = 'Modal'

export default Modal

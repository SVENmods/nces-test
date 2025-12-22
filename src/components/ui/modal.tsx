import { forwardRef, useState, useRef, useMemo, useEffect } from 'react'
import type { FormEvent } from 'react'
import type { Task, Id } from '../../types'
import Input from './form/Input'
import Textarea from './form/Textarea'
import Select from './form/SelectStatus'
import RadioGroup from './form/RadioGroup'
import DatePicker from './form/DatePicker'
import MultiSelect from './form/MultiSelect'

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
}

// mapping between columns and statuses
const columnToStatusMap: Record<Id, 'todo' | 'inProgress' | 'done'> = {
	1: 'todo',
	2: 'inProgress',
	3: 'done',
}

const Modal = forwardRef<HTMLDialogElement, Props>(({ editTask = false, task, createNewTask, columnId }, ref) => {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>()
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [dateError, setDateError] = useState<string>('')
	const formRef = useRef<HTMLFormElement>(null)

	// define default status based on column
	const initialStatus = useMemo(() => {
		return columnId ? columnToStatusMap[columnId] || 'todo' : 'todo'
	}, [columnId])

	// update value in form when columnId changes
	useEffect(() => {
		if (formRef.current && columnId) {
			const statusSelect = formRef.current.querySelector('[name="status"]') as HTMLSelectElement
			if (statusSelect) {
				statusSelect.value = initialStatus
			}
		}
	}, [columnId, initialStatus])

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!columnId) return

		// validate date
		if (!selectedDate) {
			setDateError('Please select a deadline date')
			return
		}

		// clear error if date is selected
		setDateError('')

		const form = formRef.current
		if (!form) return

		const formData = new FormData(form)
		const title = formData.get('title') as string
		const description = formData.get('description') as string
		const status = formData.get('status') as string
		const priority = formData.get('priority') as string

		createNewTask(columnId, {
			title,
			description: description || '',
			status: status || 'todo',
			priority: priority || 'low',
			tags: selectedTags,
			deadline: selectedDate.toISOString(),
		})

		// close modal
		if (ref && 'current' in ref && ref.current) {
			ref.current.close()
		}

		form.reset()
		setSelectedDate(undefined)
		setSelectedTags([])
		setDateError('')
	}

	return (
		<>
			<dialog ref={ref} id='create-task-modal' className='modal'>
				<div className='w-full max-w-5xl h-[70%] modal-box'>
					<form method='dialog'>
						{/* if there is a button in form, it will close the modal */}
						<button className='top-2 right-2 absolute btn btn-sm btn-circle btn-ghost'>✕</button>
					</form>
					<h3 className='font-bold text-lg'>
						{editTask && task ? `Edit Task ${task.number}` : 'Create Task'}
					</h3>
					<form ref={formRef} className='mt-4' onSubmit={handleSubmit}>
						<div className='flex flex-col'>
							<div className=''>
								<Input
									label='Title'
									placeholder='Enter title'
									type='text'
									className='w-full validator'
									minLength={5}
									required={true}
									id='title'
									name='title'
									pattern='^[a-zA-Z0-9А-Яа-я]+$'
									title='Title must be more than 5 characters.'
									validatorText='Title must be more than 5 characters.'
								/>
							</div>
							<div className='mt-2'>
								<Textarea
									placeholder='Description'
									type='text'
									id='description'
									name='description'
									className='w-full'
									maxLength={500}
									title='Description'
								/>
							</div>
							<div className='mt-6.5'>
								<Select
									key={`status-${initialStatus}-${columnId}`}
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
								/>
							</div>
							<div className='mt-4.5'>
								<RadioGroup name='priority' id='priority' />
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
										}
									}}
									required={true}
								/>
								{dateError && <p className='mt-1 text-error text-sm'>{dateError}</p>}
							</div>
							<div className='mt-4.5'>
								<MultiSelect
									name='tags'
									id='tags'
									onTagsChange={setSelectedTags}
									required={true}
								/>
							</div>
						</div>
						<button type='submit' className='mt-4 btn btn-primary'>
							Create Task
						</button>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop'>
					<button>close</button>
				</form>
			</dialog>
		</>
	)
})

Modal.displayName = 'Modal'

export default Modal

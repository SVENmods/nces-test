import { forwardRef } from 'react'
import type { Task } from '../../types'
import Input from './form/Input'
import Textarea from './form/Textarea'
import Select from './form/SelectStatus'
import RadioGroup from './form/RadioGroup'
import DatePicker from './form/DatePicker'
import MultiSelect from './form/MultiSelect'

interface Props {
	editTask?: boolean
	task?: Task | null
}

const Modal = forwardRef<HTMLDialogElement, Props>(({ editTask = false, task }, ref) => {
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
					<form className='mt-4'>
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
									pattern='^[a-zA-Z0-9]+$'
									title='Title must be more than 5 characters, not allowed special characters'
									validatorText='Title must be more than 5 characters, not allowed special characters'
								/>
							</div>
							<div className='mt-2'>
								<Textarea
									placeholder='Description'
									type='text'
									id='description'
									className='w-full'
									maxLength={500}
									title='Description'
								/>
							</div>
							<div className='mt-6.5'>
								<Select
									options={[
										{ label: 'Todo', value: 'todo' },
										{ label: 'In Progress', value: 'inProgress' },
										{ label: 'Done', value: 'done' },
									]}
									id='status'
									title='Status'
									className='w-full'
								/>
							</div>
							<div className='mt-4.5'>
								<RadioGroup />
							</div>
							<div className='mt-4.5'>
								<DatePicker />
							</div>
							<div className='mt-4.5'>
								<MultiSelect />
							</div>
						</div>
						<button type='submit'>Create Task</button>
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

import { forwardRef } from 'react'
import type { Task } from '../../types'

interface Props {
	task: Task | null
	onConfirm: () => void
}

const DeleteConfirmModal = forwardRef<HTMLDialogElement, Props>(({ task, onConfirm }, ref) => {
	const handleConfirm = () => {
		onConfirm()
		if (ref && 'current' in ref && ref.current) {
			ref.current.close()
		}
	}

	return (
		<dialog ref={ref} id='delete-confirm-modal' className='modal'>
			<div className='modal-box'>
				<form method='dialog'>
					<button
						className='top-2 right-2 absolute btn btn-sm btn-circle btn-ghost'
						aria-label='Close modal'
					>
						✕
					</button>
				</form>
				<h3 className='font-bold text-lg'>Delete Task</h3>
				<p className='py-4'>
					Are you sure you want to delete task <span className='font-bold'>"{task?.title}"</span>? This
					action cannot be undone.
				</p>
				<div className='modal-action'>
					<form method='dialog'>
						<button className='btn'>Cancel</button>
					</form>
					<button onClick={handleConfirm} className='btn btn-error'>
						Delete
					</button>
				</div>
			</div>
			<form method='dialog' className='modal-backdrop'>
				<button>close</button>
			</form>
		</dialog>
	)
})

DeleteConfirmModal.displayName = 'DeleteConfirmModal'

export default DeleteConfirmModal

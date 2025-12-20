import cls from 'classnames'

const RadioGroup = () => {
	const radioClasses = 'hidden radio w-[0.1px] h-[0.1px]'
	const labelClasses = 'cursor-pointer border rounded-lg p-2 transition-all duration-300'

	return (
		<>
			<div className='flex flex-col'>
				<span className='font-normal text-sm'>Priority</span>
				<div className='flex gap-2 mt-2'>
					<label
						htmlFor='priority-low'
						className={cls(
							'text-green-700 hover:bg-green-700 hover:text-white has-checked:bg-green-700 has-checked:text-white',
							labelClasses
						)}
					>
						low
						<input
							type='radio'
							name='priority'
							className={cls(radioClasses, '')}
							aria-label='low'
							value='low'
							defaultChecked
							title='Low'
							id='priority-low'
						/>
					</label>

					<label
						htmlFor='priority-medium'
						className={cls(
							'text-yellow-700 hover:bg-yellow-700 hover:text-white has-checked:bg-yellow-700 has-checked:text-white',
							labelClasses
						)}
					>
						medium
						<input
							type='radio'
							name='priority'
							className={radioClasses}
							aria-label='medium'
							value='medium'
							id='priority-medium'
						/>
					</label>

					<label
						htmlFor='priority-high'
						className={cls(
							'text-red-700 hover:bg-red-700 hover:text-white has-checked:bg-red-700 has-checked:text-white',
							labelClasses
						)}
					>
						high
						<input
							type='radio'
							name='priority'
							className={radioClasses}
							aria-label='high'
							value='high'
							id='priority-high'
						/>
					</label>
				</div>
			</div>
		</>
	)
}

export default RadioGroup

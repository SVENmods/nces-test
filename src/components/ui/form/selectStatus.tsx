import cls from 'classnames'

interface Props {
	options: { label: string; value: string }[]
	defaultValue?: string
	value?: string
	floatLabel?: string
	className?: string
	title?: string
	id?: string
	name?: string
	onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
	required?: boolean
}

const Select = ({
	className,
	defaultValue,
	value,
	options,
	title,
	id,
	name,
	floatLabel,
	onChange,
	required,
}: Props) => {
	return (
		<>
			<label className='floating-label'>
				{(floatLabel && (
					<span>
						{title}
						{required && <span className='text-error'>*</span>}
					</span>
				)) ||
					null}
				<select
					defaultValue={defaultValue}
					value={value}
					className={cls('select', className)}
					id={id}
					name={name}
					onChange={onChange}
				>
					{/* {title && (
						<option disabled={true} selected>
							{title}
						</option>
					)} */}
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</label>
		</>
	)
}

export default Select

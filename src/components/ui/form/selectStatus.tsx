import cls from 'classnames'
interface Props {
	className?: string
	defaultValue?: string
	options: { label: string; value: string }[]
	title?: string
	id: string
}

const Select = ({ className, defaultValue, options, title, id }: Props) => {
	return (
		<>
			<label className='floating-label'>
				<span>{title}</span>
				<select defaultValue={defaultValue} className={cls('select', className)} id={id}>
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

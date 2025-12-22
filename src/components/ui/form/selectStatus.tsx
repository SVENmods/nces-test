import cls from 'classnames'
import type { TextInputProps } from '../../../types'
interface Props extends TextInputProps {
	options: { label: string; value: string }[]
	defaultValue?: string
	value?: string
	floatLabel?: boolean
	onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

const Select = ({ className, defaultValue, value, options, title, id, name, floatLabel, onChange }: Props) => {
	return (
		<>
			<label className='floating-label'>
				{(floatLabel && <span>{title}</span>) || null}
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

import cls from 'classnames'
import type { TextInputProps } from '../../../types'

const Input = ({
	label,
	placeholder,
	type,
	className,
	minLength,
	pattern,
	required,
	title,
	id,
	validatorText,
	name,
	value,
	onChange,
	maxLength,
}: TextInputProps) => {
	return (
		<>
			<label className='floating-label'>
				<span>
					{label}
					{required && <span className='text-error'>*</span>}
				</span>
				<input
					type={type}
					placeholder={placeholder}
					className={cls('input', className)}
					required={required}
					minLength={minLength}
					pattern={pattern}
					title={title}
					id={id}
					name={name}
					value={value}
					onChange={onChange}
					maxLength={maxLength}
				/>
				{validatorText && <p className='validator-hint'>{validatorText}</p>}
			</label>
		</>
	)
}
export default Input

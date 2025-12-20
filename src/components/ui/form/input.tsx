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
}: TextInputProps) => {
	return (
		<>
			<label className='floating-label'>
				<span>{label}</span>
				<input
					type={type}
					placeholder={placeholder}
					className={cls('input', className)}
					required={required}
					minLength={minLength}
					pattern={pattern}
					title={title}
					id={id}
				/>
				<p className='validator-hint'>{validatorText}</p>
			</label>
		</>
	)
}
export default Input

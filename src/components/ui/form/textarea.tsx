import cls from 'classnames'
import type { TextInputProps } from '../../../types'

const Textarea = ({ className, placeholder, id, maxLength, title, name }: TextInputProps) => {
	return (
		<>
			<label className='floating-label'>
				<span>{title}</span>
				<textarea
					className={cls('textarea', className)}
					placeholder={placeholder}
					id={id}
					maxLength={maxLength}
					name={name}
				></textarea>
			</label>
		</>
	)
}

export default Textarea

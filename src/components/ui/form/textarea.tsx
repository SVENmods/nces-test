import cls from 'classnames'
import type { TextInputProps } from '../../../types'

const Textarea = ({ className, placeholder, id, maxLength, title }: TextInputProps) => {
	return (
		<>
			<label className='floating-label'>
				<span>{title}</span>
				<textarea
					className={cls('textarea', className)}
					placeholder={placeholder}
					id={id}
					maxLength={maxLength}
				></textarea>
			</label>
		</>
	)
}

export default Textarea

import Select from 'react-select'
import { tagOptions } from '../../../data'
import type { TextInputProps } from '../../../types'

interface MultiSelectProps extends TextInputProps {
	onTagsChange?: (tags: string[]) => void
}

const MultiSelect = ({ name, onTagsChange, required }: MultiSelectProps) => {
	return (
		<>
			<span className='font-normal text-sm'>Tags</span>
			<Select
				isMulti
				name={name}
				options={tagOptions}
				className='mt-2 basic-multi-select'
				classNamePrefix='select'
				onChange={(selectedOptions) => {
					if (onTagsChange) {
						const values = selectedOptions
							? (selectedOptions as { value: string; label: string }[]).map((opt) => opt.value)
							: []
						onTagsChange(values)
					}
				}}
				required={required}
			/>
		</>
	)
}

export default MultiSelect

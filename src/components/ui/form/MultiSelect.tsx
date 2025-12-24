import Select from 'react-select'
import { tagOptions } from '../../../data'

interface MultiSelectProps {
	name?: string
	onTagsChange?: (tags: string[]) => void
	defaultValue?: string[]
	value?: string[]
	required?: boolean
	id: string
}

const MultiSelect = ({ name, onTagsChange, required, defaultValue, value, id }: MultiSelectProps) => {
	const selectedTags = value !== undefined ? value : defaultValue || []

	const selectedOptions =
		selectedTags.length > 0 ? tagOptions.filter((option) => selectedTags.includes(option.value)) : []

	return (
		<>
			<span className='font-normal text-sm'>
				Tags
				{required && <span className='text-error'>*</span>}
			</span>
			<Select
				id={id}
				isMulti
				name={name}
				options={tagOptions}
				className='mt-2 basic-multi-select'
				classNamePrefix='select'
				value={selectedOptions}
				onChange={(selectedOptions) => {
					if (onTagsChange) {
						const values = selectedOptions
							? (selectedOptions as { value: string; label: string }[]).map((opt) => opt.value)
							: []
						onTagsChange(values)
					}
				}}
				required={required}
				closeMenuOnSelect={false}
			/>
		</>
	)
}

export default MultiSelect

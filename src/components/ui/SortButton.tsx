import Select from './form/selectStatus'

export type SortType = 'dateCreated' | 'deadline'
export type SortDirection = 'asc' | 'desc' | null

interface Props {
	sortType: SortType
	currentSort: { type: SortType; direction: SortDirection } | null
	onSortChange: (type: SortType, direction: SortDirection) => void
}

const SortButton = ({ sortType, currentSort, onSortChange }: Props) => {
	const isActive = currentSort?.type === sortType
	const currentDirection = isActive ? currentSort.direction : null

	// Get current value for select (empty string for no sort, 'asc' or 'desc')
	const currentValue = currentDirection === null ? '' : currentDirection

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value
		// Convert empty string to null, otherwise use 'asc' or 'desc'
		const direction: SortDirection = value === '' ? null : (value as 'asc' | 'desc')
		onSortChange(sortType, direction)
	}

	const label = sortType === 'dateCreated' ? 'Date Created' : 'Deadline'

	return (
		<div className='min-w-[120px]'>
			<Select
				id={`sort-${sortType}`}
				name={`sort-${sortType}`}
				title={label}
				options={[
					{ label: '—', value: '' },
					{ label: '↑ Ascending', value: 'asc' },
					{ label: '↓ Descending', value: 'desc' },
				]}
				value={currentValue}
				onChange={handleChange}
				className='w-full'
				floatLabel={'Sort by'}
			/>
		</div>
	)
}

export default SortButton

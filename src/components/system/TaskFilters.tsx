import Select from '../ui/form/selectStatus'
import MultiSelect from '../ui/form/MultiSelect'

export interface TaskFilters {
	status?: 'todo' | 'inProgress' | 'done' | ''
	priority?: 'low' | 'medium' | 'high' | ''
	tags?: string[]
}

interface TaskFiltersProps {
	filters: TaskFilters
	onFiltersChange: (filters: TaskFilters) => void
}

const TaskFilters = ({ filters, onFiltersChange }: TaskFiltersProps) => {
	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const status = e.target.value as 'todo' | 'inProgress' | 'done' | ''
		onFiltersChange({ ...filters, status })
	}

	const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const priority = e.target.value as 'low' | 'medium' | 'high' | ''
		onFiltersChange({ ...filters, priority })
	}

	const handleTagsChange = (tags: string[]) => {
		onFiltersChange({ ...filters, tags })
	}

	return (
		<div className='flex flex-row flex-wrap items-end gap-2'>
			<div className='min-w-[150px]'>
				<Select
					id='filter-status'
					name='filter-status'
					title='Status'
					options={[
						{ label: 'All', value: '' },
						{ label: 'Todo', value: 'todo' },
						{ label: 'In Progress', value: 'inProgress' },
						{ label: 'Done', value: 'done' },
					]}
					value={filters.status || ''}
					onChange={handleStatusChange}
					className='w-full'
					floatLabel={'Status'}
				/>
			</div>
			<div className='min-w-[150px]'>
				<Select
					id='filter-priority'
					name='filter-priority'
					title='Priority'
					options={[
						{ label: 'All', value: '' },
						{ label: 'Low', value: 'low' },
						{ label: 'Medium', value: 'medium' },
						{ label: 'High', value: 'high' },
					]}
					value={filters.priority || ''}
					onChange={handlePriorityChange}
					className='w-full'
					floatLabel={'Priority'}
				/>
			</div>
			<div className='min-w-[200px] max-w-[400px]'>
				<MultiSelect
					id='filter-tags'
					name='filter-tags'
					value={filters.tags || []}
					onTagsChange={handleTagsChange}
				/>
			</div>
		</div>
	)
}

export default TaskFilters

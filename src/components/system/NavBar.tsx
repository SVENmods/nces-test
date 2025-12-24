import cls from 'classnames'
import LiveSearch from './LiveSearch'
import TaskFilters from './TaskFilters'
import type { TaskFilters as TaskFiltersType } from './TaskFilters'
import ServerStatusIndicator from './ServerStatusIndicator'

interface NavBarProps {
	className?: string
	onSearchChange?: (searchQuery: string) => void
	filters?: TaskFiltersType
	onFiltersChange?: (filters: TaskFiltersType) => void
}

const NavBar: React.FC<NavBarProps> = ({ className, onSearchChange, filters, onFiltersChange }) => {
	return (
		<div className={cls(className, 'flex flex-col gap-2 rounded-lg')}>
			<div className='flex flex-row flex-wrap justify-between items-end gap-6'>
				{onSearchChange && <LiveSearch onSearchChange={onSearchChange} />}
				{filters && onFiltersChange && <TaskFilters filters={filters} onFiltersChange={onFiltersChange} />}
			</div>
			<div className='flex justify-end'>
				<ServerStatusIndicator />
			</div>
		</div>
	)
}

export default NavBar

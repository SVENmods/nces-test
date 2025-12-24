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
		<div className={cls(className, 'rounded-lg bg-base-300 ')}>
			<div className='flex flex-col gap-2 mx-auto p-4 w-full max-w-[1440px]'>
				<div className='flex flex-row flex-wrap justify-between items-end gap-6'>
					{onSearchChange && <LiveSearch onSearchChange={onSearchChange} />}
					{filters && onFiltersChange && (
						<TaskFilters filters={filters} onFiltersChange={onFiltersChange} />
					)}
				</div>
				<div className='flex justify-end mt-4'>
					<ServerStatusIndicator />
				</div>
			</div>
		</div>
	)
}

export default NavBar

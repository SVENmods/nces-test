import { useState } from 'react'
import KanbanBoard from '../components/system/KanbanBoard'
import NavBar from '../components/system/NavBar'
import type { TaskFilters } from '../components/system/TaskFilters'

const Home = () => {
	const [searchQuery, setSearchQuery] = useState('')
	const [filters, setFilters] = useState<TaskFilters>({
		status: '',
		priority: '',
		tags: [],
	})

	const handleSearchChange = (query: string) => {
		setSearchQuery(query)
	}

	const handleFiltersChange = (newFilters: TaskFilters) => {
		setFilters(newFilters)
	}

	const handleTagClick = (tag: string) => {
		setFilters((prevFilters) => {
			const currentTags = prevFilters.tags || []
			const isTagSelected = currentTags.includes(tag)
			const newTags = isTagSelected ? currentTags.filter((t) => t !== tag) : [...currentTags, tag]

			return {
				...prevFilters,
				tags: newTags,
			}
		})
	}

	return (
		<div className=''>
			<NavBar
				className='top-0 z-11 sticky'
				onSearchChange={handleSearchChange}
				filters={filters}
				onFiltersChange={handleFiltersChange}
			/>
			<div className='mx-auto mt-10 mt-4 px-4 px-md-0 w-full max-w-[1440px]'>
				<KanbanBoard searchQuery={searchQuery} filters={filters} onTagClick={handleTagClick} />
			</div>
		</div>
	)
}

export default Home

import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import Input from '../ui/form/Input'

interface LiveSearchProps {
	onSearchChange: (searchQuery: string) => void
}

const LiveSearch = ({ onSearchChange }: LiveSearchProps) => {
	const [searchValue, setSearchValue] = useState('')
	const [debouncedSearchValue] = useDebounce(searchValue, 300)

	useEffect(() => {
		onSearchChange(debouncedSearchValue)
	}, [debouncedSearchValue, onSearchChange])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value)
	}

	return (
		<div className='w-full max-w-md'>
			<Input
				id='search'
				type='text'
				placeholder='Search by task title...'
				value={searchValue}
				onChange={handleChange}
				className='w-full'
				label='Search'
			/>
		</div>
	)
}

export default LiveSearch

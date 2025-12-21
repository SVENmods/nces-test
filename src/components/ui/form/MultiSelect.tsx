import Select from 'react-select'
import { tagOptions } from '../../../data'

const MultiSelect = () => {
	return (
		<>
			<Select
				// defaultValue={[colourOptions[2], colourOptions[3]]}
				isMulti
				name='colors'
				options={tagOptions}
				className='basic-multi-select'
				classNamePrefix='select'
			/>
		</>
	)
}

export default MultiSelect

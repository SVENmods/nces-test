import { useState } from 'react'
import { DayPicker } from 'react-day-picker'

const DatePicker = () => {
	const [date, setDate] = useState<Date | undefined>()
	return (
		<>
			<div className=''>
				<span className='font-normal text-sm'>Deadline</span>
				<div className='mt-2'>
					<button
						popoverTarget='rdp-popover'
						className='input-border w-full input'
						style={{ anchorName: '--rdp' } as React.CSSProperties}
						type='button'
					>
						{date ? date.toLocaleDateString() : 'Pick a date'}
					</button>
					<div
						popover='auto'
						id='rdp-popover'
						className='dropdown'
						style={{ positionAnchor: '--rdp' } as React.CSSProperties}
					>
						<DayPicker
							className='react-day-picker'
							mode='single'
							selected={date}
							onSelect={setDate}
							required
							timeZone='Europe/Minsk'
							startMonth={new Date()}
							disabled={{ before: new Date() }}
						/>
					</div>
				</div>
			</div>
		</>
	)
}

export default DatePicker

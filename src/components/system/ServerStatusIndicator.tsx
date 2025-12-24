import { useEffect, useState, useRef } from 'react'
import { checkServerConnection } from '../../utils/api'
import { syncTemporaryTasks } from '../../utils/storage'

const ServerStatusIndicator = () => {
	const [isConnected, setIsConnected] = useState(false)
	// const [isChecking, setIsChecking] = useState(true)
	const wasDisconnectedRef = useRef(false)

	useEffect(() => {
		const checkConnection = async () => {
			// setIsChecking(true)
			const previousConnectionState = isConnected
			const connected = await checkServerConnection()

			// If server just became available after being disconnected, sync temporary tasks
			if (connected && !previousConnectionState && wasDisconnectedRef.current) {
				try {
					await syncTemporaryTasks()
					console.log('Temporary tasks synced with server')
				} catch (error) {
					console.error('Failed to sync temporary tasks:', error)
				}
			}

			wasDisconnectedRef.current = !connected
			setIsConnected(connected)
			// setIsChecking(false)
		}

		// Check on mount
		checkConnection()

		// Check every 5 seconds
		const interval = setInterval(checkConnection, 5000)

		return () => clearInterval(interval)
	}, [isConnected])

	// if (isChecking) {
	// 	return (
	// 		<div className='flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md text-sm'>
	// 			<span className='loading loading-spinner loading-xs'></span>
	// 			<span className='text-gray-600'>
	// 				<span className='loading loading-spinner loading-sm'></span>
	// 			</span>
	// 		</div>
	// 	)
	// }

	return (
		<div
			className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
				isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
			}`}
		>
			<div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
			<span>{isConnected ? 'Server available' : 'Server unavailable (data saved locally)'}</span>
		</div>
	)
}

export default ServerStatusIndicator

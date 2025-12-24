export function calcTimeToDeadline(time: string): { text: string; color?: string } {
	const now = new Date()
	const deadline = new Date(time)

	const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const deadlineStart = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())

	const diff = deadlineStart.getTime() - nowStart.getTime()
	const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24))

	if (diffInDays === 0) {
		return {
			text: 'today',
			color: 'text-orange-400',
		}
	}

	if (diffInDays === 1) {
		return {
			text: 'tomorrow',
			color: 'text-green-300',
		}
	}

	if (diffInDays === -1) {
		return {
			text: 'yesterday',
			color: 'text-red-500',
		}
	}

	if (diffInDays < 0) {
		return {
			text: 'overdue',
			color: 'text-red-500',
		}
	}

	return {
		text: `in ${diffInDays} days`,
		color: 'text-blue-500',
	}
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString)
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

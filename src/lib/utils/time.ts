/**
 * Formats a timestamp as a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
	if (!date) return 'Never';

	const dateObj = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffMs = now.getTime() - dateObj.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);
	const diffWeeks = Math.floor(diffDays / 7);
	const diffMonths = Math.floor(diffDays / 30);
	const diffYears = Math.floor(diffDays / 365);

	if (diffSeconds < 30) return 'Just now';
	if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
	if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
	if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
	if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
	return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

/**
 * Formats a timestamp as a readable date string
 */
export function formatDate(date: Date | string | null | undefined): string {
	if (!date) return '—';

	const dateObj = typeof date === 'string' ? new Date(date) : date;
	return dateObj.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

/**
 * Formats a timestamp as a readable date and time string
 */
export function formatDateTime(date: Date | string | null | undefined): string {
	if (!date) return '—';

	const dateObj = typeof date === 'string' ? new Date(date) : date;
	return dateObj.toLocaleString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

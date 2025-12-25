import { formatDistanceToNow, format, isThisYear } from 'date-fns';

/**
 * Format date as relative time or absolute date based on age
 * Rules:
 * - < 1 hour -> 'X minutes ago' or 'less than a minute ago'
 * - < 24 hours -> 'X hours ago'
 * - < 7 days -> 'X days ago'
 * - >= 7 days -> absolute date: '26 Dec' or '26 Dec 2024' if different year
 */
export const formatRelativeOrDate = (dateString?: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // For dates older than 7 days, show absolute date
    if (diffDays >= 7) {
        const dateFormat = isThisYear(date) ? 'dd MMM' : 'dd MMM yyyy';
        return format(date, dateFormat);
    }

    // For recent dates, show relative time
    return formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Format date-time for tooltip display
 * Returns: 'December 26, 2024, 14:32'
 */
export const formatCreatedDateTime = (dateString?: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return format(date, 'MMMM dd, yyyy, HH:mm');
};


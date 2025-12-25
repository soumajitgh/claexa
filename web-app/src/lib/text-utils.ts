/**
 * Utility function to clean question text for display in mobile marquee
 * Removes markdown formatting and HTML tags to show plain text
 */
export function cleanQuestionText(text: string): string {
  if (!text) return '';

  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
  // Remove markdown bold/italic
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  
  // Remove markdown links
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```[^`]*```/g, '[Code]');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove markdown lists
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
  
  // Remove extra whitespace and newlines
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Truncate if too long (for mobile display)
  if (cleaned.length > 80) {
    cleaned = cleaned.substring(0, 80) + '...';
  }
  
  return cleaned;
}

/**
 * Truncate a string in the middle preserving the start and end with an ellipsis.
 * Useful for filenames where the extension matters.
 */
export function truncateMiddle(text: string, maxLength = 40): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const ellipsis = '…';
  const keep = Math.max(2, maxLength - ellipsis.length);
  const front = Math.ceil(keep * 0.6);
  const back = keep - front;
  return text.slice(0, front) + ellipsis + text.slice(text.length - back);
}

/**
 * Truncate from the end, keeping only the first N characters then '...'
 */
export function truncateHead(text: string, maxLength = 15): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, Math.max(0, maxLength)) + '...';
}

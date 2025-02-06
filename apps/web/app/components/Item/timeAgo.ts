const timeAgo = (timestamp: number): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp

  if (diff <= 0) {
    return 'Just now'
  }

  const intervals = [
    {label: 'year',   ms: 365 * 24 * 60 * 60 * 1000},
    {label: 'month',  ms: 30  * 24 * 60 * 60 * 1000},
    {label: 'day',    ms: 24 * 60 * 60 * 1000},
    {label: 'hour',   ms: 60 * 60 * 1000},
    {label: 'minute', ms: 60 * 1000},
    {label: 'second', ms: 1000},
  ]

  for (const interval of intervals) {
    const count = Math.floor(diff / interval.ms);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  // Fallback if below 1 second
  return 'now'
}

export default timeAgo
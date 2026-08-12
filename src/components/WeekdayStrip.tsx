const LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/**
 * Informational weekday indicator. Reflects the class's usual meeting days;
 * one-off sessions still live in meetings[] and drive conflict detection.
 */
export default function WeekdayStrip({ days, title }: { days: number[]; title?: string }) {
  return (
    <span className="weekday-strip" title={title} aria-label={title}>
      {LABELS.map((label, i) => (
        <span key={label} className={`weekday${days.includes(i) ? ' active' : ''}`}>
          {label}
        </span>
      ))}
    </span>
  )
}

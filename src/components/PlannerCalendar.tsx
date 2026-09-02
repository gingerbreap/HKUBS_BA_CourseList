import { useMemo, useState } from 'react'
import IcsExportModal from './IcsExportModal'
import StudyStatusImportModal from './StudyStatusImportModal'
import { CALENDAR_END, CALENDAR_START, holidayLabelKey, holidayLunarTag } from '../data/holidays'
import { useI18n } from '../i18n/context'
import { calendarEventLabel, eventsByDate, type CalendarEvent } from '../utils/calendarEvents'
import type { Course, SelectedSection } from '../types'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function monthIndex(year: number, month: number) {
  return year * 12 + month
}

function clampMonth(year: number, month: number) {
  const min = monthIndex(CALENDAR_START.year, CALENDAR_START.month)
  const max = monthIndex(CALENDAR_END.year, CALENDAR_END.month)
  const cur = monthIndex(year, month)
  if (cur < min) return { year: CALENDAR_START.year, month: CALENDAR_START.month }
  if (cur > max) return { year: CALENDAR_END.year, month: CALENDAR_END.month }
  return { year, month }
}

function defaultMonth() {
  const now = new Date()
  return clampMonth(now.getFullYear(), now.getMonth())
}

interface DayCell {
  dateKey: string
  day: number
  inMonth: boolean
}

function buildMonthGrid(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays = new Date(year, month, 0).getDate()

  const cells: DayCell[] = []

  for (let i = startOffset - 1; i >= 0; i--) {
    const day = prevDays - i
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    cells.push({ dateKey: toDateKey(prevYear, prevMonth, day), day, inMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ dateKey: toDateKey(year, month, day), day, inMonth: true })
  }

  const trailing = (7 - (cells.length % 7)) % 7
  for (let day = 1; day <= trailing; day++) {
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year
    cells.push({ dateKey: toDateKey(nextYear, nextMonth, day), day, inMonth: false })
  }

  return cells
}

function HolidayTag({
  shortLabel,
  fullLabel,
  showBubble,
  onToggle,
}: {
  shortLabel: string
  fullLabel: string
  showBubble: boolean
  onToggle: () => void
}) {
  const showFull = fullLabel && fullLabel !== shortLabel

  return (
    <span className="calendar-holiday-tag-wrap">
      <button
        type="button"
        className="calendar-holiday-label"
        title={fullLabel || shortLabel}
        onClick={e => {
          e.stopPropagation()
          if (showFull) onToggle()
        }}
      >
        {shortLabel}
      </button>
      {showFull && showBubble && (
        <span className="calendar-holiday-bubble" role="tooltip">
          {fullLabel}
        </span>
      )}
    </span>
  )
}

function EventChip({
  event,
  onCourseClick,
  sectionLabel,
}: {
  event: CalendarEvent
  onCourseClick?: (courseCode: string) => void
  sectionLabel: (sectionId: string) => string
}) {
  const label = calendarEventLabel(event)
  const timed = event.startTime && event.endTime
  const isFinal = event.sessionType === 'exam' || event.sessionType === 'presentation' || event.sessionType === 'other'
  const title = [
    label,
    event.sectionId && !isFinal ? sectionLabel(event.sectionId) : '',
    event.instructor,
    timed ? `${event.startTime}-${event.endTime}` : event.date,
    event.venue,
  ].filter(Boolean).join(' · ')

  return (
    <button
      type="button"
      className={`calendar-event calendar-event--${event.sessionType}`}
      title={title}
      onClick={() => onCourseClick?.(event.courseCode)}
    >
      <span className="calendar-event-code">{label}</span>
      {timed && <span className="calendar-event-time">{event.startTime}-{event.endTime}</span>}
      {!isFinal && event.instructor && (
        <span className="calendar-event-instructor">{event.instructor}</span>
      )}
    </button>
  )
}

interface PlannerCalendarProps {
  events: CalendarEvent[]
  courses: Course[]
  onImportSelections: (selections: SelectedSection[]) => void
  onCourseClick?: (courseCode: string) => void
}

export default function PlannerCalendar({
  events,
  courses,
  onImportSelections,
  onCourseClick,
}: PlannerCalendarProps) {
  const { t, tList, sectionLabel } = useI18n()
  const weekdays = tList('calendar.weekdays')
  const [{ year, month }, setView] = useState(defaultMonth)
  const [exportOpen, setExportOpen] = useState(false)
  const [studyStatusOpen, setStudyStatusOpen] = useState(false)
  const [activeHolidayBubble, setActiveHolidayBubble] = useState<string | null>(null)
  const byDate = useMemo(() => eventsByDate(events), [events])
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month])

  const holidayFullLabel = (labelKey: string) => t(`holidaysFull.${labelKey}`)

  const atStart = monthIndex(year, month) <= monthIndex(CALENDAR_START.year, CALENDAR_START.month)
  const atEnd = monthIndex(year, month) >= monthIndex(CALENDAR_END.year, CALENDAR_END.month)

  const prevMonth = () => {
    const m = month === 0 ? 11 : month - 1
    const y = month === 0 ? year - 1 : year
    setView(clampMonth(y, m))
  }

  const nextMonth = () => {
    const m = month === 11 ? 0 : month + 1
    const y = month === 11 ? year + 1 : year
    setView(clampMonth(y, m))
  }

  const monthLabel = t('calendar.monthLabel', { year, month: month + 1 })
  const monthEventCount = events.filter(e => {
    const [y, m] = e.date.split('-').map(Number)
    return y === year && m === month + 1
  }).length

  const handleExport = () => {
    setExportOpen(true)
  }

  return (
    <div className="card planner-calendar">
      <div className="calendar-header">
        <div className="calendar-header-text">
          <div className="calendar-title">{t('calendar.title')}</div>
          <div className="calendar-subtitle">
            {events.length > 0
              ? t('calendar.subtitleCount', { total: events.length, month: monthEventCount })
              : t('calendar.subtitleEmpty')}
          </div>
        </div>
        <div className="calendar-nav">
          <button
            type="button"
            className="calendar-export-btn"
            onClick={handleExport}
            disabled={events.length === 0}
            title={events.length === 0 ? t('calendar.exportDisabled') : t('calendar.exportTitle')}
          >
            {t('calendar.export')}
          </button>
          <button
            type="button"
            className="calendar-export-btn"
            onClick={() => setStudyStatusOpen(true)}
            title={t('calendar.importTitle')}
          >
            {t('calendar.import')}
          </button>
          <div className="calendar-month-cluster">
            <button type="button" className="calendar-nav-btn" onClick={prevMonth} disabled={atStart} aria-label={t('calendar.prevMonth')}>
              ‹
            </button>
            <span className="calendar-month-label">{monthLabel}</span>
            <button type="button" className="calendar-nav-btn" onClick={nextMonth} disabled={atEnd} aria-label={t('calendar.nextMonth')}>
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-legend">
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-event--lecture" /> {t('calendar.legendLec')}
        </span>
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-event--tutorial" /> {t('calendar.legendTut')}
        </span>
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-event--exam" /> {t('calendar.legendExam')}
        </span>
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-event--presentation" /> {t('calendar.legendPresentation')}
        </span>
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-legend-swatch--holiday" /> {t('calendar.legendHoliday')}
        </span>
      </div>

      <div className="calendar-weekdays">
        {weekdays.map(d => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>

      <div className="calendar-grid" onClick={() => setActiveHolidayBubble(null)}>
        {grid.map(cell => {
          const dayEvents = byDate[cell.dateKey] || []
          const holidayKey = holidayLabelKey(cell.dateKey)
          const label = holidayKey ? t(`holidays.${holidayKey}`) : undefined
          const fullLabel = holidayKey ? holidayFullLabel(holidayKey) : undefined
          const lunarTag = holidayLunarTag(cell.dateKey)

          return (
            <div
              key={cell.dateKey}
              className={[
                'calendar-day',
                !cell.inMonth && 'calendar-day--other',
                holidayKey && 'calendar-day--holiday',
                dayEvents.length > 0 && 'calendar-day--has-events',
              ].filter(Boolean).join(' ')}
            >
              <div className="calendar-day-header">
                <span className="calendar-day-number">{cell.day}</span>
                {(label || lunarTag) && (
                  <div className="calendar-day-tags">
                    {label && (
                      <HolidayTag
                        shortLabel={label}
                        fullLabel={fullLabel || label}
                        showBubble={activeHolidayBubble === cell.dateKey}
                        onToggle={() =>
                          setActiveHolidayBubble(prev =>
                            prev === cell.dateKey ? null : cell.dateKey,
                          )
                        }
                      />
                    )}
                    {lunarTag && (
                      <span className="calendar-lunar-tag" title={lunarTag}>{lunarTag}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="calendar-day-events">
                {dayEvents.map(ev => (
                  <EventChip key={ev.id} event={ev} onCourseClick={onCourseClick} sectionLabel={sectionLabel} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {exportOpen && (
        <IcsExportModal events={events} onClose={() => setExportOpen(false)} />
      )}
      {studyStatusOpen && (
        <StudyStatusImportModal
          courses={courses}
          onImport={onImportSelections}
          onClose={() => setStudyStatusOpen(false)}
        />
      )}
    </div>
  )
}

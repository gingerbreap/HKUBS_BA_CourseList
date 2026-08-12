import { useMemo, useState } from 'react'
import { CALENDAR_END, CALENDAR_START, holidayLabel, isHoliday } from '../data/holidays'
import { calendarEventLabel, eventsByDate, type CalendarEvent } from '../utils/calendarEvents'
import { buildIcsContent, downloadIcs } from '../utils/exportIcs'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

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

function EventChip({ event }: { event: CalendarEvent }) {
  const label = calendarEventLabel(event)
  const timed = event.startTime && event.endTime
  const isFinal = event.sessionType === 'exam' || event.sessionType === 'presentation' || event.sessionType === 'other'
  const title = [
    label,
    event.sectionId && !isFinal ? `${event.sectionId}班` : '',
    event.instructor,
    timed ? `${event.startTime}-${event.endTime}` : event.date,
    event.venue,
  ].filter(Boolean).join(' · ')

  return (
    <div className={`calendar-event calendar-event--${event.sessionType}`} title={title}>
      <span className="calendar-event-code">{label}</span>
      {timed && <span className="calendar-event-time">{event.startTime}-{event.endTime}</span>}
      {!isFinal && event.instructor && (
        <span className="calendar-event-instructor">{event.instructor}</span>
      )}
    </div>
  )
}

interface PlannerCalendarProps {
  events: CalendarEvent[]
}

export default function PlannerCalendar({ events }: PlannerCalendarProps) {
  const [{ year, month }, setView] = useState(defaultMonth)
  const byDate = useMemo(() => eventsByDate(events), [events])
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month])

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

  const monthLabel = `${year}年${month + 1}月`
  const monthEventCount = events.filter(e => {
    const [y, m] = e.date.split('-').map(Number)
    return y === year && m === month + 1
  }).length

  const handleExport = () => {
    const content = buildIcsContent(events)
    downloadIcs(content, 'hkubs-ba-planner.ics')
  }

  return (
    <div className="card planner-calendar">
      <div className="calendar-header">
        <div>
          <div className="calendar-title">选课日历</div>
          <div className="calendar-subtitle">
            {events.length > 0
              ? `共 ${events.length} 项日程 · 本月 ${monthEventCount} 项`
              : '选择课程后在此查看排课'}
          </div>
        </div>
        <div className="calendar-nav">
          <button
            type="button"
            className="calendar-export-btn"
            onClick={handleExport}
            disabled={events.length === 0}
            title={events.length === 0 ? '请先选择课程' : '导出为 ICS 日历文件'}
          >
            导出 ICS
          </button>
          <button type="button" className="calendar-nav-btn" onClick={prevMonth} disabled={atStart} aria-label="上个月">
            ‹
          </button>
          <span className="calendar-month-label">{monthLabel}</span>
          <button type="button" className="calendar-nav-btn" onClick={nextMonth} disabled={atEnd} aria-label="下个月">
            ›
          </button>
        </div>
      </div>

      <div className="calendar-legend">
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-event--lecture" /> 讲座 (LEC)
        </span>
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-event--tutorial" /> 教程 (TUT)
        </span>
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-event--exam" /> 期末考试
        </span>
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-event--presentation" /> Presentation
        </span>
        <span className="calendar-legend-item">
          <span className="calendar-legend-swatch calendar-legend-swatch--holiday" /> 假日（仅日历显示）
        </span>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map(d => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {grid.map(cell => {
          const dayEvents = byDate[cell.dateKey] || []
          const holiday = isHoliday(cell.dateKey)
          const label = holidayLabel(cell.dateKey)

          return (
            <div
              key={cell.dateKey}
              className={[
                'calendar-day',
                !cell.inMonth && 'calendar-day--other',
                holiday && 'calendar-day--holiday',
                dayEvents.length > 0 && 'calendar-day--has-events',
              ].filter(Boolean).join(' ')}
            >
              <div className="calendar-day-header">
                <span className="calendar-day-number">{cell.day}</span>
                {holiday && label && (
                  <span className="calendar-holiday-label" title={label}>{label}</span>
                )}
              </div>
              <div className="calendar-day-events">
                {dayEvents.map(ev => (
                  <EventChip key={ev.id} event={ev} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

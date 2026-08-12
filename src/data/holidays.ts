/** Non-class days for the 2026-27 academic year (HKU / public holidays). */

export interface HolidayEntry {
  date: string
  label: string
}

/** Individual holiday dates (YYYY-MM-DD). */
const HOLIDAY_DATES: HolidayEntry[] = [
  { date: '2026-09-25', label: '假日' },
  { date: '2026-09-26', label: '假日' },
  { date: '2026-10-01', label: '国庆日' },
  { date: '2026-10-18', label: '假日' },
  { date: '2026-10-19', label: '假日' },
  { date: '2027-01-01', label: '元旦' },
  { date: '2027-03-16', label: '假日' },
  { date: '2027-03-26', label: '假日' },
  { date: '2027-03-27', label: '假日' },
  { date: '2027-03-29', label: '假日' },
  { date: '2027-04-05', label: '假日' },
  { date: '2027-05-01', label: '劳动节' },
  { date: '2027-05-09', label: '假日' },
  { date: '2027-05-13', label: '假日' },
  { date: '2027-07-01', label: '香港回归纪念日' },
]

/** Inclusive date ranges expanded at runtime. */
const HOLIDAY_RANGES: { start: string; end: string; label: string }[] = [
  { start: '2026-12-22', end: '2026-12-31', label: '圣诞假期' },
  { start: '2027-02-04', end: '2027-02-10', label: '农历新年假期' },
]

function expandRange(start: string, end: string, label: string): HolidayEntry[] {
  const entries: HolidayEntry[] = []
  const cur = new Date(`${start}T00:00:00`)
  const last = new Date(`${end}T00:00:00`)
  while (cur <= last) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const d = String(cur.getDate()).padStart(2, '0')
    entries.push({ date: `${y}-${m}-${d}`, label })
    cur.setDate(cur.getDate() + 1)
  }
  return entries
}

const RANGE_ENTRIES = HOLIDAY_RANGES.flatMap(r => expandRange(r.start, r.end, r.label))

/** All holidays keyed by date for O(1) lookup. */
export const HOLIDAYS_BY_DATE: Record<string, string> = Object.fromEntries(
  [...HOLIDAY_DATES, ...RANGE_ENTRIES].map(h => [h.date, h.label]),
)

export function isHoliday(date: string): boolean {
  return date in HOLIDAYS_BY_DATE
}

export function holidayLabel(date: string): string | undefined {
  return HOLIDAYS_BY_DATE[date]
}

/** Calendar navigable range for 2026-27 modules. */
export const CALENDAR_START = { year: 2026, month: 8 } // Sep (0-indexed month)
export const CALENDAR_END = { year: 2027, month: 6 }   // Jul

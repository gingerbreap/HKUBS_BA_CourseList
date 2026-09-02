/** Non-class days for the 2026-27 academic year (HKU / public holidays). */

export interface HolidayEntry {
  date: string
  labelKey: string
  lunarTag?: string
}

/** Named individual holidays (excluding merged range blocks). */
const NAMED_HOLIDAYS: HolidayEntry[] = [
  { date: '2026-10-01', labelKey: 'nationalDay' },
  { date: '2027-01-01', labelKey: 'newYear' },
  { date: '2027-03-16', labelKey: 'hkuFoundationDay' },
  { date: '2027-03-26', labelKey: 'goodFriday' },
  { date: '2027-03-27', labelKey: 'easter' },
  { date: '2027-03-29', labelKey: 'easter' },
  { date: '2027-04-05', labelKey: 'tombSweepingDay' },
  { date: '2027-05-01', labelKey: 'labourDay' },
  { date: '2027-05-09', labelKey: 'mothersDay' },
  { date: '2027-05-13', labelKey: 'buddhasBirthday' },
  { date: '2027-07-01', labelKey: 'hksar' },
]

/** Merged holiday ranges with a single display label. */
const HOLIDAY_RANGES: { start: string; end: string; labelKey: string }[] = [
  { start: '2026-09-25', end: '2026-09-26', labelKey: 'midAutumn' },
  { start: '2026-10-18', end: '2026-10-19', labelKey: 'chungYeung' },
  { start: '2026-12-22', end: '2026-12-31', labelKey: 'christmas' },
  { start: '2027-02-04', end: '2027-02-10', labelKey: 'lunarNewYear' },
]

/** Lunar date tags for the CNY break (shown in both zh-CN and en). */
const LUNAR_TAGS: Record<string, string> = {
  '2027-02-04': '廿八',
  '2027-02-05': '除夕',
  '2027-02-06': '初一',
  '2027-02-07': '初二',
  '2027-02-08': '初三',
  '2027-02-09': '初四',
  '2027-02-10': '初五',
}

function expandRange(start: string, end: string, labelKey: string): HolidayEntry[] {
  const entries: HolidayEntry[] = []
  const cur = new Date(`${start}T00:00:00`)
  const last = new Date(`${end}T00:00:00`)
  while (cur <= last) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const d = String(cur.getDate()).padStart(2, '0')
    const date = `${y}-${m}-${d}`
    entries.push({
      date,
      labelKey,
      lunarTag: LUNAR_TAGS[date],
    })
    cur.setDate(cur.getDate() + 1)
  }
  return entries
}

const RANGE_ENTRIES = HOLIDAY_RANGES.flatMap(r => expandRange(r.start, r.end, r.labelKey))

const ALL_HOLIDAYS: HolidayEntry[] = [
  ...NAMED_HOLIDAYS,
  ...RANGE_ENTRIES,
]

/** All holidays keyed by date for O(1) lookup. */
export const HOLIDAYS_BY_DATE: Record<string, HolidayEntry> = Object.fromEntries(
  ALL_HOLIDAYS.map(h => [h.date, h]),
)

export function isHoliday(date: string): boolean {
  return date in HOLIDAYS_BY_DATE
}

export function holidayLabelKey(date: string): string | undefined {
  return HOLIDAYS_BY_DATE[date]?.labelKey
}

/** Lunar calendar day tag (Chinese; same in all locales). */
export function holidayLunarTag(date: string): string | undefined {
  return HOLIDAYS_BY_DATE[date]?.lunarTag
}

/** Calendar navigable range for 2026-27 modules. */
export const CALENDAR_START = { year: 2026, month: 8 } // Sep (0-indexed month)
export const CALENDAR_END = { year: 2027, month: 6 }   // Jul

export type ChangeEmoji = 'time' | 'venue'

export interface ChangePart {
  text: string
  /** ⏰ for date/time changes, 📌 for venue changes */
  emoji?: ChangeEmoji
}

export interface TeachingPlanUpdateRow {
  /** Class letter, e.g. "C". Omit for course-level changes. */
  sectionId?: string
  /**
   * i18n key under teachingPlan.items.*
   * sessionVenue / sessionTime / sessionTimeVenue use itemDate (+ optional itemTime).
   */
  itemKey: string
  /** Date label for "X Session …", e.g. "Nov 9" */
  itemDate?: string
  /** Time when multiple sessions share that date, e.g. "14:00-17:00" */
  itemTime?: string
  previous: ChangePart[]
  updated: ChangePart[]
}

export interface TeachingPlanUpdate {
  courseCode: string
  courseTitle: string
  /** Course has tutorials — use LEC/TUT item labels instead of plain Time/Venue */
  hasTutorials?: boolean
  rows: TeachingPlanUpdateRow[]
}

export interface TeachingPlanNotice {
  id: string
  timestamp: string
  courseRefs: string
  bodyKey: string
  bodyParams?: Record<string, string>
  defaultExpanded: boolean
  updates: TeachingPlanUpdate[]
}

export interface TeachingPlanDisplayRow {
  key: string
  courseCode: string
  courseTitle: string
  sectionId?: string
  itemKey: string
  itemDate?: string
  itemTime?: string
  hasTutorials: boolean
  previous: ChangePart[]
  updated: ChangePart[]
  /** Full course block (code + title) — first row of a course */
  showCourse: boolean
  /** Course code only — first row of a new class within the same course */
  showCourseCode: boolean
  showClass: boolean
  showItem: boolean
}

export function buildDisplayRows(notice: TeachingPlanNotice): TeachingPlanDisplayRow[] {
  const rows: TeachingPlanDisplayRow[] = []
  let prevCourse: string | null = null
  let prevSection: string | null = null
  let prevItemKey: string | null = null
  let prevItemDate: string | null = null
  let prevItemTime: string | null = null

  for (const update of notice.updates) {
    const hasTutorials = !!update.hasTutorials
    for (const [index, row] of update.rows.entries()) {
      const section = row.sectionId ?? ''
      const itemDate = row.itemDate ?? ''
      const itemTime = row.itemTime ?? ''
      const courseChanged = update.courseCode !== prevCourse
      const classChanged = courseChanged || section !== prevSection
      const showCourse = courseChanged
      const showCourseCode = !courseChanged && classChanged
      const showClass = classChanged && !!row.sectionId
      const showItem =
        classChanged
        || row.itemKey !== prevItemKey
        || itemDate !== prevItemDate
        || itemTime !== prevItemTime

      rows.push({
        key: `${notice.id}-${update.courseCode}-${section}-${row.itemKey}-${itemDate}-${itemTime}-${index}`,
        courseCode: update.courseCode,
        courseTitle: update.courseTitle,
        sectionId: row.sectionId,
        itemKey: row.itemKey,
        itemDate: row.itemDate,
        itemTime: row.itemTime,
        hasTutorials,
        previous: row.previous,
        updated: row.updated,
        showCourse,
        showCourseCode,
        showClass,
        showItem,
      })

      prevCourse = update.courseCode
      prevSection = section
      prevItemKey = row.itemKey
      prevItemDate = itemDate
      prevItemTime = itemTime
    }
  }

  return rows
}

const time = (text: string): ChangePart => ({ text, emoji: 'time' })
const venue = (text: string): ChangePart => ({ text, emoji: 'venue' })
const plain = (text: string): ChangePart => ({ text })

/** Newest first. */
export const teachingPlanNotices: TeachingPlanNotice[] = [
  {
    id: '20260903-7002-7003',
    timestamp: '2026/09/03 17:23',
    courseRefs: '7002 & 7003',
    bodyKey: 'body7002_7003',
    bodyParams: { code1: 'MSBA7002', code2: 'MSBA7003' },
    defaultExpanded: true,
    updates: [
      {
        courseCode: 'MSBA7003',
        courseTitle: 'Decision Analytics',
        hasTutorials: true,
        rows: [
          {
            sectionId: 'C',
            itemKey: 'lecTimeVenue',
            previous: [time('Sep 29, 2026 (Tue)')],
            updated: [
              time('Sep 23, 2026 (Wed) 18:30-21:30'),
              venue('Classroom EFG'),
            ],
          },
          {
            sectionId: 'C',
            itemKey: 'lecTimeVenue',
            previous: [time('Oct 2, 2026 (Fri)')],
            updated: [
              time('Oct 7, 2026 (Wed) 18:30-21:30'),
              venue('LT104'),
            ],
          },
          {
            sectionId: 'C',
            itemKey: 'sessionTime',
            itemDate: 'Sep 23',
            itemTime: '18:30-20:00',
            previous: [plain('18:30-20:00')],
            updated: [plain('17:00-18:30')],
          },
          {
            sectionId: 'D',
            itemKey: 'lecTimeVenue',
            previous: [time('Sep 29, 2026 (Tue)')],
            updated: [
              time('Sep 24, 2026 (Thu) 18:30-21:30'),
              venue('LT104'),
            ],
          },
          {
            sectionId: 'D',
            itemKey: 'lecTimeVenue',
            previous: [time('Oct 2, 2026 (Fri)')],
            updated: [
              time('Oct 8, 2026 (Thu) 18:30-21:30'),
              venue('Classroom J'),
            ],
          },
        ],
      },
      {
        courseCode: 'MSBA7002',
        courseTitle: 'Business Statistics',
        hasTutorials: true,
        rows: [
          {
            sectionId: 'A',
            itemKey: 'lecTimeVenue',
            previous: [time('Oct 24, 2026 (Sat) 18:30-21:30'), venue('A205-01&02')],
            updated: [time('Oct 22, 2026 (Thu) 09:00-12:00'), venue('MC-MBG07')],
          },
          {
            sectionId: 'A',
            itemKey: 'lecTimeVenue',
            previous: [time('Nov 7, 2026 (Sat) 18:30-21:30')],
            updated: [time('Nov 6, 2026 (Fri) 18:30-21:30'), venue('MC-LE6')],
          },
          {
            sectionId: 'A',
            itemKey: 'lecTimeVenue',
            previous: [time('Nov 14, 2026 (Sat) 18:30-21:30'), venue('Classroom H')],
            updated: [time('Nov 13, 2026 (Fri) 18:30-21:30'), venue('LT104')],
          },
          {
            sectionId: 'A',
            itemKey: 'sessionVenue',
            itemDate: 'Oct 30',
            itemTime: '18:00-20:00',
            previous: [plain('LT104')],
            updated: [plain('Classroom ABC')],
          },
          {
            sectionId: 'B',
            itemKey: 'lecTimeVenue',
            previous: [time('Oct 25, 2026 (Sun) 18:30-21:30')],
            updated: [time('Nov 1, 2026 (Sun) 09:30-12:30'), venue('Classroom ABC')],
          },
          {
            sectionId: 'B',
            itemKey: 'lecTimeVenue',
            previous: [time('Nov 2, 2026 (Mon) 14:00-17:00')],
            updated: [time('Nov 1, 2026 (Sun) 14:00-17:00'), venue('Classroom ABC')],
          },
          {
            sectionId: 'B',
            itemKey: 'sessionVenue',
            itemDate: 'Nov 9',
            previous: [plain('Classroom H')],
            updated: [plain('LT104')],
          },
          {
            sectionId: 'C',
            itemKey: 'lecTimeVenue',
            previous: [time('Nov 24, 2026 (Tue) 18:30-21:30')],
            updated: [time('Nov 25, 2026 (Wed) 09:30-12:30'), venue('MC-KKLG109')],
          },
          {
            sectionId: 'C',
            itemKey: 'sessionVenue',
            itemDate: 'Nov 7',
            previous: [plain('Classroom H')],
            updated: [plain('MC-KKLG109')],
          },
          {
            sectionId: 'C',
            itemKey: 'sessionVenue',
            itemDate: 'Nov 14',
            previous: [plain('Classroom H')],
            updated: [plain('MC-KKLG109')],
          },
          {
            sectionId: 'D',
            itemKey: 'lecTimeVenue',
            previous: [time('Oct 27, 2026 (Tue) 18:30-21:30')],
            updated: [time('Oct 24, 2026 (Sat) 14:00-17:00'), venue('Classroom EFG')],
          },
          {
            sectionId: 'D',
            itemKey: 'lecTimeVenue',
            previous: [time('Nov 6, 2026 (Fri) 18:30-21:30')],
            updated: [time('Nov 7, 2026 (Sat) 14:00-17:00'), venue('MC-MB201')],
          },
          {
            sectionId: 'D',
            itemKey: 'lecTimeVenue',
            previous: [time('Nov 17, 2026 (Tue) 18:30-21:30')],
            updated: [time('Nov 14, 2026 (Sat) 14:00-17:00'), venue('MC-MB201')],
          },
          {
            sectionId: 'D',
            itemKey: 'sessionVenue',
            itemDate: 'Nov 25',
            previous: [plain('LT104')],
            updated: [plain('MC-MB237')],
          },
        ],
      },
    ],
  },
  {
    id: '20260818-7015-7037',
    timestamp: '2026/08/18 17:10',
    courseRefs: '7015 & 7037',
    bodyKey: 'body7015_7037',
    bodyParams: { code1: 'MSBA7015', code2: 'MSBA7037' },
    defaultExpanded: false,
    updates: [
      {
        courseCode: 'MSBA7015',
        courseTitle: 'Service Operations Management',
        hasTutorials: false,
        rows: [
          {
            sectionId: 'A',
            itemKey: 'time',
            previous: [plain('Wednesday & Saturday 18:30-21:30')],
            updated: [plain('Saturday & Sunday 9:30-18:00 (incl. 1 hr lunch break)')],
          },
          {
            sectionId: 'A',
            itemKey: 'dates',
            previous: [plain('Mar 20, 24, 31; Apr 3, 7, 10, 14, 17, 21, 24, 2027')],
            updated: [plain('Apr 10, 11, 17, 18, 2027')],
          },
          {
            sectionId: 'A',
            itemKey: 'venue',
            previous: [plain('LT104')],
            updated: [plain('HKU Shenzhen')],
          },
          {
            sectionId: 'A',
            itemKey: 'examFinal',
            previous: [plain('Final Presentation: May 3, 2027 (Mon) 09:30-12:30, Classroom ABC, D')],
            updated: [plain('NA')],
          },
        ],
      },
      {
        courseCode: 'MSBA7037',
        courseTitle: 'A/B Testing in Product Management',
        hasTutorials: false,
        rows: [
          {
            sectionId: 'A',
            itemKey: 'dates',
            previous: [plain('Mar 20, 21, 2027; Apr 27, 28, 2027')],
            updated: [plain('Mar 20, 21, 2027; Apr 3, 4, 2027')],
          },
        ],
      },
    ],
  },
]

/** @deprecated Prefer teachingPlanNotices */
export const teachingPlanUpdates: TeachingPlanUpdate[] =
  teachingPlanNotices.flatMap(n => n.updates)

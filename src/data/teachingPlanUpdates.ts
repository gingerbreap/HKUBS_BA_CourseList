export interface TeachingPlanUpdateRow {
  label: string
  oldValue: string
  newValue: string
}

export interface TeachingPlanUpdate {
  courseCode: string
  courseTitle: string
  rows: TeachingPlanUpdateRow[]
}

export interface TeachingPlanNotice {
  /** Stable id used for dismiss persistence */
  id: string
  /** Display timestamp prefix, e.g. 2026/09/03 17:23 */
  timestamp: string
  /** Short course refs for title, e.g. 7002 & 7003 */
  courseRefs: string
  /** i18n body key under teachingPlan */
  bodyKey: string
  bodyParams?: Record<string, string>
  /** Whether the notice starts expanded */
  defaultExpanded: boolean
  updates: TeachingPlanUpdate[]
}

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
        rows: [
          {
            label: 'Class C & D lectures',
            oldValue: 'Sep 29 & Oct 2, 2026 (Tue/Fri slots)',
            newValue: 'Cancelled; rescheduled to evening makeup sessions',
          },
          {
            label: 'Class C makeup lectures',
            oldValue: '—',
            newValue: 'Sep 23, 2026 (Wed) 18:30-21:30, Classroom EFG; Oct 7, 2026 (Wed) 18:30-21:30, LT104',
          },
          {
            label: 'Class D makeup lectures',
            oldValue: '—',
            newValue: 'Sep 24, 2026 (Thu) 18:30-21:30, LT104; Oct 8, 2026 (Thu) 18:30-21:30, Classroom J',
          },
          {
            label: 'Class C tutorial (Sep 23)',
            oldValue: '18:30-20:00, Classroom H',
            newValue: '17:00-18:30, Classroom H',
          },
        ],
      },
      {
        courseCode: 'MSBA7002',
        courseTitle: 'Business Statistics',
        rows: [
          {
            label: 'Class A schedule & venues',
            oldValue: 'Oct 24 (eve), Nov 7 (eve), Nov 14 (eve); Oct 30 tut at LT104',
            newValue: 'Oct 22 (09:00 MC-MBG07), Nov 6 (Fri eve MC-LE6), Nov 13 (Fri eve); Oct 30 tut at Classroom ABC',
          },
          {
            label: 'Class B schedule & venues',
            oldValue: 'Oct 22/25/26/29, Nov 2/5/9/16/19/23',
            newValue: 'Oct 22 (eve Classroom J), Oct 26/29, Nov 1 (Sun AM+PM Classroom ABC), Nov 5 (eve Classroom H), Nov 9/16/19/23',
          },
          {
            label: 'Class C venues',
            oldValue: 'Classroom H (all lectures); Nov 24 evening makeup',
            newValue: 'Classroom H; Nov 7/14/25 at MC-KKLG109; Nov 25 replaces Nov 24 evening',
          },
          {
            label: 'Class D schedule & venues',
            oldValue: 'Oct 27 (eve), Nov 6 (eve), Nov 17 (eve); mainly LT104',
            newValue: 'Regular Wed/Sat from Oct 24; Oct 24 Classroom EFG; Nov 7/14 MC-MB201; Nov 25 MC-MB237',
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
        rows: [
          {
            label: 'Class day & time',
            oldValue: 'Wednesday & Saturday 18:30-21:30',
            newValue: 'Saturday & Sunday 9:30-18:00 (incl. 1 hr lunch break)',
          },
          {
            label: 'Class dates',
            oldValue: 'Mar 20, 24, 31; Apr 3, 7, 10, 14, 17, 21, 24, 2027',
            newValue: 'Apr 10, 11, 17, 18, 2027',
          },
          {
            label: 'Venue',
            oldValue: 'LT104',
            newValue: 'HKU Shenzhen',
          },
          {
            label: 'Exam / final project',
            oldValue: 'Final Presentation: May 3, 2027 (Mon), 09:30-12:30, Classroom ABC, D',
            newValue: 'NA',
          },
        ],
      },
      {
        courseCode: 'MSBA7037',
        courseTitle: 'A/B Testing in Product Management',
        rows: [
          {
            label: 'Class dates',
            oldValue: 'Mar 20, 21, 2027; Apr 27, 28, 2027',
            newValue: 'Mar 20, 21, 2027; Apr 3, 4, 2027',
          },
        ],
      },
    ],
  },
]

/** @deprecated Prefer teachingPlanNotices; kept for any legacy imports */
export const teachingPlanUpdates: TeachingPlanUpdate[] =
  teachingPlanNotices.flatMap(n => n.updates)

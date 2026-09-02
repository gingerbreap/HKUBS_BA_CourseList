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

export const teachingPlanUpdates: TeachingPlanUpdate[] = [
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
]

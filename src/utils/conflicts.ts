import type { Course, SelectedSection, Conflict, Meeting } from '../types'
import { formatSectionInstructors } from './instructors'

function timeOverlaps(a: Meeting, b: Meeting): boolean {
  if (a.date !== b.date) return false
  return a.startTime < b.endTime && b.startTime < a.endTime
}

function findOverlap(aMeetings: Meeting[], bMeetings: Meeting[]): { ma: Meeting; mb: Meeting } | null {
  for (const ma of aMeetings) {
    for (const mb of bMeetings) {
      if (timeOverlaps(ma, mb)) return { ma, mb }
    }
  }
  return null
}

export function detectConflicts(
  selections: SelectedSection[],
  courses: Course[]
): Conflict[] {
  const conflicts: Conflict[] = []

  const resolved = selections.map(sel => {
    const course = courses.find(c => c.courseCode === sel.courseCode && c.module === sel.module)
    const section = course?.sections.find(s => s.sectionId === sel.sectionId)
    return {
      sel,
      instructor: section ? formatSectionInstructors(section) : sel.instructor,
      meetings: section?.meetings || [],
    }
  })

  for (let i = 0; i < resolved.length; i++) {
    for (let j = i + 1; j < resolved.length; j++) {
      const a = resolved[i]
      const b = resolved[j]
      const overlap = findOverlap(a.meetings, b.meetings)
      if (overlap) {
        const isTutorial = overlap.ma.sessionType === 'tutorial' || overlap.mb.sessionType === 'tutorial'
        conflicts.push({
          type: isTutorial ? 'warning' : 'error',
          message: `${a.sel.courseCode} ${a.sel.sectionId}班（${a.instructor}）与 ${b.sel.courseCode} ${b.sel.sectionId}班（${b.instructor}）在 ${overlap.ma.date} ${overlap.ma.startTime}–${overlap.ma.endTime} 时段冲突${isTutorial ? '（含教程 TUT）' : ''}`,
          sections: [a.sel, b.sel],
        })
      }
    }
  }

  return conflicts
}

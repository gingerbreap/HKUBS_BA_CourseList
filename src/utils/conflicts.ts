import type { Course, SelectedSection, Meeting } from '../types'

export type MeetingSessionType = 'lecture' | 'tutorial'

export interface ConflictOccurrence {
  date: string
  startTime: string
  endTime: string
  aSessionType: MeetingSessionType
  bSessionType: MeetingSessionType
}

export interface PairConflict {
  a: SelectedSection
  b: SelectedSection
  lectureOverlaps: ConflictOccurrence[]
  tutorialOverlaps: ConflictOccurrence[]
}

export interface GroupedConflicts {
  severeLecture: PairConflict[]
  lecture: PairConflict[]
  tutorial: PairConflict[]
}

function timeOverlaps(a: Meeting, b: Meeting): boolean {
  if (a.date !== b.date) return false
  return a.startTime < b.endTime && b.startTime < a.endTime
}

function overlapWindow(a: Meeting, b: Meeting): { startTime: string; endTime: string } {
  return {
    startTime: a.startTime > b.startTime ? a.startTime : b.startTime,
    endTime: a.endTime < b.endTime ? a.endTime : b.endTime,
  }
}

function toOccurrence(ma: Meeting, mb: Meeting): ConflictOccurrence {
  const window = overlapWindow(ma, mb)
  return {
    date: ma.date,
    startTime: window.startTime,
    endTime: window.endTime,
    aSessionType: ma.sessionType,
    bSessionType: mb.sessionType,
  }
}

export function detectConflicts(
  selections: SelectedSection[],
  courses: Course[],
): GroupedConflicts {
  const severeLecture: PairConflict[] = []
  const lecture: PairConflict[] = []
  const tutorial: PairConflict[] = []

  const resolved = selections.map(sel => {
    const course = courses.find(c => c.courseCode === sel.courseCode && c.module === sel.module)
    const section = course?.sections.find(s => s.sectionId === sel.sectionId)
    return {
      sel,
      meetings: section?.meetings || [],
    }
  })

  for (let i = 0; i < resolved.length; i++) {
    for (let j = i + 1; j < resolved.length; j++) {
      const a = resolved[i]
      const b = resolved[j]
      const lectureOverlaps: ConflictOccurrence[] = []
      const tutorialOverlaps: ConflictOccurrence[] = []

      for (const ma of a.meetings) {
        for (const mb of b.meetings) {
          if (!timeOverlaps(ma, mb)) continue
          const occurrence = toOccurrence(ma, mb)
          const involvesTutorial = ma.sessionType === 'tutorial' || mb.sessionType === 'tutorial'
          if (involvesTutorial) tutorialOverlaps.push(occurrence)
          else lectureOverlaps.push(occurrence)
        }
      }

      if (lectureOverlaps.length === 0 && tutorialOverlaps.length === 0) continue

      const pair: PairConflict = {
        a: a.sel,
        b: b.sel,
        lectureOverlaps,
        tutorialOverlaps,
      }

      if (lectureOverlaps.length >= 3) severeLecture.push(pair)
      else if (lectureOverlaps.length > 0) lecture.push(pair)
      if (tutorialOverlaps.length > 0) tutorial.push(pair)
    }
  }

  return { severeLecture, lecture, tutorial }
}

export function formatCourseSection(sel: SelectedSection): string {
  return `${sel.courseCode} (${sel.sectionId}班)`
}

export function formatCourseSectionWithType(
  sel: SelectedSection,
  sessionType: MeetingSessionType,
): string {
  const kind = sessionType === 'lecture' ? 'LEC' : 'TUT'
  return `${sel.courseCode} (${sel.sectionId}班, ${kind})`
}

export function formatConflictWhen(occurrence: ConflictOccurrence): string {
  return `${occurrence.date} ${occurrence.startTime}-${occurrence.endTime}`
}

export function tutorialConflictFingerprint(pairs: PairConflict[]): string {
  return pairs
    .flatMap(pair =>
      pair.tutorialOverlaps.map(o =>
        [
          pair.a.courseCode,
          pair.a.sectionId,
          pair.b.courseCode,
          pair.b.sectionId,
          o.date,
          o.startTime,
          o.endTime,
          o.aSessionType,
          o.bSessionType,
        ].join(':'),
      ),
    )
    .sort()
    .join('|')
}

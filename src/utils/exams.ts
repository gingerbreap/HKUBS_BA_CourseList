import type { Course, ExamKind, ExamOrFinal, Section } from '../types'

export function resolveExam(course: Course, section?: Section): ExamOrFinal | null {
  return section?.examOrFinal ?? course.examOrFinal ?? null
}

/** ICS / session-row type label: Final Exam, Final Presentation, etc. */
export function examKindTypeLabel(kind: ExamKind): string {
  switch (kind) {
    case 'exam':
      return 'Final Exam'
    case 'presentation':
      return 'Final Presentation'
    case 'midterm':
      return 'Mid-term Examination'
    default:
      return 'Final'
  }
}

export function examEventTitle(courseCode: string, kind: ExamKind): string {
  return `${courseCode} ${examKindTypeLabel(kind)}`
}

export function examSessionType(kind: ExamKind): 'exam' | 'presentation' | 'other' {
  if (kind === 'exam' || kind === 'midterm') return 'exam'
  if (kind === 'presentation') return 'presentation'
  return 'other'
}

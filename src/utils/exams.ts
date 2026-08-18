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

/** Session table badge on course detail (presentation abbreviated). */
export function examSessionRowLabel(kind: ExamKind): string {
  if (kind === 'presentation') return 'FINAL PRE'
  return examKindTypeLabel(kind)
}

/** Timetable card line: ensure exam kind is labeled explicitly in the raw text. */
export function timetableExamLine(exam: ExamOrFinal): string {
  if (exam.kind === 'presentation') return exam.raw
  if (exam.kind === 'exam') {
    if (/^Final Exam:/i.test(exam.raw)) return exam.raw
    return `Final Exam: ${exam.raw}`
  }
  if (exam.kind === 'midterm') {
    if (/^Mid-term/i.test(exam.raw)) return exam.raw
    return `Mid-term Examination: ${exam.raw}`
  }
  return exam.raw
}

export function examSessionType(kind: ExamKind): 'exam' | 'presentation' | 'other' {
  if (kind === 'exam' || kind === 'midterm') return 'exam'
  if (kind === 'presentation') return 'presentation'
  return 'other'
}

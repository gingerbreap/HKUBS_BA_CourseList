import type { Course, ExamKind, ExamOrFinal, Section } from '../types'

export function resolveExam(course: Course, section?: Section): ExamOrFinal | null {
  return section?.examOrFinal ?? course.examOrFinal ?? null
}

export function examEventTitle(courseCode: string, kind: ExamKind): string {
  switch (kind) {
    case 'exam':
      return `${courseCode} Final Exam`
    case 'presentation':
      return `${courseCode} Final Presentation`
    case 'midterm':
      return `${courseCode} Mid-term Examination`
    default:
      return `${courseCode} Final`
  }
}

export function examSessionType(kind: ExamKind): 'exam' | 'presentation' | 'other' {
  if (kind === 'exam' || kind === 'midterm') return 'exam'
  if (kind === 'presentation') return 'presentation'
  return 'other'
}

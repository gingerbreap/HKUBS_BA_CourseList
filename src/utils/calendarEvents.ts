import type { Course, ExamKind, SelectedSection } from '../types'
import { examEventTitle, examSessionType, resolveExam } from './exams'
import { formatSectionInstructors, meetingInstructorNames } from './instructors'

export type CalendarSessionType = 'lecture' | 'tutorial' | 'exam' | 'presentation' | 'other'

export interface CalendarEvent {
  id: string
  date: string
  startTime: string
  endTime: string
  courseCode: string
  courseTitle: string
  sectionId: string
  instructor: string
  venue: string
  sessionType: CalendarSessionType
  examKind?: ExamKind
}

export function buildCalendarEvents(
  selections: SelectedSection[],
  courses: Course[],
): CalendarEvent[] {
  const events: CalendarEvent[] = []

  for (const sel of selections) {
    const course = courses.find(c => c.courseCode === sel.courseCode && c.module === sel.module)
    const section = course?.sections.find(s => s.sectionId === sel.sectionId)
    if (!course || !section) continue

    const fallbackInstructor = formatSectionInstructors(section)

    for (const meeting of section.meetings) {
      const names = meetingInstructorNames(section, meeting)
      events.push({
        id: `${sel.courseCode}-M${sel.module}-${sel.sectionId}-${meeting.date}-${meeting.startTime}-${meeting.sessionType}`,
        date: meeting.date,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        courseCode: sel.courseCode,
        courseTitle: course.courseTitle,
        sectionId: sel.sectionId,
        instructor: names.length ? names.join(' / ') : fallbackInstructor,
        venue: meeting.venue,
        sessionType: meeting.sessionType,
      })
    }

    const exam = resolveExam(course, section)
    if (exam?.date) {
      const sessionType = examSessionType(exam.kind)
      events.push({
        id: `${sel.courseCode}-M${sel.module}-${sel.sectionId}-${exam.date}-${exam.startTime || 'allday'}-${sessionType}`,
        date: exam.date,
        startTime: exam.startTime || '',
        endTime: exam.endTime || '',
        courseCode: sel.courseCode,
        courseTitle: course.courseTitle,
        sectionId: sel.sectionId,
        instructor: '',
        venue: exam.venue || '',
        sessionType,
        examKind: exam.kind,
      })
    }
  }

  return events.sort((a, b) =>
    a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
  )
}

export function eventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {}
  for (const ev of events) {
    ;(map[ev.date] ||= []).push(ev)
  }
  return map
}

export function calendarEventLabel(event: CalendarEvent): string {
  if (event.sessionType === 'lecture') return `${event.courseCode} LEC`
  if (event.sessionType === 'tutorial') return `${event.courseCode} TUT`
  return examEventTitle(event.courseCode, event.examKind ?? 'other')
}

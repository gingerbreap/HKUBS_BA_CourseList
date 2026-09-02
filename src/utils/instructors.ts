import type { Course, Instructor, Meeting, Section } from '../types'

export function sectionInstructorNames(section: Section): string[] {
  return section.instructors.map(i => i.name)
}

const FIRST_LECTURES_NOTE = /^First \d+ lectures$/i
const LAST_LECTURES_NOTE = /^Last \d+ lectures$/i

/** True when instructors split the class (e.g. First 5 / Last 5 lectures). */
function hasComplementaryLectureNotes(instructors: Instructor[]): boolean {
  if (instructors.length < 2) return false
  const notes = instructors.map(i => i.note)
  if (!notes.every((n): n is string => Boolean(n))) return false
  return notes.some(n => FIRST_LECTURES_NOTE.test(n)) && notes.some(n => LAST_LECTURES_NOTE.test(n))
}

/** Compact header label, e.g. "Prof. A & Prof. B (Last 5 lectures)" for split classes. */
export function formatSectionInstructors(section: Section): string {
  const { instructors } = section
  if (hasComplementaryLectureNotes(instructors)) {
    const names = instructors.map(i => i.name).join(' & ')
    const lastNote = instructors[instructors.length - 1].note
    return lastNote ? `${names} (${lastNote})` : names
  }
  return instructors
    .map(i => (i.note ? `${i.name} (${i.note})` : i.name))
    .join(' / ')
}

/** Instructors of one meeting, falling back to the class instructors. */
export function meetingInstructorNames(section: Section, meeting: Meeting): string[] {
  return meeting.instructors?.length ? meeting.instructors : sectionInstructorNames(section)
}

export function sectionHasInstructor(section: Section, name: string): boolean {
  return section.instructors.some(i => i.name === name)
}

/** Distinct instructors across a course's classes, in teaching-plan order. */
export function courseInstructors(courses: Course[]): Instructor[] {
  const byName = new Map<string, Instructor>()
  for (const course of courses) {
    for (const section of course.sections) {
      for (const instructor of section.instructors) {
        if (!byName.has(instructor.name)) byName.set(instructor.name, instructor)
      }
    }
  }
  return [...byName.values()]
}

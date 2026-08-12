import type { Course, Instructor, Meeting, Section } from '../types'

export function sectionInstructorNames(section: Section): string[] {
  return section.instructors.map(i => i.name)
}

/** Display label for a class, e.g. "Prof. A (First 5 lectures) / Prof. B (Last 5 lectures)". */
export function formatSectionInstructors(section: Section): string {
  return section.instructors
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

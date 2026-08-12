import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourses } from '../hooks/useCoursesData'
import WeekdayStrip from '../components/WeekdayStrip'
import { formatSectionInstructors } from '../utils/instructors'
import type { Course, Section } from '../types'

function TimeBadge({ bucket }: { bucket: string }) {
  const cls = bucket === 'AM' ? 'badge-am' : bucket === 'PM' ? 'badge-pm' : 'badge-nt'
  return <span className={`badge ${cls}`}>{bucket}</span>
}

function TypeBadge({ type }: { type: string }) {
  const cls = type === 'Core' ? 'badge-core' : type === 'Capstone' ? 'badge-capstone' : 'badge-elective'
  return <span className={`badge ${cls}`}>{type}</span>
}

function summarizeDates(section: Section): string {
  const lectures = section.meetings.filter(m => m.sessionType === 'lecture')
  if (lectures.length === 0) return ''
  const days = lectures.map(m => m.date)
  const first = days[0]
  const last = days[days.length - 1]
  const time = `${lectures[0].startTime}-${lectures[0].endTime}`
  return `${first} ~ ${last} | ${time} | ${lectures.length}次课`
}

function CourseCard({ course }: { course: Course }) {
  const navigate = useNavigate()

  return (
    <div className="card card-clickable course-card" onClick={() => navigate(`/course/${course.courseCode}`)}>
      <div className="course-card-header">
        <div>
          <span className="course-code">{course.courseCode}</span>
          <span className="course-title" style={{ marginLeft: 8 }}>{course.courseTitle}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <TypeBadge type={course.courseType} />
          {course.streamTags.map(t => <span key={t} className="badge badge-stream">{t}</span>)}
        </div>
      </div>
      {course.sections.map(sec => (
        <div className="section-row" key={sec.sectionId}>
          <span className="section-id">{sec.sectionId}班</span>
          <TimeBadge bucket={sec.timeBucket} />
          <WeekdayStrip days={sec.meetingDays} title={sec.dayPattern} />
          <span className="course-instructor">{formatSectionInstructors(sec)}</span>
          <span className="section-time">{summarizeDates(sec)}</span>
        </div>
      ))}
      {course.sections.some(s => s.examOrFinal) ? (
        course.sections.filter(s => s.examOrFinal).map(s => (
          <div key={s.sectionId} style={{ fontSize: 12, color: '#5f6368', paddingTop: 4 }}>
            📝 {s.sectionId}班 {s.examOrFinal!.raw}
          </div>
        ))
      ) : course.examOrFinal ? (
        <div style={{ fontSize: 12, color: '#5f6368', paddingTop: 4 }}>
          📝 {course.examOrFinal.raw}
        </div>
      ) : null}
    </div>
  )
}

export default function Timetable() {
  const { courses, loading } = useCourses()

  const grouped = useMemo(() => {
    const map: Record<number, Course[]> = {}
    for (const c of courses) {
      ;(map[c.module] ||= []).push(c)
    }
    return map
  }, [courses])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>加载中...</div>

  const moduleNames: Record<number, string> = {
    1: 'Module 1 — Sep 5 ~ Oct 21, 2026',
    2: 'Module 2 — Oct 22 ~ Nov 30, 2026',
    3: 'Module 3 — Dec 1, 2026 ~ Jan 21, 2027',
    4: 'Module 4 — Jan 22 ~ Mar 10, 2027',
    5: 'Module 5 — Mar 18 ~ May 4, 2027',
  }

  return (
    <div>
      <h1 className="page-title">模块时间表</h1>
      {[1, 2, 3, 4, 5].map(mod => (
        <div key={mod}>
          <div className="module-header">{moduleNames[mod]}</div>
          {(grouped[mod] || []).map(c => (
            <CourseCard key={`${c.courseCode}-${c.module}`} course={c} />
          ))}
        </div>
      ))}
    </div>
  )
}

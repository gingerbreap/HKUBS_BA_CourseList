import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCourses } from '../hooks/useCoursesData'
import WeekdayStrip from '../components/WeekdayStrip'
import {
  courseInstructors,
  formatSectionInstructors,
  meetingInstructorNames,
  sectionHasInstructor,
} from '../utils/instructors'
import type { Course, ExamOrFinal, Section } from '../types'

const BASE = import.meta.env.BASE_URL

function TimeBadge({ bucket }: { bucket: string }) {
  const cls = bucket === 'AM' ? 'badge-am' : bucket === 'PM' ? 'badge-pm' : 'badge-nt'
  return <span className={`badge ${cls}`}>{bucket}</span>
}

function ExamNote({ exam }: { exam: ExamOrFinal }) {
  return (
    <div style={{ fontSize: 13, color: '#5f6368', marginTop: 4 }}>
      📝 考试/期末：{exam.raw}
    </div>
  )
}

export function CourseDetailContent({
  courseCode,
  compact = false,
}: {
  courseCode: string
  compact?: boolean
}) {
  const { courses, loading } = useCourses()

  const matchedCourses = useMemo(
    () => courses.filter(c => c.courseCode === courseCode),
    [courses, courseCode],
  )

  const instructors = useMemo(() => courseInstructors(matchedCourses), [matchedCourses])

  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null)
  useEffect(() => {
    if (instructors.length === 0) return
    if (!selectedInstructor || !instructors.some(i => i.name === selectedInstructor)) {
      setSelectedInstructor(instructors[0].name)
    }
  }, [instructors, selectedInstructor])

  const activeInstructor = selectedInstructor ?? instructors[0]?.name ?? null
  const [tutExpandedBySectionKey, setTutExpandedBySectionKey] = useState<Record<string, boolean>>({})

  if (loading) return <div style={{ padding: compact ? 16 : 40, textAlign: 'center' }}>加载中...</div>
  if (matchedCourses.length === 0) {
    return <div style={{ padding: compact ? 16 : 40, textAlign: 'center' }}>未找到课程 {courseCode}</div>
  }

  const sectionsOf = (course: Course): Section[] =>
    activeInstructor
      ? course.sections.filter(s => sectionHasInstructor(s, activeInstructor))
      : course.sections

  const coursesForInstructor = matchedCourses.filter(c => sectionsOf(c).length > 0)

  const pdfPath =
    coursesForInstructor
      .flatMap(sectionsOf)
      .map(s => s.outlinePdfPath)
      .find(Boolean) ??
    coursesForInstructor[0]?.outlinePdfPath ??
    matchedCourses[0].outlinePdfPath

  return (
    <div>
      <div className="detail-header">
        <h1>{matchedCourses[0].courseCode} {matchedCourses[0].courseTitle}</h1>
        <div className="detail-meta">
          <span
            className={`badge ${
              matchedCourses[0].courseType === 'Core'
                ? 'badge-core'
                : matchedCourses[0].courseType === 'Capstone'
                  ? 'badge-capstone'
                  : 'badge-elective'
            }`}
          >
            {matchedCourses[0].courseType}
          </span>
          {matchedCourses[0].streamTags.map(t => <span key={t} className="badge badge-stream">{t}</span>)}
        </div>
      </div>

      {instructors.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Instructor</div>
          <div className="tabs">
            {instructors.map(inst => (
              <button
                key={inst.name}
                type="button"
                className={`tab ${inst.name === activeInstructor ? 'active' : ''}`}
                onClick={() => setSelectedInstructor(inst.name)}
              >
                {inst.name}
                {inst.note && (
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 6 }}>
                    ({inst.note})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {coursesForInstructor.map(course => {
        const secs = sectionsOf(course)
        const hasSectionExam = secs.some(s => s.examOrFinal)
        return (
          <div key={course.module} style={{ marginBottom: 24 }}>
            <div className="module-header" style={{ fontSize: 14 }}>Module {course.module}</div>

            {secs.map(sec => (
              <div className="card" key={sec.sectionId}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span className="section-id" style={{ fontSize: 16 }}>{sec.sectionId}班</span>
                  <TimeBadge bucket={sec.timeBucket} />
                  <WeekdayStrip days={sec.meetingDays} title={sec.dayPattern} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{formatSectionInstructors(sec)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sec.dayPattern}</span>
                </div>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      <th style={{ textAlign: 'left', padding: '4px 8px' }}>日期</th>
                      <th style={{ textAlign: 'left', padding: '4px 8px' }}>时间</th>
                      <th style={{ textAlign: 'left', padding: '4px 8px' }}>地点</th>
                      <th style={{ textAlign: 'left', padding: '4px 8px' }}>类型</th>
                      <th style={{ textAlign: 'left', padding: '4px 8px' }}>教授</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sec.meetings
                      .filter(m => m.sessionType === 'lecture')
                      .map((m, i) => {
                        const taught = meetingInstructorNames(sec, m)
                        const byActive = !activeInstructor || taught.includes(activeInstructor)
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f3f4', opacity: byActive ? 1 : 0.5 }}>
                            <td style={{ padding: '4px 8px' }}>{m.date}</td>
                            <td style={{ padding: '4px 8px' }}>{m.startTime}-{m.endTime}</td>
                            <td style={{ padding: '4px 8px' }}>{m.venue}</td>
                            <td style={{ padding: '4px 8px' }}>
                              <span className="badge badge-core">LEC</span>
                            </td>
                            <td style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}>
                              {taught.join(' / ')}
                            </td>
                          </tr>
                        )
                      })}

                    {(() => {
                      const tutorialMeetings = sec.meetings.filter(m => m.sessionType === 'tutorial')
                      if (tutorialMeetings.length === 0) return null
                      const key = `${course.module}-${sec.sectionId}`
                      const expanded = !!tutExpandedBySectionKey[key]
                      return (
                        <>
                          <tr>
                            <td colSpan={5} style={{ padding: '6px 8px' }}>
                              <button
                                type="button"
                                className="tut-toggle-btn"
                                onClick={() =>
                                  setTutExpandedBySectionKey(prev => ({ ...prev, [key]: !prev[key] }))
                                }
                              >
                                {expanded ? `TUT (${tutorialMeetings.length} sessions) (Hide)` : `TUT (${tutorialMeetings.length} sessions) (Show)`}
                              </button>
                            </td>
                          </tr>
                          {expanded &&
                            tutorialMeetings.map((m, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f1f3f4' }}>
                                <td style={{ padding: '4px 8px' }}>{m.date}</td>
                                <td style={{ padding: '4px 8px' }}>{m.startTime}-{m.endTime}</td>
                                <td style={{ padding: '4px 8px' }}>{m.venue}</td>
                                <td style={{ padding: '4px 8px' }}>
                                  <span className="badge badge-capstone">TUT</span>
                                </td>
                                <td style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}>
                                  {meetingInstructorNames(sec, m).join(' / ')}
                                </td>
                              </tr>
                            ))}
                        </>
                      )
                    })()}
                  </tbody>
                </table>
                {sec.examOrFinal && <ExamNote exam={sec.examOrFinal} />}
              </div>
            ))}

            {course.examOrFinal && !hasSectionExam && (
              <ExamNote exam={course.examOrFinal} />
            )}
          </div>
        )
      })}

      {pdfPath && (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>课程大纲</h2>
          <iframe
            className={`pdf-viewer${compact ? ' pdf-viewer--compact' : ''}`}
            src={`${BASE}${pdfPath}`}
            title="Course Outline"
          />
        </div>
      )}
    </div>
  )
}

export default function CourseDetail() {
  const { courseCode } = useParams<{ courseCode: string }>()
  return <CourseDetailContent courseCode={courseCode || ''} />
}

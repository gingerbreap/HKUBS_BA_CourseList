import { useMemo, useState } from 'react'
import CourseDetailModal from '../components/CourseDetailModal'
import PlannerCalendar from '../components/PlannerCalendar'
import { useI18n } from '../i18n/context'
import { useCourses } from '../hooks/useCoursesData'
import { useSelections } from '../hooks/useSelections'
import { buildCalendarEvents } from '../utils/calendarEvents'

/** Standalone calendar tab — same calendar feature as on Planner (main). */
export default function Calendar() {
  const { t } = useI18n()
  const { courses, loading } = useCourses()
  const { selections, replace } = useSelections()
  const [detailCode, setDetailCode] = useState<string | null>(null)
  const calendarEvents = useMemo(
    () => buildCalendarEvents(selections, courses),
    [selections, courses],
  )

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>{t('common.loading')}</div>
  }

  return (
    <div>
      <h1 className="page-title">{t('calendar.pageTitle')}</h1>
      <PlannerCalendar
        events={calendarEvents}
        courses={courses}
        onImportSelections={replace}
        onCourseClick={setDetailCode}
      />
      {detailCode && (
        <CourseDetailModal
          courseCode={detailCode}
          onClose={() => setDetailCode(null)}
        />
      )}
    </div>
  )
}

import { useRequirements, useCourses } from '../hooks/useCoursesData'
import { useI18n } from '../i18n/context'

export default function Requirements() {
  const { t, tList } = useI18n()
  const req = useRequirements()
  const { courses } = useCourses()

  if (!req) return <div style={{ padding: 40, textAlign: 'center' }}>{t('common.loading')}</div>

  const getTitle = (code: string) => courses.find(c => c.courseCode === code)?.courseTitle || code
  const planningRules = tList('requirements.planningRules')
  const notes = tList('requirements.notes')

  return (
    <div>
      <h1 className="page-title">{t('requirements.title')}</h1>

      <div className="card req-section">
        <h2>{t('requirements.overviewTitle')}</h2>
        <p style={{ fontSize: 14, marginBottom: 12 }}>
          {t('requirements.overviewBody', {
            total: req.totalCourses,
            credits: req.creditsPerCourse,
          })}
        </p>
      </div>

      <div className="card req-section">
        <h2>{t('requirements.coreTitle')}</h2>
        <ul className="course-list">
          {req.coreCourses.map(code => (
            <li key={code}><strong>{code}</strong> — {getTitle(code)}</li>
          ))}
        </ul>
      </div>

      <div className="card req-section">
        <h2>{t('requirements.capstoneTitle')}</h2>
        <ul className="course-list">
          {req.capstoneCourses.map(c => (
            <li key={c.courseCode}><strong>{c.courseCode}</strong> — {c.courseTitle}</li>
          ))}
        </ul>
      </div>

      <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>{t('requirements.streamsTitle')}</h2>

      <div className="stream-card">
        <h3>{t('requirements.aiTitle')}</h3>
        <p>{t('requirements.aiDescription')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>{t('requirements.listA')}</h4>
            <ul className="course-list">
              {(req.streams.AI.listA as { courses: string[] }).courses.map(code => (
                <li key={code}><strong>{code}</strong> — {getTitle(code)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>{t('requirements.listB')}</h4>
            <ul className="course-list">
              {(req.streams.AI.listB as { courses: string[] }).courses.map(code => (
                <li key={code}><strong>{code}</strong> — {getTitle(code)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="stream-card">
        <h3>{t('requirements.mcTitle')}</h3>
        <p>{t('requirements.mcDescription')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>{t('requirements.listC')}</h4>
            <ul className="course-list">
              {(req.streams.MC.listC as { courses: string[] }).courses.map(code => (
                <li key={code}><strong>{code}</strong> — {getTitle(code)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>{t('requirements.listD')}</h4>
            <ul className="course-list">
              {(req.streams.MC.listD as { courses: string[] }).courses.map(code => (
                <li key={code}><strong>{code}</strong> — {getTitle(code)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card req-section">
        <h2>{t('requirements.planningTitle')}</h2>
        <ul className="course-list">
          {planningRules.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="card req-section">
        <h2>{t('requirements.notesTitle')}</h2>
        <ul className="course-list">
          {notes.map((n, i) => (
            <li key={i} style={{ fontSize: 13, color: '#5f6368' }}>{n}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

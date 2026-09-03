import { useState } from 'react'
import { teachingPlanNotices, type TeachingPlanNotice } from '../data/teachingPlanUpdates'
import { usePersistentDismiss } from '../hooks/usePersistentDismiss'
import { useI18n } from '../i18n/context'

const DISMISS_PREFIX = 'msba-dismiss-teaching-plan-notice'
/** Legacy key from the Aug 18 single-notice UI */
const LEGACY_DISMISS_KEY = 'msba-dismiss-teaching-plan-notice'
const LEGACY_NOTICE_ID = '20260818-7015-7037'

function dismissStorageKey(noticeId: string): string {
  return noticeId === LEGACY_NOTICE_ID ? LEGACY_DISMISS_KEY : `${DISMISS_PREFIX}:${noticeId}`
}

function NoticeCard({ notice }: { notice: TeachingPlanNotice }) {
  const { t } = useI18n()
  const version = notice.updates.map(u => u.courseCode).join('+')
  const { dismissed, dismiss } = usePersistentDismiss(
    dismissStorageKey(notice.id),
    version,
    `msba:dismiss-teaching-plan-${notice.id}`,
  )
  const [expanded, setExpanded] = useState(notice.defaultExpanded)

  if (dismissed) return null

  const title = t('teachingPlan.titleDated', {
    timestamp: notice.timestamp,
    courses: notice.courseRefs,
  })

  return (
    <div className={`teaching-plan-notice${expanded ? '' : ' teaching-plan-notice--folded'}`}>
      <button type="button" className="notice-dismiss-btn" onClick={dismiss}>
        {t('common.dismiss')}
      </button>
      <button
        type="button"
        className="teaching-plan-notice-toggle"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <span className="teaching-plan-notice-title">{title}</span>
        <span className="teaching-plan-notice-chevron" aria-hidden="true">
          {expanded ? '▾' : '▸'}
        </span>
      </button>

      {expanded && (
        <>
          <div className="teaching-plan-notice-text">
            {t(`teachingPlan.${notice.bodyKey}`, notice.bodyParams)}
          </div>

          <div className="teaching-plan-table-wrap">
            <table className="teaching-plan-table">
              <thead>
                <tr>
                  <th>{t('teachingPlan.colCourse')}</th>
                  <th>{t('teachingPlan.colField')}</th>
                  <th>{t('teachingPlan.colOld')}</th>
                  <th>{t('teachingPlan.colNew')}</th>
                </tr>
              </thead>
              <tbody>
                {notice.updates.flatMap(update =>
                  update.rows.map((row, index) => (
                    <tr key={`${notice.id}-${update.courseCode}-${row.label}`}>
                      <td>
                        <div className="teaching-plan-course-code">{update.courseCode}</div>
                        {index === 0 && (
                          <div className="teaching-plan-course-title">{update.courseTitle}</div>
                        )}
                      </td>
                      <td>{row.label}</td>
                      <td><span className="teaching-plan-old">{row.oldValue}</span></td>
                      <td><span className="teaching-plan-new">{row.newValue}</span></td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default function TeachingPlanUpdateNotice() {
  return (
    <>
      {teachingPlanNotices.map(notice => (
        <NoticeCard key={notice.id} notice={notice} />
      ))}
    </>
  )
}

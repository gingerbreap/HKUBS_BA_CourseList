import { teachingPlanUpdates } from '../data/teachingPlanUpdates'
import { usePersistentDismiss } from '../hooks/usePersistentDismiss'
import { useI18n } from '../i18n/context'

const DISMISS_KEY = 'msba-dismiss-teaching-plan-notice'
const DISMISS_EVENT = 'msba:dismiss-teaching-plan-notice'
const NOTICE_VERSION = teachingPlanUpdates.map(update => update.courseCode).join('+')

export default function TeachingPlanUpdateNotice() {
  const { t } = useI18n()
  const { dismissed, dismiss } = usePersistentDismiss(DISMISS_KEY, NOTICE_VERSION, DISMISS_EVENT)

  if (dismissed) return null

  return (
    <div className="teaching-plan-notice">
      <button type="button" className="notice-dismiss-btn" onClick={dismiss}>
        {t('common.dismiss')}
      </button>
      <div className="teaching-plan-notice-title">
        {t('teachingPlan.title')}
      </div>
      <div className="teaching-plan-notice-text">
        {t('teachingPlan.body', { code1: 'MSBA7015', code2: 'MSBA7037' })}
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
            {teachingPlanUpdates.flatMap(update =>
              update.rows.map((row, index) => (
                <tr key={`${update.courseCode}-${row.label}`}>
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
    </div>
  )
}

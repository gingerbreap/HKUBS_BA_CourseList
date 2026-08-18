import { teachingPlanUpdates } from '../data/teachingPlanUpdates'
import { usePersistentDismiss } from '../hooks/usePersistentDismiss'

const DISMISS_KEY = 'msba-dismiss-teaching-plan-notice'
const DISMISS_EVENT = 'msba:dismiss-teaching-plan-notice'
const NOTICE_VERSION = teachingPlanUpdates.map(update => update.courseCode).join('+')

export default function TeachingPlanUpdateNotice() {
  const { dismissed, dismiss } = usePersistentDismiss(DISMISS_KEY, NOTICE_VERSION, DISMISS_EVENT)

  if (dismissed) return null

  return (
    <div className="teaching-plan-notice">
      <button type="button" className="notice-dismiss-btn" onClick={dismiss}>
        我知道了
      </button>
      <div className="teaching-plan-notice-title">
        Teaching Plan 更新已同步
      </div>
      <div className="teaching-plan-notice-text">
        <code>MSBA7015</code> 与 <code>MSBA7037</code> 的上课安排已按最新 Teaching Plan 更新，
        你先前看到的时间冲突与日历内容可能会与旧版本不同。
      </div>

      <div className="teaching-plan-table-wrap">
        <table className="teaching-plan-table">
          <thead>
            <tr>
              <th>课程</th>
              <th>项目</th>
              <th>历史值</th>
              <th>更新后</th>
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

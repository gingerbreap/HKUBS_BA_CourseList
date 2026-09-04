import { useMemo, useState } from 'react'
import {
  buildDisplayRows,
  teachingPlanNotices,
  type ChangePart,
  type TeachingPlanDisplayRow,
  type TeachingPlanNotice,
} from '../data/teachingPlanUpdates'
import { usePersistentDismiss } from '../hooks/usePersistentDismiss'
import { useI18n } from '../i18n/context'
import type { SelectedSection } from '../types'

const DISMISS_PREFIX = 'msba-dismiss-teaching-plan-notice'
const LEGACY_DISMISS_KEY = 'msba-dismiss-teaching-plan-notice'
const LEGACY_NOTICE_ID = '20260818-7015-7037'

function dismissStorageKey(noticeId: string): string {
  return noticeId === LEGACY_NOTICE_ID ? LEGACY_DISMISS_KEY : `${DISMISS_PREFIX}:${noticeId}`
}

function emojiFor(kind: ChangePart['emoji']): string {
  if (kind === 'time') return '⏰ '
  if (kind === 'venue') return '📌 '
  return ''
}

function ChangeCell({ parts }: { parts: ChangePart[] }) {
  return (
    <div className="teaching-plan-change-parts">
      {parts.map((part, index) => (
        <div
          key={`${index}-${part.text}`}
          className={part.emoji === 'venue' ? 'teaching-plan-change-part teaching-plan-change-part--venue' : 'teaching-plan-change-part'}
        >
          {emojiFor(part.emoji)}{part.text}
        </div>
      ))}
    </div>
  )
}

function itemLabel(
  row: TeachingPlanDisplayRow,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  // Dated session items: "Sep 23 TUT 时间" / time only if same-kind collision
  if (
    row.itemKey === 'sessionVenue'
    || row.itemKey === 'sessionTime'
    || row.itemKey === 'sessionTimeVenue'
  ) {
    const params: Record<string, string> = {
      date: row.itemDate ?? '',
      kind: row.sessionKind ?? 'LEC',
    }
    if (row.itemTime) params.time = row.itemTime
    const timed = !!row.itemTime
    if (row.itemKey === 'sessionVenue') {
      return t(timed ? 'teachingPlan.items.sessionVenueTimed' : 'teachingPlan.items.sessionVenue', params)
    }
    if (row.itemKey === 'sessionTime') {
      return t(timed ? 'teachingPlan.items.sessionTimeTimed' : 'teachingPlan.items.sessionTime', params)
    }
    return t(
      timed ? 'teachingPlan.items.sessionTimeVenueTimed' : 'teachingPlan.items.sessionTimeVenue',
      params,
    )
  }

  const params: Record<string, string> = {}
  if (row.itemDate) params.date = row.itemDate
  if (row.itemTime) params.time = row.itemTime

  // LEC/TUT vs plain labels depending on whether the course has tutorials
  if (!row.hasTutorials) {
    if (row.itemKey === 'lecTimeVenue') return t('teachingPlan.items.timeVenue')
    if (row.itemKey === 'lecTime') return t('teachingPlan.items.time')
    if (row.itemKey === 'lecVenue') return t('teachingPlan.items.venue')
    if (row.itemKey === 'tutTime') return t('teachingPlan.items.time')
    if (row.itemKey === 'tutVenue') return t('teachingPlan.items.venue')
  }

  return t(`teachingPlan.items.${row.itemKey}`, params)
}

function selectedKey(courseCode: string, sectionId: string): string {
  return `${courseCode}::${sectionId}`
}

function buildSelectedSet(selections: SelectedSection[]): Set<string> {
  return new Set(selections.map(s => selectedKey(s.courseCode, s.sectionId)))
}

function NoticeCard({
  notice,
  selectedSet,
}: {
  notice: TeachingPlanNotice
  selectedSet: Set<string>
}) {
  const { t } = useI18n()
  const version = notice.updates.map(u => u.courseCode).join('+')
  const { dismissed, dismiss } = usePersistentDismiss(
    dismissStorageKey(notice.id),
    version,
    `msba:dismiss-teaching-plan-${notice.id}`,
  )
  const [expanded, setExpanded] = useState(notice.defaultExpanded)
  const displayRows = buildDisplayRows(notice)

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
                  <th>{t('teachingPlan.colClass')}</th>
                  <th>{t('teachingPlan.colItem')}</th>
                  <th>{t('teachingPlan.colOld')}</th>
                  <th>{t('teachingPlan.colNew')}</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map(row => {
                  const isSelectedClass = !!(
                    row.sectionId
                    && selectedSet.has(selectedKey(row.courseCode, row.sectionId))
                  )
                  return (
                    <tr
                      key={row.key}
                      className={isSelectedClass ? 'teaching-plan-row--selected' : undefined}
                    >
                      <td>
                        {row.showCourse ? (
                          <>
                            <div className="teaching-plan-course-code">{row.courseCode}</div>
                            <div className="teaching-plan-course-title">{row.courseTitle}</div>
                          </>
                        ) : row.showCourseCode ? (
                          <div className="teaching-plan-course-code">{row.courseCode}</div>
                        ) : null}
                      </td>
                      <td className={isSelectedClass ? 'teaching-plan-class--selected' : undefined}>
                        {row.showClass ? (row.sectionId ?? '') : null}
                      </td>
                      <td>{row.showItem ? itemLabel(row, t) : null}</td>
                      <td className="teaching-plan-old-cell">
                        <ChangeCell parts={row.previous} />
                      </td>
                      <td className="teaching-plan-new-cell">
                        <ChangeCell parts={row.updated} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default function TeachingPlanUpdateNotice({
  selections,
}: {
  selections: SelectedSection[]
}) {
  const selectedSet = useMemo(() => buildSelectedSet(selections), [selections])

  return (
    <>
      {teachingPlanNotices.map(notice => (
        <NoticeCard key={notice.id} notice={notice} selectedSet={selectedSet} />
      ))}
    </>
  )
}

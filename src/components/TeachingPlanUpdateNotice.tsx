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

function ChangeCell({
  parts,
  hideTimeEmoji = false,
}: {
  parts: ChangePart[]
  hideTimeEmoji?: boolean
}) {
  return (
    <div className="teaching-plan-change-parts">
      {parts.map((part, index) => (
        <div
          key={`${index}-${part.text}`}
          className={part.emoji === 'venue' ? 'teaching-plan-change-part teaching-plan-change-part--venue' : 'teaching-plan-change-part'}
        >
          {hideTimeEmoji && part.emoji === 'time' ? '' : emojiFor(part.emoji)}{part.text}
        </div>
      ))}
    </div>
  )
}

function extractDateToken(text: string): string | null {
  const match = text.match(
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,\s*\d{4})?/i,
  )
  return match ? match[0].replace(/,/g, '').replace(/\s+/g, ' ').trim().toLowerCase() : null
}

/** True when Previous/Updated clock fields move to a different calendar day. */
function involvesDateChange(previous: ChangePart[], updated: ChangePart[]): boolean {
  const prevDates = previous.map(p => extractDateToken(p.text)).filter((d): d is string => !!d)
  const nextDates = updated.map(p => extractDateToken(p.text)).filter((d): d is string => !!d)
  if (prevDates.length === 0 || nextDates.length === 0) return false
  return prevDates[0] !== nextDates[0]
}

function itemLabel(
  row: TeachingPlanDisplayRow,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  const dateChanged = involvesDateChange(row.previous, row.updated)

  // Dated session items: "Sep 23 时间" — LEC/TUT lives in the Class column
  if (
    row.itemKey === 'sessionVenue'
    || row.itemKey === 'sessionTime'
    || row.itemKey === 'sessionTimeVenue'
  ) {
    const params: Record<string, string> = {
      date: row.itemDate ?? '',
    }
    if (row.itemTime) params.time = row.itemTime
    const timed = !!row.itemTime
    if (row.itemKey === 'sessionVenue') {
      return t(timed ? 'teachingPlan.items.sessionVenueTimed' : 'teachingPlan.items.sessionVenue', params)
    }
    if (row.itemKey === 'sessionTime') {
      // Same-day clock change keeps 时间; cross-day move uses 日期
      if (dateChanged) {
        return timed
          ? t('teachingPlan.items.sessionDateTimed', params)
          : t('teachingPlan.items.sessionDate', params)
      }
      return t(timed ? 'teachingPlan.items.sessionTimeTimed' : 'teachingPlan.items.sessionTime', params)
    }
    if (dateChanged) {
      return timed
        ? t('teachingPlan.items.sessionDateVenueTimed', params)
        : t('teachingPlan.items.sessionDateVenue', params)
    }
    return t(
      timed ? 'teachingPlan.items.sessionTimeVenueTimed' : 'teachingPlan.items.sessionTimeVenue',
      params,
    )
  }

  // Plain item names — no LEC/TUT prefix (TUT is a Class column value)
  // Date change: 时间 → 日期, 时间与教室 → 日期与教室
  if (row.itemKey === 'lecTimeVenue' || row.itemKey === 'tutTimeVenue' || row.itemKey === 'timeVenue') {
    return t(dateChanged ? 'teachingPlan.items.dateVenue' : 'teachingPlan.items.timeVenue')
  }
  if (
    row.itemKey === 'lecTime'
    || row.itemKey === 'tutTime'
    || row.itemKey === 'time'
    || row.itemKey === 'date'
  ) {
    return t(dateChanged || row.itemKey === 'date' ? 'teachingPlan.items.date' : 'teachingPlan.items.time')
  }
  if (row.itemKey === 'lecVenue' || row.itemKey === 'tutVenue') {
    return t('teachingPlan.items.venue')
  }
  if (row.itemKey === 'dateVenue') {
    return t('teachingPlan.items.dateVenue')
  }

  const params: Record<string, string> = {}
  if (row.itemDate) params.date = row.itemDate
  if (row.itemTime) params.time = row.itemTime
  return t(`teachingPlan.items.${row.itemKey}`, params)
}

function previousPartsForDisplay(row: TeachingPlanDisplayRow): ChangePart[] {
  // Date + venue reschedule: Previous only needs the old date/time, not the old venue
  const dateChanged = involvesDateChange(row.previous, row.updated)
  const updatedHasVenue = row.updated.some(p => p.emoji === 'venue')
  if (dateChanged && updatedHasVenue) {
    return row.previous.filter(p => p.emoji !== 'venue')
  }
  return row.previous
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
                    && row.sectionId !== 'TUT'
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
                        <ChangeCell parts={previousPartsForDisplay(row)} hideTimeEmoji />
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

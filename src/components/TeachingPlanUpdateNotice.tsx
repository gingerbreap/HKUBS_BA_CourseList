import { useMemo, useState } from 'react'
import {
  teachingPlanNotices,
  type TeachingPlanNotice,
} from '../data/teachingPlanUpdates'
import { usePersistentDismiss } from '../hooks/usePersistentDismiss'
import { useI18n } from '../i18n/context'
import type { SelectedSection } from '../types'
import { TeachingPlanNoticeBody, buildSelectedSet } from './TeachingPlanNoticeBody'

const DISMISS_PREFIX = 'msba-dismiss-teaching-plan-notice'
const LEGACY_DISMISS_KEY = 'msba-dismiss-teaching-plan-notice'
const LEGACY_NOTICE_ID = '20260818-7015-7037'

function dismissStorageKey(noticeId: string): string {
  return noticeId === LEGACY_NOTICE_ID ? LEGACY_DISMISS_KEY : `${DISMISS_PREFIX}:${noticeId}`
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
        <TeachingPlanNoticeBody notice={notice} selectedSet={selectedSet} />
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

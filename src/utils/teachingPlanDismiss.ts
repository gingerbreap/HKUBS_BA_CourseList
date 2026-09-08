import {
  teachingPlanNotices,
  type TeachingPlanNotice,
} from '../data/teachingPlanUpdates'

const DISMISS_PREFIX = 'msba-dismiss-teaching-plan-notice'
const LEGACY_DISMISS_KEY = 'msba-dismiss-teaching-plan-notice'
const LEGACY_NOTICE_ID = '20260818-7015-7037'

export function teachingPlanDismissStorageKey(noticeId: string): string {
  return noticeId === LEGACY_NOTICE_ID
    ? LEGACY_DISMISS_KEY
    : `${DISMISS_PREFIX}:${noticeId}`
}

export function teachingPlanDismissVersion(notice: TeachingPlanNotice): string {
  return notice.updates.map(u => u.courseCode).join('+')
}

export function teachingPlanDismissEventName(noticeId: string): string {
  return `msba:dismiss-teaching-plan-${noticeId}`
}

export function isTeachingPlanNoticeDismissed(notice: TeachingPlanNotice): boolean {
  const version = teachingPlanDismissVersion(notice)
  if (!version) return false
  try {
    return localStorage.getItem(teachingPlanDismissStorageKey(notice.id)) === version
  } catch {
    return false
  }
}

/** Notices the user has not yet dismissed via 「我知道了」 / Got it. */
export function listUnreadTeachingPlanNotices(): TeachingPlanNotice[] {
  return teachingPlanNotices.filter(n => !isTeachingPlanNoticeDismissed(n))
}

export function unreadTeachingPlanNoticeIds(): Set<string> {
  return new Set(listUnreadTeachingPlanNotices().map(n => n.id))
}

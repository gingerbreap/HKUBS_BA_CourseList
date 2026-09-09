/** Programme Office sync/check timestamp (Hong Kong Time). Shared by About + footer copy. */
export const DATA_SYNC_HKT = {
  /** Display form used in notices / copy: 2026/09/09 16:41 */
  display: '2026/09/09 16:41',
  /** ISO-like instant in HKT for timezone conversion */
  iso: '2026-09-09T16:41:00+08:00',
} as const

export const DEFAULT_LANDING_STORAGE_KEY = 'msba-default-landing'
export type DefaultLanding = 'planner' | 'calendar'

export function getAppVersion(): string {
  return typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.5.0.260910'
}

export function getAppCommitSha(): string {
  return typeof __APP_COMMIT_SHA__ !== 'undefined' ? __APP_COMMIT_SHA__ : ''
}

export function getAppRepoUrl(): string {
  return typeof __APP_REPO_URL__ !== 'undefined'
    ? __APP_REPO_URL__
    : 'https://github.com/gingerbreap/HKUBS_BA_CourseList'
}

export function getCommitUrl(sha = getAppCommitSha()): string | null {
  if (!sha) return null
  return `${getAppRepoUrl()}/commit/${sha}`
}

export type SyncTimezoneMode = 'HKT' | 'local'

const TZ_STORAGE_KEY = 'msba-sync-tz-mode'

export function getSyncTimezoneMode(): SyncTimezoneMode {
  try {
    return localStorage.getItem(TZ_STORAGE_KEY) === 'local' ? 'local' : 'HKT'
  } catch {
    return 'HKT'
  }
}

export function setSyncTimezoneMode(mode: SyncTimezoneMode): void {
  try {
    localStorage.setItem(TZ_STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}

/** Format as yyyy/MM/dd HH:mm in the given IANA timezone. */
function formatInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(p => p.type === type)?.value ?? ''

  const year = get('year')
  const month = get('month')
  const day = get('day')
  let hour = get('hour')
  // Some engines emit "24" for midnight
  if (hour === '24') hour = '00'
  const minute = get('minute')
  return `${year}/${month}/${day} ${hour}:${minute}`
}

export function formatDataSyncTime(mode: SyncTimezoneMode): string {
  if (mode === 'HKT') return DATA_SYNC_HKT.display
  const date = new Date(DATA_SYNC_HKT.iso)
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  return formatInTimeZone(date, localTz)
}

export function getDefaultLanding(): DefaultLanding {
  try {
    return localStorage.getItem(DEFAULT_LANDING_STORAGE_KEY) === 'calendar'
      ? 'calendar'
      : 'planner'
  } catch {
    return 'planner'
  }
}

export function setDefaultLanding(value: DefaultLanding): void {
  try {
    localStorage.setItem(DEFAULT_LANDING_STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
}

export function defaultLandingPath(value: DefaultLanding = getDefaultLanding()): string {
  return value === 'calendar' ? '/calendar' : '/planner'
}

/** Archive title course list: "7002, 7003, 7004" */
export function archiveCourseNumbers(courseRefs: string): string {
  return courseRefs.replace(/\s*&\s*/g, ', ')
}


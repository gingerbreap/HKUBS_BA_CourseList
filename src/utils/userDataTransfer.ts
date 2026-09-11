import { DEFAULT_LANDING_STORAGE_KEY, type DefaultLanding } from './appMeta'
import { SELECTIONS_STORAGE_KEY } from '../hooks/useSelections'
import { WISHLIST_STORAGE_KEY } from '../hooks/useWishlist'
import { LOCALE_STORAGE_KEY, type Locale } from '../i18n/types'
import {
  teachingPlanDismissEventName,
  teachingPlanDismissStorageKey,
  teachingPlanDismissVersion,
} from './teachingPlanDismiss'
import { teachingPlanNotices } from '../data/teachingPlanUpdates'
import { formatSectionInstructors } from './instructors'
import type { Course, SelectedSection } from '../types'

/** Stable programme id for this planner (专业名). */
export const PLANNER_PROGRAMME = 'MSc(BA)' as const

/**
 * 1.5: slim course refs; teachingPlanRead keys are publish timestamps only.
 * Older backups (noticeId → token, full SelectedSection rows) still import.
 */
export const USER_DATA_SCHEMA_VERSION = 1.5 as const

export const COURSE_STATUS_REGISTERED = 'registered' as const
export const COURSE_STATUS_WISHLIST = 'wishlist' as const

/** Compact course row in backup JSON (catalog fields rehydrated on import). */
export interface UserDataCourseEntry {
  courseCode: string
  /** Class letter / section id */
  sectionId: string
  /**
   * Enrollment status for forward compatibility.
   * Current app: selections → `registered`, wishlist → `wishlist`.
   */
  status: string
}

export interface UserDataSnapshot {
  schemaVersion: typeof USER_DATA_SCHEMA_VERSION
  exportedAt: string
  /** Programme / major name this backup belongs to */
  programme: typeof PLANNER_PROGRAMME | string
  locale: Locale
  defaultLanding: DefaultLanding
  /**
   * Teaching Plan notices marked read.
   * Keys are notice publish timestamps (e.g. `2026/09/11 18:22`); value is always `true`.
   */
  teachingPlanRead: Record<string, true>
  /** Selected courses, preserved order */
  selections: UserDataCourseEntry[]
  /** Wishlist / backup courses, preserved order */
  wishlist: UserDataCourseEntry[]
}

function readJsonArray(key: string): SelectedSection[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function toCourseEntry(s: SelectedSection, status: string): UserDataCourseEntry {
  return {
    courseCode: s.courseCode,
    sectionId: s.sectionId,
    status,
  }
}

function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'zh-CN' || stored === 'zh-HK' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  return 'zh-CN'
}

function readDefaultLanding(): DefaultLanding {
  try {
    return localStorage.getItem(DEFAULT_LANDING_STORAGE_KEY) === 'calendar'
      ? 'calendar'
      : 'planner'
  } catch {
    return 'planner'
  }
}

/** Export dismissed notices as `{ [timestamp]: true }`. */
function readTeachingPlanRead(): Record<string, true> {
  const out: Record<string, true> = {}
  for (const notice of teachingPlanNotices) {
    const version = teachingPlanDismissVersion(notice)
    if (!version) continue
    try {
      const stored = localStorage.getItem(teachingPlanDismissStorageKey(notice.id))
      if (stored === version) out[notice.timestamp] = true
    } catch {
      /* ignore */
    }
  }
  return out
}

export function buildUserDataSnapshot(): UserDataSnapshot {
  return {
    schemaVersion: USER_DATA_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    programme: PLANNER_PROGRAMME,
    locale: readLocale(),
    defaultLanding: readDefaultLanding(),
    teachingPlanRead: readTeachingPlanRead(),
    selections: readJsonArray(SELECTIONS_STORAGE_KEY).map(s =>
      toCourseEntry(s, COURSE_STATUS_REGISTERED),
    ),
    wishlist: readJsonArray(WISHLIST_STORAGE_KEY).map(s =>
      toCourseEntry(s, COURSE_STATUS_WISHLIST),
    ),
  }
}

export function snapshotToJson(snapshot: UserDataSnapshot): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`
}

function parseCourseEntry(value: unknown, defaultStatus: string): UserDataCourseEntry | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  if (typeof v.courseCode !== 'string' || !v.courseCode.trim()) return null
  if (typeof v.sectionId !== 'string' || !v.sectionId.trim()) return null
  const status =
    typeof v.status === 'string' && v.status.trim()
      ? v.status.trim()
      : defaultStatus
  return {
    courseCode: v.courseCode.trim(),
    sectionId: v.sectionId.trim(),
    status,
  }
}

function sanitizeCourseList(value: unknown, defaultStatus: string): UserDataCourseEntry[] {
  if (!Array.isArray(value)) return []
  const out: UserDataCourseEntry[] = []
  for (const item of value) {
    const entry = parseCourseEntry(item, defaultStatus)
    if (entry) out.push(entry)
  }
  return out
}

const TIMESTAMP_KEY_RE = /^\d{4}\/\d{2}\/\d{2}/

/**
 * Normalize teachingPlanRead into `{ [publishTimestamp]: true }`.
 * Accepts schema 1.5 keys-as-timestamps, plus legacy noticeId → token maps.
 */
function normalizeTeachingPlanRead(raw: Record<string, unknown>): Record<string, true> {
  const out: Record<string, true> = {}

  const markTimestamp = (ts: string) => {
    if (ts) out[ts] = true
  }

  for (const [key, value] of Object.entries(raw)) {
    if (TIMESTAMP_KEY_RE.test(key) || teachingPlanNotices.some(n => n.timestamp === key)) {
      markTimestamp(key)
      continue
    }

    const byId = teachingPlanNotices.find(n => n.id === key)
    if (byId) {
      markTimestamp(byId.timestamp)
      continue
    }

    if (typeof value === 'string' && value) {
      if (TIMESTAMP_KEY_RE.test(value) || teachingPlanNotices.some(n => n.timestamp === value)) {
        markTimestamp(value)
        continue
      }
      const byVersion = teachingPlanNotices.find(n => teachingPlanDismissVersion(n) === value)
      if (byVersion) markTimestamp(byVersion.timestamp)
    }
  }

  return out
}

export type ParseUserDataResult =
  | { ok: true; data: UserDataSnapshot }
  | { ok: false; error: 'invalidJson' | 'invalidShape' }

export function parseUserDataJson(text: string): ParseUserDataResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'invalidJson' }
  }
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'invalidShape' }
  const obj = raw as Record<string, unknown>

  const locale = obj.locale
  if (locale !== 'zh-CN' && locale !== 'zh-HK' && locale !== 'en') {
    return { ok: false, error: 'invalidShape' }
  }
  const defaultLanding = obj.defaultLanding
  if (defaultLanding !== 'planner' && defaultLanding !== 'calendar') {
    return { ok: false, error: 'invalidShape' }
  }
  if (typeof obj.programme !== 'string' || !obj.programme.trim()) {
    return { ok: false, error: 'invalidShape' }
  }

  let teachingPlanRead: Record<string, true> = {}
  if (obj.teachingPlanRead != null) {
    if (typeof obj.teachingPlanRead !== 'object' || Array.isArray(obj.teachingPlanRead)) {
      return { ok: false, error: 'invalidShape' }
    }
    teachingPlanRead = normalizeTeachingPlanRead(obj.teachingPlanRead as Record<string, unknown>)
  }

  return {
    ok: true,
    data: {
      schemaVersion: USER_DATA_SCHEMA_VERSION,
      exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
      programme: obj.programme.trim(),
      locale,
      defaultLanding,
      teachingPlanRead,
      selections: sanitizeCourseList(obj.selections, COURSE_STATUS_REGISTERED),
      wishlist: sanitizeCourseList(obj.wishlist, COURSE_STATUS_WISHLIST),
    },
  }
}

async function fetchCoursesCatalog(): Promise<Course[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}courses.json`)
  if (!res.ok) throw new Error('coursesFetchFailed')
  const data: unknown = await res.json()
  return Array.isArray(data) ? (data as Course[]) : []
}

function hydrateCourseEntries(
  entries: UserDataCourseEntry[],
  courses: Course[],
): SelectedSection[] {
  const byCode = new Map(courses.map(c => [c.courseCode, c]))
  const out: SelectedSection[] = []
  for (const entry of entries) {
    const course = byCode.get(entry.courseCode)
    if (!course) continue
    const section = course.sections.find(s => s.sectionId === entry.sectionId)
    if (!section) continue
    out.push({
      courseCode: course.courseCode,
      courseTitle: course.courseTitle,
      module: course.module,
      courseType: course.courseType,
      sectionId: section.sectionId,
      instructor: formatSectionInstructors(section),
    })
  }
  return out
}

function isTeachingPlanRead(noticeTimestamp: string, read: Record<string, true>): boolean {
  return read[noticeTimestamp] === true
}

/** Apply snapshot to localStorage and notify Teaching Plan dismiss listeners. */
export async function applyUserDataSnapshot(data: UserDataSnapshot): Promise<void> {
  const courses = await fetchCoursesCatalog()
  const selections = hydrateCourseEntries(data.selections, courses)
  const wishlist = hydrateCourseEntries(data.wishlist, courses)

  localStorage.setItem(LOCALE_STORAGE_KEY, data.locale)
  localStorage.setItem(DEFAULT_LANDING_STORAGE_KEY, data.defaultLanding)
  localStorage.setItem(SELECTIONS_STORAGE_KEY, JSON.stringify(selections))
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))

  for (const notice of teachingPlanNotices) {
    const key = teachingPlanDismissStorageKey(notice.id)
    const expected = teachingPlanDismissVersion(notice)
    try {
      if (isTeachingPlanRead(notice.timestamp, data.teachingPlanRead) && expected) {
        localStorage.setItem(key, expected)
      } else {
        localStorage.removeItem(key)
      }
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(teachingPlanDismissEventName(notice.id)))
  }
}

export function downloadJsonFile(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function defaultExportFilename(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `msba-planner-backup-${y}${m}${d}.json`
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}

export async function readTextFromClipboard(): Promise<string> {
  if (navigator.clipboard?.readText) {
    return navigator.clipboard.readText()
  }
  throw new Error('clipboardUnavailable')
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('readFailed'))
    reader.readAsText(file)
  })
}

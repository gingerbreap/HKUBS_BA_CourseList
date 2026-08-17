import type { CalendarEvent } from './calendarEvents'
import { calendarEventLabel } from './calendarEvents'

export interface IcsFormatTemplates {
  summary: string
  description: string
}

export const ICS_FORMAT_STORAGE_KEY = 'msba-ics-export-format'

export const DEFAULT_ICS_TEMPLATES: IcsFormatTemplates = {
  summary: '@code (@type): @name @ @location',
  description: '@code (@class): @name (@type)\nLocation: @location\nProfessor: Prof. @Prof',
}

/** Sample data for live preview (MSBA7001 Class A). */
export const ICS_PREVIEW_EVENT: CalendarEvent = {
  id: 'preview',
  date: '2026-09-05',
  startTime: '09:30',
  endTime: '12:30',
  courseCode: 'MSBA7001',
  courseTitle: 'Python for Data Analytics',
  sectionId: 'A',
  instructor: 'Prof. Chao DING',
  venue: 'LT104',
  sessionType: 'lecture',
}

export const ICS_PLACEHOLDERS: {
  key: string
  label: string
  example: string
}[] = [
  { key: '@code', label: '课程代码', example: 'MSBA7001' },
  { key: '@class', label: '班别', example: 'Class A' },
  { key: '@name', label: '课程名称', example: 'Python for Data Analytics' },
  { key: '@type', label: '课程类型', example: 'LEC' },
  { key: '@location', label: '教室', example: 'LT104' },
  { key: '@prof', label: '教授（含 Prof.）', example: 'Prof. Chao DING' },
  { key: '@Prof', label: '教授姓名', example: 'Chao DING' },
]

function sessionTypeLabel(ev: CalendarEvent): string {
  if (ev.sessionType === 'lecture') return 'LEC'
  if (ev.sessionType === 'tutorial') return 'TUT'
  return calendarEventLabel(ev)
}

function professorShort(instructor: string): string {
  return instructor.replace(/^Prof\.\s*/i, '').trim()
}

export function buildPlaceholderMap(ev: CalendarEvent): Record<string, string> {
  return {
    '@code': ev.courseCode,
    '@class': `Class ${ev.sectionId}`,
    '@name': ev.courseTitle,
    '@type': sessionTypeLabel(ev),
    '@location': ev.venue || '',
    '@prof': ev.instructor || '',
    '@Prof': professorShort(ev.instructor || ''),
  }
}

/** Replace placeholders; unknown tokens are left as-is. */
export function applyIcsTemplate(template: string, ev: CalendarEvent): string {
  const map = buildPlaceholderMap(ev)
  let out = template
  // @Prof before @prof to avoid partial replacement
  for (const key of ['@location', '@class', '@code', '@name', '@type', '@Prof', '@prof']) {
    out = out.split(key).join(map[key] ?? key)
  }
  return out
}

export function loadIcsTemplates(): IcsFormatTemplates {
  try {
    const raw = localStorage.getItem(ICS_FORMAT_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_ICS_TEMPLATES }
    const parsed = JSON.parse(raw) as Partial<IcsFormatTemplates>
    return {
      summary: parsed.summary ?? DEFAULT_ICS_TEMPLATES.summary,
      description: parsed.description ?? DEFAULT_ICS_TEMPLATES.description,
    }
  } catch {
    return { ...DEFAULT_ICS_TEMPLATES }
  }
}

export function saveIcsTemplates(templates: IcsFormatTemplates): void {
  localStorage.setItem(ICS_FORMAT_STORAGE_KEY, JSON.stringify(templates))
}

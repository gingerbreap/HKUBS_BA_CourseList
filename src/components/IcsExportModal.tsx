import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { filterEventsForIcsExport, type CalendarEvent } from '../utils/calendarEvents'
import {
  applyIcsTemplate,
  CHINESE_ICS_DESCRIPTION_TEMPLATE,
  CHINESE_ICS_FINAL_DESCRIPTION_TEMPLATE,
  DEFAULT_ICS_TEMPLATES,
  formatIcsPreviewWhen,
  ICS_PLACEHOLDERS,
  loadIcsTemplates,
  resolveIcsFinalsPreviewEvent,
  resolveIcsPreviewEvent,
  saveIcsTemplates,
  type IcsFormatTemplates,
} from '../utils/icsFormat'
import { buildIcsContent, downloadIcs } from '../utils/exportIcs'

const MODULES = [1, 2, 3, 4, 5] as const

type IcsFormatTab = 'class' | 'final'

interface IcsExportModalProps {
  events: CalendarEvent[]
  onClose: () => void
}

function chipTitle(summary: string): string {
  const idx = summary.indexOf(':')
  if (idx === -1) return summary
  const rest = summary.slice(idx + 1).trim()
  return `${summary.slice(0, idx + 1)}\n${rest}`
}

function PreviewPanels({
  event,
  summary,
  description,
  tab,
}: {
  event: CalendarEvent | null
  summary: string
  description: string
  tab: IcsFormatTab
}) {
  if (!event) {
    const subtitle = tab === 'class' ? '无课一身轻！' : '没有 Final 直接弹射起飞！'
    return (
      <div className="ics-export-preview-panels ics-export-preview-empty">
        <p className="ics-export-empty-notice">
          当前选择下没有可预览的事件
          <br />
          {subtitle}
        </p>
      </div>
    )
  }

  const when = formatIcsPreviewWhen(event.date, event.startTime, event.endTime)

  return (
    <div className="ics-export-preview-panels">
      <div className="ics-preview-chip" aria-label="日历格子预览">
        <div className="ics-preview-chip-title">{chipTitle(summary)}</div>
        {event.startTime && event.endTime && (
          <div className="ics-preview-chip-meta">
            {event.startTime}-{event.endTime}
          </div>
        )}
        {event.venue && (
          <div className="ics-preview-chip-meta">{event.venue}</div>
        )}
      </div>

      <div className="ics-preview-detail" aria-label="点击后详情预览">
        <div className="ics-preview-detail-title">{summary}</div>
        <div className="ics-preview-detail-when">{when}</div>
        {event.venue && (
          <div className="ics-preview-detail-row">
            <span className="ics-preview-detail-icon" aria-hidden="true">📍</span>
            <span className="ics-preview-detail-text">{event.venue}</span>
          </div>
        )}
        {description && (
          <div className="ics-preview-detail-row">
            <span className="ics-preview-detail-icon" aria-hidden="true">📝</span>
            <pre className="ics-preview-detail-desc">{description}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default function IcsExportModal({ events, onClose }: IcsExportModalProps) {
  const [templates, setTemplates] = useState<IcsFormatTemplates>(loadIcsTemplates)
  const [modules, setModules] = useState<Set<number>>(() => new Set(MODULES))
  const [includeLecture, setIncludeLecture] = useState(true)
  const [includeTutorial, setIncludeTutorial] = useState(true)
  const [activeTab, setActiveTab] = useState<IcsFormatTab>('class')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const allModulesSelected = MODULES.every(m => modules.has(m))
  const noModuleSelected = modules.size === 0
  const noSessionSelected = !includeLecture && !includeTutorial
  const filtersValid = !noModuleSelected && !noSessionSelected

  const exportableEvents = useMemo(
    () => (filtersValid
      ? filterEventsForIcsExport(events, modules, includeLecture, includeTutorial)
      : []),
    [events, modules, includeLecture, includeTutorial, filtersValid],
  )
  const hasExportableEvents = exportableEvents.length > 0
  const canExport = filtersValid && hasExportableEvents

  const classPreviewEvent = useMemo(
    () => resolveIcsPreviewEvent(events, modules, includeLecture, includeTutorial),
    [events, modules, includeLecture, includeTutorial],
  )
  const finalPreviewEvent = useMemo(
    () => resolveIcsFinalsPreviewEvent(events, modules, includeLecture, includeTutorial),
    [events, modules, includeLecture, includeTutorial],
  )

  const previewEvent = activeTab === 'class' ? classPreviewEvent : finalPreviewEvent
  const activeSummary = activeTab === 'class' ? templates.summary : templates.finalSummary
  const activeDescription = activeTab === 'class' ? templates.description : templates.finalDescription
  const previewSummary = previewEvent ? applyIcsTemplate(activeSummary, previewEvent) : ''
  const previewDescription = previewEvent ? applyIcsTemplate(activeDescription, previewEvent) : ''

  const toggleModule = (mod: number) => {
    setModules(prev => {
      const next = new Set(prev)
      if (next.has(mod)) next.delete(mod)
      else next.add(mod)
      return next
    })
  }

  const toggleAllModules = () => {
    setModules(allModulesSelected ? new Set() : new Set(MODULES))
  }

  const handleReset = () => {
    setTemplates({ ...DEFAULT_ICS_TEMPLATES })
  }

  const applyChineseTemplate = () => {
    setTemplates(t =>
      activeTab === 'class'
        ? { ...t, description: CHINESE_ICS_DESCRIPTION_TEMPLATE }
        : { ...t, finalDescription: CHINESE_ICS_FINAL_DESCRIPTION_TEMPLATE },
    )
  }

  const applyEnglishTemplate = () => {
    setTemplates(t =>
      activeTab === 'class'
        ? { ...t, description: DEFAULT_ICS_TEMPLATES.description }
        : { ...t, finalDescription: DEFAULT_ICS_TEMPLATES.finalDescription },
    )
  }

  const handleSummaryChange = (value: string) => {
    setTemplates(t =>
      activeTab === 'class' ? { ...t, summary: value } : { ...t, finalSummary: value },
    )
  }

  const handleDescriptionChange = (value: string) => {
    setTemplates(t =>
      activeTab === 'class' ? { ...t, description: value } : { ...t, finalDescription: value },
    )
  }

  const handleExport = () => {
    if (!canExport) return
    saveIcsTemplates(templates)
    const content = buildIcsContent(exportableEvents, templates)
    downloadIcs(content, 'hkubs-ba-planner.ics')
    onClose()
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-window ics-export-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ics-export-title"
        onClick={e => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="关闭">
          ×
        </button>

        <div className="modal-body ics-export-body">
          <h2 id="ics-export-title" className="ics-export-title">导出 .ics 格式日历文件</h2>

          <h2 className="ics-export-h2">导出事件选择</h2>

          <h3 className="ics-export-h3">现在想要导出哪些 Module 的课？</h3>
          <div className="ics-export-checks" role="group" aria-label="选择 Module">
            {MODULES.map(mod => (
              <label key={mod} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={modules.has(mod)}
                  onChange={() => toggleModule(mod)}
                />
                M{mod}
              </label>
            ))}
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allModulesSelected}
                onChange={toggleAllModules}
              />
              一键全选/全不选
            </label>
          </div>
          {noModuleSelected && (
            <div className="ics-export-required">* 至少选择一项</div>
          )}

          <h3 className="ics-export-h3">需要导出什么课？</h3>
          <div className="ics-export-checks" role="group" aria-label="选择课程类型">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeLecture}
                onChange={() => setIncludeLecture(v => !v)}
              />
              Lecture
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeTutorial}
                onChange={() => setIncludeTutorial(v => !v)}
              />
              Tutorial
            </label>
          </div>
          {noSessionSelected && (
            <div className="ics-export-required">* 至少选择一项</div>
          )}

          <h2 className="ics-export-h2">自定义事件格式</h2>
          <p className="ics-export-desc">
            你可以自由使用下表中列出的参数自定义日历中的事件呈现方式，以满足自己的需求！
          </p>

          <table className="ics-export-table">
            <thead>
              <tr>
                <th>参数</th>
                <th>说明</th>
                <th>示例</th>
              </tr>
            </thead>
            <tbody>
              {ICS_PLACEHOLDERS.map(row => (
                <tr key={row.keys.join('/')}>
                  <td>
                    {row.keys.map((key, index) => (
                      <span key={key}>
                        {index > 0 ? ' / ' : null}
                        <code>{key}</code>
                      </span>
                    ))}
                  </td>
                  <td>{row.label}</td>
                  <td>{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="ics-export-location-note">
            注：教室信息将会作为地点信息默认写入事件。
          </p>

          <div className="tabs ics-export-tabs" role="tablist" aria-label="事件格式分类">
            <button
              type="button"
              role="tab"
              id="ics-tab-class"
              className={`tab ${activeTab === 'class' ? 'active' : ''}`}
              aria-selected={activeTab === 'class'}
              aria-controls="ics-tab-panel"
              onClick={() => setActiveTab('class')}
            >
              授课信息 (LEC/TUT)
            </button>
            <button
              type="button"
              role="tab"
              id="ics-tab-final"
              className={`tab ${activeTab === 'final' ? 'active' : ''}`}
              aria-selected={activeTab === 'final'}
              aria-controls="ics-tab-panel"
              onClick={() => setActiveTab('final')}
            >
              期末考核信息
            </button>
          </div>

          <div
            id="ics-tab-panel"
            role="tabpanel"
            aria-labelledby={activeTab === 'class' ? 'ics-tab-class' : 'ics-tab-final'}
          >
            <h3 className="ics-export-h3">事件标题</h3>
            <input
              id="ics-summary"
              type="text"
              className="ics-export-input"
              value={activeSummary}
              onChange={e => handleSummaryChange(e.target.value)}
              spellCheck={false}
            />

            <div className="ics-export-h3-row">
              <h3 className="ics-export-h3">事件描述</h3>
              <div className="ics-export-template-links">
                <button type="button" className="ics-export-link-btn" onClick={applyChineseTemplate}>
                  使用中文模板
                </button>
                <button type="button" className="ics-export-link-btn" onClick={applyEnglishTemplate}>
                  使用英文模板（默认）
                </button>
              </div>
            </div>
            <textarea
              id="ics-description"
              className="ics-export-textarea"
              rows={5}
              value={activeDescription}
              onChange={e => handleDescriptionChange(e.target.value)}
              spellCheck={false}
            />

            <h3 className="ics-export-h3">预览</h3>
            <PreviewPanels
              event={previewEvent}
              summary={previewSummary}
              description={previewDescription}
              tab={activeTab}
            />
          </div>

          {filtersValid && !hasExportableEvents && (
            <p className="ics-export-empty-notice ics-export-empty-notice--export">
              当前选择下没有可导出的事件
              <br />
              在校园外也要好好生活！
            </p>
          )}

          <div className="ics-export-actions">
            <button type="button" className="alt-btn" onClick={handleReset}>
              恢复默认
            </button>
            <button
              type="button"
              className="select-btn"
              onClick={handleExport}
              disabled={!canExport}
            >
              导出
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

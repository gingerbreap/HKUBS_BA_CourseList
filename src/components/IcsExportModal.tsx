import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CalendarEvent } from '../utils/calendarEvents'
import {
  applyIcsTemplate,
  DEFAULT_ICS_TEMPLATES,
  ICS_PLACEHOLDERS,
  ICS_PREVIEW_EVENT,
  loadIcsTemplates,
  saveIcsTemplates,
  type IcsFormatTemplates,
} from '../utils/icsFormat'
import { buildIcsContent, downloadIcs } from '../utils/exportIcs'

interface IcsExportModalProps {
  events: CalendarEvent[]
  onClose: () => void
}

export default function IcsExportModal({ events, onClose }: IcsExportModalProps) {
  const [templates, setTemplates] = useState<IcsFormatTemplates>(loadIcsTemplates)

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

  const previewSummary = useMemo(
    () => applyIcsTemplate(templates.summary, ICS_PREVIEW_EVENT),
    [templates.summary],
  )
  const previewDescription = useMemo(
    () => applyIcsTemplate(templates.description, ICS_PREVIEW_EVENT),
    [templates.description],
  )

  const handleReset = () => {
    setTemplates({ ...DEFAULT_ICS_TEMPLATES })
  }

  const handleExport = () => {
    saveIcsTemplates(templates)
    const content = buildIcsContent(events, templates)
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
          <h2 id="ics-export-title" className="ics-export-title">自定义导出课程事件格式</h2>
          <p className="ics-export-intro">
            你可以使用下列参数自定义导出的事件格式，以满足自己的需求！
          </p>

          <div className="ics-export-form">
            <label className="ics-export-label" htmlFor="ics-summary">Summary：</label>
            <input
              id="ics-summary"
              type="text"
              className="ics-export-input"
              value={templates.summary}
              onChange={e => setTemplates(t => ({ ...t, summary: e.target.value }))}
              spellCheck={false}
            />

            <label className="ics-export-label" htmlFor="ics-description">Description：</label>
            <textarea
              id="ics-description"
              className="ics-export-textarea"
              rows={5}
              value={templates.description}
              onChange={e => setTemplates(t => ({ ...t, description: e.target.value }))}
              spellCheck={false}
            />
          </div>

          <div className="ics-export-hint">可用参数：</div>
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
                <tr key={row.key}>
                  <td><code>{row.key}</code></td>
                  <td>{row.label}</td>
                  <td>{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="ics-export-location-note">
            教室信息会始终写入 ICS 的 <strong>LOCATION</strong> 字段（与 @location 参数一致）。
          </p>

          <div className="ics-export-preview-title">预览</div>
          <div className="ics-export-preview">
            <div className="ics-export-preview-block">
              <div><strong>Summary:</strong> {previewSummary}</div>
              <div className="ics-export-preview-desc">
                <strong>Description:</strong>
                <pre>{previewDescription}</pre>
              </div>
            </div>
          </div>

          <div className="ics-export-actions">
            <button type="button" className="alt-btn" onClick={handleReset}>
              恢复默认
            </button>
            <button type="button" className="select-btn" onClick={handleExport}>
              导出
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

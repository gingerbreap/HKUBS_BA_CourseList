import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Course, SelectedSection } from '../types'
import {
  resolveStudyStatusImport,
  type StudyStatusImportResult,
} from '../utils/studyStatusImport'

interface StudyStatusImportModalProps {
  courses: Course[]
  onImport: (selections: SelectedSection[]) => void
  onClose: () => void
}

export default function StudyStatusImportModal({
  courses,
  onImport,
  onClose,
}: StudyStatusImportModalProps) {
  const [text, setText] = useState('')
  const [result, setResult] = useState<StudyStatusImportResult | null>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const hasRecognizedSelections = Boolean(result && result.selections.length > 0)
  const summary = useMemo(() => {
    if (!result) return null
    return [
      `识别到 ${result.parsedCount} 门状态为 Registered 的课程`,
      `可导入 ${result.selections.length} 门`,
    ].join('；')
  }, [result])

  const handleAnalyze = () => {
    setResult(resolveStudyStatusImport(text, courses))
  }

  const handleImport = () => {
    if (!result || !result.selections.length) return
    onImport(result.selections)
    onClose()
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-window study-status-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="study-status-import-title"
        onClick={event => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="关闭">
          ×
        </button>
        <div className="modal-body study-status-body">
          <h2 id="study-status-import-title" className="study-status-title">
            导入 Study Status
          </h2>
          <p className="study-status-intro">
            请在选课系统{' '}
            <a
              href="https://tpg.hkubs.hku.hk/study-status"
              target="_blank"
              rel="noopener noreferrer"
            >
              Study Status 页面
            </a>
            {' '}按 Ctrl+A (Mac: Command+A) 全选内容，粘贴到以下方框中
            <br />
            如从手机端复制，需至少保证从 Study Status 标题到 Summary 前所有内容被选中。
          </p>
          <textarea
            className="study-status-textarea"
            value={text}
            onChange={event => {
              setText(event.target.value)
              setResult(null)
            }}
            placeholder={'Study Status\n...\nMSBA7001\nD\n2026-2027\nModule 1\nCore\nRegistered'}
            spellCheck={false}
          />
          <div className="study-status-actions">
            <button
              type="button"
              className="alt-btn"
              onClick={handleAnalyze}
              disabled={!text.trim()}
            >
              分析内容
            </button>
            <button
              type="button"
              className="select-btn"
              onClick={handleImport}
              disabled={!hasRecognizedSelections}
            >
              导入并覆盖已选
            </button>
          </div>

          {result && (
            <div className="study-status-result">
              <strong>{summary}</strong>
              {result.selections.length > 0 && (
                <ul>
                  {result.selections.map(selection => (
                    <li key={`${selection.courseCode}-${selection.module}-${selection.sectionId}`}>
                      {selection.courseCode} Class {selection.sectionId} · Module {selection.module}
                    </li>
                  ))}
                </ul>
              )}
              {result.parsedCount === 0 && (
                <p>未找到状态为 Registered 的课程。请确认复制内容包含 Study Status 或 Study Plan 标题及课程记录。</p>
              )}
              {result.unmatched.length > 0 && (
                <p className="study-status-warning">
                  无法在 2026-27 教学计划中匹配：
                  {' '}
                  {result.unmatched.map(item => `${item.courseCode} Class ${item.sectionId} (M${item.module})`).join('、')}
                </p>
              )}
              {result.duplicateCourseCodes.length > 0 && (
                <p className="study-status-warning">
                  重复课号已跳过：{result.duplicateCourseCodes.join('、')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

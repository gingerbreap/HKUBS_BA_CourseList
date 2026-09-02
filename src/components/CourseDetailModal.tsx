import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CourseDetailContent } from '../pages/CourseDetail'
import { useI18n } from '../i18n/context'

interface CourseDetailModalProps {
  courseCode: string
  onClose: () => void
}

export default function CourseDetailModal({ courseCode, onClose }: CourseDetailModalProps) {
  const { t } = useI18n()

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

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-window"
        role="dialog"
        aria-modal="true"
        aria-label={t('courseDetail.modalLabel')}
        onClick={e => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label={t('common.close')}>
          ×
        </button>
        <div className="modal-body">
          <CourseDetailContent courseCode={courseCode} compact />
        </div>
      </div>
    </div>,
    document.body,
  )
}

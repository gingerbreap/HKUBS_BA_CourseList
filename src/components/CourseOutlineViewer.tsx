import { useIsMobile } from '../hooks/useIsMobile'
import { useI18n } from '../i18n/context'

interface CourseOutlineViewerProps {
  pdfPath: string
  baseUrl: string
  compact?: boolean
}

export default function CourseOutlineViewer({
  pdfPath,
  baseUrl,
  compact = false,
}: CourseOutlineViewerProps) {
  const { t } = useI18n()
  const isMobile = useIsMobile()
  const url = `${baseUrl}${pdfPath}`
  const filename = pdfPath.split('/').pop() ?? 'course-outline.pdf'

  if (isMobile) {
    return (
      <div className="pdf-viewer-fallback">
        <p className="pdf-viewer-fallback-note">{t('courseDetail.pdfMobileNote')}</p>
        <div className="pdf-viewer-fallback-actions">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="select-btn pdf-viewer-fallback-btn"
          >
            {t('courseDetail.pdfOpen')}
          </a>
          <span className="pdf-viewer-fallback-or">{t('courseDetail.pdfOr')}</span>
          <a href={url} download={filename} className="alt-btn pdf-viewer-fallback-btn">
            {t('courseDetail.pdfDownload')}
          </a>
        </div>
      </div>
    )
  }

  return (
    <iframe
      className={`pdf-viewer${compact ? ' pdf-viewer--compact' : ''}`}
      src={url}
      title={t('courseDetail.pdfTitle')}
    />
  )
}

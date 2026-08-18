import { useIsMobile } from '../hooks/useIsMobile'

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
  const isMobile = useIsMobile()
  const url = `${baseUrl}${pdfPath}`
  const filename = pdfPath.split('/').pop() ?? 'course-outline.pdf'

  if (isMobile) {
    return (
      <div className="pdf-viewer-fallback">
        <p className="pdf-viewer-fallback-note">手机端暂不支持页内预览课程大纲。</p>
        <div className="pdf-viewer-fallback-actions">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="select-btn pdf-viewer-fallback-btn"
          >
            在新标签页查看 PDF
          </a>
          <a href={url} download={filename} className="alt-btn pdf-viewer-fallback-btn">
            下载 PDF
          </a>
        </div>
      </div>
    )
  }

  return (
    <iframe
      className={`pdf-viewer${compact ? ' pdf-viewer--compact' : ''}`}
      src={url}
      title="Course Outline"
    />
  )
}

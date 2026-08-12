import { useMemo, useState, useEffect, useCallback } from 'react'
import CourseDetailModal from '../components/CourseDetailModal'
import PlannerCalendar from '../components/PlannerCalendar'
import WeekdayStrip from '../components/WeekdayStrip'
import { useCourses, useRequirements } from '../hooks/useCoursesData'
import { useSelections } from '../hooks/useSelections'
import { useWishlist } from '../hooks/useWishlist'
import { buildCalendarEvents } from '../utils/calendarEvents'
import { detectConflicts } from '../utils/conflicts'
import { formatSectionInstructors } from '../utils/instructors'
import type { Course, SelectedSection } from '../types'

function TimeBadge({ bucket }: { bucket: string }) {
  const cls = bucket === 'AM' ? 'badge-am' : bucket === 'PM' ? 'badge-pm' : 'badge-nt'
  return <span className={`badge ${cls}`}>{bucket}</span>
}

function itemKey(s: SelectedSection): string {
  return `${s.courseCode}-M${s.module}-${s.sectionId}`
}

export default function Planner() {
  const { courses, loading } = useCourses()
  const requirements = useRequirements()
  const { selections, toggle, isSelected, getForCourseCode, clear } = useSelections()
  const {
    wishlist,
    toggle: toggleWishlist,
    remove: removeWishlist,
    reorder,
    isInWishlist,
    clear: clearWishlist,
  } = useWishlist()
  const [tab, setTab] = useState<'selected' | 'browse'>('selected')
  const [duplicateMsg, setDuplicateMsg] = useState<string | null>(null)
  const [detailCode, setDetailCode] = useState<string | null>(null)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  useEffect(() => {
    if (!duplicateMsg) return
    const t = window.setTimeout(() => setDuplicateMsg(null), 4000)
    return () => window.clearTimeout(t)
  }, [duplicateMsg])

  const handleToggle = useCallback((s: SelectedSection) => {
    const result = toggle(s)
    if (result === 'duplicate') {
      const existing = getForCourseCode(s.courseCode)
      if (existing) {
        setDuplicateMsg(
          `「${s.courseCode}」已在规划中（${existing.sectionId}班 · Module ${existing.module}），请先移除后再选其他班别。`,
        )
      }
    }
    return result
  }, [toggle, getForCourseCode])

  const promoteFromWishlist = useCallback((s: SelectedSection) => {
    if (isSelected(s.courseCode, s.module, s.sectionId)) {
      removeWishlist(s)
      return
    }
    const existing = getForCourseCode(s.courseCode)
    if (existing) {
      setDuplicateMsg(
        `「${s.courseCode}」已在规划中（${existing.sectionId}班 · Module ${existing.module}），请先移除后再从备选中选择。`,
      )
      return
    }
    toggle(s)
    removeWishlist(s)
  }, [isSelected, getForCourseCode, toggle, removeWishlist])

  const conflicts = useMemo(() => detectConflicts(selections, courses), [selections, courses])
  const calendarEvents = useMemo(() => buildCalendarEvents(selections, courses), [selections, courses])

  const stats = useMemo(() => {
    const core = selections.filter(s => s.courseType === 'Core').length
    const elective = selections.filter(s => s.courseType === 'Elective').length
    const capstone = selections.filter(s => s.courseType === 'Capstone').length
    return { core, elective, capstone, total: selections.length }
  }, [selections])

  const streamCompletion = useMemo(() => {
    if (!requirements) return null
    const codes = new Set(selections.map(s => s.courseCode))
    const ai = requirements.streams.AI
    const mc = requirements.streams.MC
    const listA = (ai.listA as { courses: string[] }).courses.filter(c => codes.has(c)).length
    const listB = (ai.listB as { courses: string[] }).courses.filter(c => codes.has(c)).length
    const listC = (mc.listC as { courses: string[] }).courses.filter(c => codes.has(c)).length
    const listD = (mc.listD as { courses: string[] }).courses.filter(c => codes.has(c)).length
    return { listA, listB, listC, listD }
  }, [selections, requirements])

  const grouped = useMemo(() => {
    const map: Record<number, Course[]> = {}
    for (const c of courses) (map[c.module] ||= []).push(c)
    return map
  }, [courses])

  const findSection = (courseCode: string, module: number, sectionId: string) =>
    courses
      .find(c => c.courseCode === courseCode && c.module === module)
      ?.sections.find(s => s.sectionId === sectionId)

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>加载中...</div>

  return (
    <div>
      <h1 className="page-title">我的选课规划</h1>

      <div className="planner-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">已选总数</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.core}</div>
          <div className="stat-label">Core</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.elective}</div>
          <div className="stat-label">Elective</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.capstone}</div>
          <div className="stat-label">Capstone</div>
        </div>
      </div>

      {streamCompletion && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>方向完成度</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
            <div>
              <strong>AI 方向：</strong>
              <span className={streamCompletion.listA >= 1 ? 'check-icon' : 'cross-icon'}>
                {streamCompletion.listA >= 1 ? '✓' : '✗'}
              </span> List A ({streamCompletion.listA}/1)
              {' '}
              <span className={streamCompletion.listB >= 1 ? 'check-icon' : 'cross-icon'}>
                {streamCompletion.listB >= 1 ? '✓' : '✗'}
              </span> List B ({streamCompletion.listB}/1)
            </div>
            <div>
              <strong>MC 方向：</strong>
              <span className={streamCompletion.listC >= 1 ? 'check-icon' : 'cross-icon'}>
                {streamCompletion.listC >= 1 ? '✓' : '✗'}
              </span> List C ({streamCompletion.listC}/1)
              {' '}
              <span className={streamCompletion.listD >= 1 ? 'check-icon' : 'cross-icon'}>
                {streamCompletion.listD >= 1 ? '✓' : '✗'}
              </span> List D ({streamCompletion.listD}/1)
            </div>
          </div>
        </div>
      )}

      {conflicts.map((c, i) => (
        <div key={i} className={`conflict-alert ${c.type === 'error' ? 'conflict-error' : 'conflict-warning'}`}>
          <span>{c.type === 'error' ? '⛔' : '⚠️'}</span>
          <span>{c.message}</span>
        </div>
      ))}

      {duplicateMsg && (
        <div className="planner-toast" role="status">{duplicateMsg}</div>
      )}

      <PlannerCalendar events={calendarEvents} />

      <div className="tabs">
        <button className={`tab ${tab === 'selected' ? 'active' : ''}`} onClick={() => setTab('selected')}>
          已选课程 ({selections.length})
        </button>
        <button className={`tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>
          浏览 & 添加
        </button>
      </div>

      {tab === 'selected' && (
        <>
          <div className="card" style={{ padding: 0 }}>
            {selections.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#5f6368' }}>
                尚未选择任何课程，点击「浏览 & 添加」开始选课
              </div>
            ) : (
              <>
                {selections.map(s => {
                  const sec = findSection(s.courseCode, s.module, s.sectionId)
                  const instructorLabel = sec ? formatSectionInstructors(sec) : s.instructor
                  return (
                    <div className="selection-item" key={itemKey(s)}>
                      <div
                        className="selection-item-main"
                        role="button"
                        tabIndex={0}
                        onClick={() => setDetailCode(s.courseCode)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailCode(s.courseCode) } }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontWeight: 600, fontSize: 14 }}>
                          <span>{s.courseCode} {s.sectionId}班</span>
                          {sec && <TimeBadge bucket={sec.timeBucket} />}
                          {sec && <WeekdayStrip days={sec.meetingDays} title={sec.dayPattern} />}
                          <span className={`badge ${s.courseType === 'Core' ? 'badge-core' : s.courseType === 'Capstone' ? 'badge-capstone' : 'badge-elective'}`}>
                            {s.courseType}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#5f6368' }}>
                          {s.courseTitle} · 授课教授：{instructorLabel} · Module {s.module}
                        </div>
                      </div>
                      <button className="remove-btn" onClick={() => handleToggle(s)}>移除</button>
                    </div>
                  )
                })}
                <div style={{ padding: 12, textAlign: 'right' }}>
                  <button className="remove-btn" onClick={clear}>清空全部</button>
                </div>
              </>
            )}
          </div>

          <div className="wishlist-section">
            <div className="wishlist-header">
              <span>
                备选列表 ({wishlist.length})
                <span className="wishlist-hint"> · 可拖动排序；「选择」加入正式已选</span>
              </span>
              {wishlist.length > 0 && (
                <button className="remove-btn" onClick={clearWishlist}>清空备选</button>
              )}
            </div>
            <div className="card" style={{ padding: 0 }}>
              {wishlist.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#5f6368' }}>
                  暂无备选课程，在「浏览 & 添加」中点击「加入备选」
                </div>
              ) : (
                wishlist.map((s, index) => {
                  const sec = findSection(s.courseCode, s.module, s.sectionId)
                  const instructorLabel = sec ? formatSectionInstructors(sec) : s.instructor
                  return (
                    <div
                      className={`selection-item wishlist-item ${dragFrom === index ? 'dragging' : ''} ${dragOver === index ? 'drag-over' : ''}`}
                      key={itemKey(s)}
                      onDragOver={e => {
                        e.preventDefault()
                        if (dragOver !== index) setDragOver(index)
                      }}
                      onDrop={e => {
                        e.preventDefault()
                        if (dragFrom !== null && dragFrom !== index) reorder(dragFrom, index)
                        setDragFrom(null)
                        setDragOver(null)
                      }}
                      onDragEnd={() => {
                        setDragFrom(null)
                        setDragOver(null)
                      }}
                    >
                      <div className="wishlist-actions">
                        <span
                          className="drag-handle"
                          title="拖动排序"
                          draggable
                          onDragStart={e => {
                            setDragFrom(index)
                            e.dataTransfer.effectAllowed = 'move'
                            e.dataTransfer.setData('text/plain', String(index))
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          ⋮⋮
                        </span>
                        <button
                          className="select-btn"
                          onClick={() => promoteFromWishlist(s)}
                        >
                          选择
                        </button>
                      </div>
                      <div
                        className="selection-item-main"
                        role="button"
                        tabIndex={0}
                        onClick={() => setDetailCode(s.courseCode)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailCode(s.courseCode) } }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontWeight: 600, fontSize: 14 }}>
                          <span>{s.courseCode} {s.sectionId}班</span>
                          {sec && <TimeBadge bucket={sec.timeBucket} />}
                          {sec && <WeekdayStrip days={sec.meetingDays} title={sec.dayPattern} />}
                          <span className={`badge ${s.courseType === 'Core' ? 'badge-core' : s.courseType === 'Capstone' ? 'badge-capstone' : 'badge-elective'}`}>
                            {s.courseType}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#5f6368' }}>
                          {s.courseTitle} · 授课教授：{instructorLabel} · Module {s.module}
                        </div>
                      </div>
                      <button className="remove-btn" onClick={() => removeWishlist(s)}>移除</button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'browse' && (
        <div>
          {[1, 2, 3, 4, 5].map(mod => (
            <div key={mod}>
              <div className="module-header">Module {mod}</div>
              {(grouped[mod] || []).map(course => (
                <div className="card" key={`${course.courseCode}-${course.module}`}>
                  <div
                    className="planner-course-header"
                    role="button"
                    tabIndex={0}
                    onClick={() => setDetailCode(course.courseCode)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailCode(course.courseCode) } }}
                    style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}
                  >
                    {course.courseCode} {course.courseTitle}
                    <span className={`badge ${course.courseType === 'Core' ? 'badge-core' : course.courseType === 'Capstone' ? 'badge-capstone' : 'badge-elective'}`} style={{ marginLeft: 8 }}>
                      {course.courseType}
                    </span>
                  </div>
                  {course.sections.map(sec => {
                    const sel = isSelected(course.courseCode, course.module, sec.sectionId)
                    const existingForCode = getForCourseCode(course.courseCode)
                    const blockedByDuplicate = !!existingForCode && !sel
                    const instructorLabel = formatSectionInstructors(sec)
                    const inWishlist = isInWishlist(course.courseCode, course.module, sec.sectionId)
                    const candidate: SelectedSection = {
                      courseCode: course.courseCode,
                      courseTitle: course.courseTitle,
                      module: course.module,
                      courseType: course.courseType,
                      sectionId: sec.sectionId,
                      instructor: instructorLabel,
                    }
                    const duplicateHint = blockedByDuplicate && existingForCode
                      ? `已选 ${existingForCode.sectionId}班（Module ${existingForCode.module}），请先移除`
                      : undefined
                    return (
                      <div key={sec.sectionId} className="section-row" style={{ justifyContent: 'space-between' }}>
                        <div
                          className="planner-section-info"
                          role="button"
                          tabIndex={0}
                          onClick={() => setDetailCode(course.courseCode)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailCode(course.courseCode) } }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                        >
                          <span className="section-id">{sec.sectionId}班</span>
                          <TimeBadge bucket={sec.timeBucket} />
                          <WeekdayStrip days={sec.meetingDays} title={sec.dayPattern} />
                          <span style={{ fontSize: 13 }}>{instructorLabel}</span>
                          {duplicateHint && (
                            <span className="duplicate-hint">{duplicateHint}</span>
                          )}
                        </div>
                        <div className="section-actions">
                          <button
                            className={`select-btn ${sel ? 'selected' : ''} ${blockedByDuplicate ? 'disabled' : ''}`}
                            disabled={blockedByDuplicate}
                            title={duplicateHint}
                            onClick={() => handleToggle(candidate)}
                          >
                            {sel ? '已选 ✓' : blockedByDuplicate ? '不可选' : '选择'}
                          </button>
                          <button
                            className={`alt-btn ${inWishlist ? 'in-wishlist' : ''}`}
                            onClick={() => toggleWishlist(candidate)}
                          >
                            {inWishlist ? '已备选 ✓' : '加入备选'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {detailCode && (
        <CourseDetailModal courseCode={detailCode} onClose={() => setDetailCode(null)} />
      )}
    </div>
  )
}

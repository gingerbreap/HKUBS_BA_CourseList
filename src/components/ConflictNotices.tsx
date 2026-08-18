import { useMemo, useState } from 'react'
import { usePersistentDismiss } from '../hooks/usePersistentDismiss'
import {
  formatConflictWhen,
  formatCourseSection,
  formatCourseSectionWithType,
  tutorialConflictFingerprint,
  type GroupedConflicts,
  type PairConflict,
} from '../utils/conflicts'

const TUTORIAL_DISMISS_KEY = 'msba-dismiss-tutorial-conflicts'
const TUTORIAL_DISMISS_EVENT = 'msba:dismiss-tutorial-conflicts'

interface ConflictNoticesProps {
  conflicts: GroupedConflicts
}

function LectureLine({ pair, count }: { pair: PairConflict; count: number }) {
  return (
    <li>
      {formatCourseSection(pair.a)} - {formatCourseSection(pair.b)} ｜{count} 次冲突
    </li>
  )
}

function OccurrenceLine({
  pair,
  date,
  startTime,
  endTime,
}: {
  pair: PairConflict
  date: string
  startTime: string
  endTime: string
}) {
  return (
    <li>
      {formatCourseSection(pair.a)} - {formatCourseSection(pair.b)} | {date} {startTime}-{endTime}
    </li>
  )
}

function TutorialLine({ pair, occurrenceIndex }: { pair: PairConflict; occurrenceIndex: number }) {
  const occurrence = pair.tutorialOverlaps[occurrenceIndex]
  const aText = formatCourseSectionWithType(pair.a, occurrence.aSessionType)
  const bText = formatCourseSectionWithType(pair.b, occurrence.bSessionType)
  return (
    <li>
      {occurrence.aSessionType === 'lecture' ? <strong>{aText}</strong> : aText}
      {' - '}
      {occurrence.bSessionType === 'lecture' ? <strong>{bText}</strong> : bText}
      {' | '}
      {formatConflictWhen(occurrence)}
    </li>
  )
}

export default function ConflictNotices({ conflicts }: ConflictNoticesProps) {
  const [expanded, setExpanded] = useState(false)
  const fingerprint = useMemo(
    () => tutorialConflictFingerprint(conflicts.tutorial),
    [conflicts.tutorial],
  )
  const { dismissed, dismiss } = usePersistentDismiss(
    TUTORIAL_DISMISS_KEY,
    fingerprint,
    TUTORIAL_DISMISS_EVENT,
  )

  const tutorialLines = conflicts.tutorial.flatMap(pair =>
    pair.tutorialOverlaps.map((_, index) => ({ pair, index })),
  )
  const showTutorial = tutorialLines.length > 0 && !dismissed
  const collapsible = tutorialLines.length > 1

  if (
    conflicts.severeLecture.length === 0
    && conflicts.lecture.length === 0
    && !showTutorial
  ) {
    return null
  }

  return (
    <>
      {conflicts.severeLecture.length > 0 && (
        <div className="conflict-alert conflict-error">
          <div className="conflict-alert-header">
            以下课程有严重 Lecture 冲突，该冲突会严重影响出勤率，会导致其中一门或多门无法通过，请调整：
          </div>
          <ul className="conflict-alert-list">
            {conflicts.severeLecture.map(pair => (
              <LectureLine
                key={`${pair.a.courseCode}-${pair.a.sectionId}-${pair.b.courseCode}-${pair.b.sectionId}`}
                pair={pair}
                count={pair.lectureOverlaps.length}
              />
            ))}
          </ul>
        </div>
      )}

      {conflicts.lecture.length > 0 && (
        <div className="conflict-alert conflict-error">
          <div className="conflict-alert-header">
            以下课程有 Lecture 冲突，该冲突为会影响出勤率的冲突，请调整：
          </div>
          <ul className="conflict-alert-list">
            {conflicts.lecture.flatMap(pair =>
              pair.lectureOverlaps.map(occurrence => (
                <OccurrenceLine
                  key={`${pair.a.courseCode}-${pair.a.sectionId}-${pair.b.courseCode}-${pair.b.sectionId}-${occurrence.date}-${occurrence.startTime}`}
                  pair={pair}
                  date={occurrence.date}
                  startTime={occurrence.startTime}
                  endTime={occurrence.endTime}
                />
              )),
            )}
          </ul>
        </div>
      )}

      {showTutorial && (
        <div className="conflict-alert conflict-warning">
          <button type="button" className="notice-dismiss-btn" onClick={dismiss}>
            我知道了
          </button>
          <div className="conflict-alert-header">
            以下课程有时间冲突，其中有 Tutorial 冲突，这类冲突一般情况下不会影响出勤率，可按需调整或保持现状：
          </div>
          <ul
            className={`conflict-alert-list${collapsible && !expanded ? ' conflict-alert-list--collapsed' : ''}`}
          >
            {tutorialLines.map(({ pair, index }) => (
              <TutorialLine
                key={`${pair.a.courseCode}-${pair.a.sectionId}-${pair.b.courseCode}-${pair.b.sectionId}-${index}`}
                pair={pair}
                occurrenceIndex={index}
              />
            ))}
          </ul>
          {collapsible && (
            <button
              type="button"
              className="conflict-alert-toggle"
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? '折叠冲突列表' : '展开查看所有冲突'}
              <svg
                className="conflict-alert-toggle-icon"
                viewBox="0 0 12 12"
                width="12"
                height="12"
                aria-hidden="true"
                focusable="false"
              >
                {expanded ? (
                  <path
                    d="M2.2 8.2 6 4.4l3.8 3.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M2.2 3.8 6 7.6l3.8-3.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  )
}

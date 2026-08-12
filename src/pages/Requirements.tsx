import { useRequirements, useCourses } from '../hooks/useCoursesData'

export default function Requirements() {
  const req = useRequirements()
  const { courses } = useCourses()

  if (!req) return <div style={{ padding: 40, textAlign: 'center' }}>加载中...</div>

  const getTitle = (code: string) => courses.find(c => c.courseCode === code)?.courseTitle || code

  return (
    <div>
      <h1 className="page-title">培养要求</h1>

      <div className="card req-section">
        <h2>课程结构概览</h2>
        <p style={{ fontSize: 14, marginBottom: 12 }}>
          共需修读 <strong>{req.totalCourses}</strong> 门课程，每门 <strong>{req.creditsPerCourse}</strong> 学分，
          包括 <strong>4 门 Core 必修</strong> + <strong>1 门 Capstone（三选一）</strong> + <strong>5 门 Elective</strong>。
        </p>
      </div>

      <div className="card req-section">
        <h2>Core 必修课程</h2>
        <ul className="course-list">
          {req.coreCourses.map(code => (
            <li key={code}><strong>{code}</strong> — {getTitle(code)}</li>
          ))}
        </ul>
      </div>

      <div className="card req-section">
        <h2>Capstone 课程（三选一）</h2>
        <ul className="course-list">
          {req.capstoneCourses.map(c => (
            <li key={c.courseCode}><strong>{c.courseCode}</strong> — {c.courseTitle}</li>
          ))}
        </ul>
      </div>

      <h2 style={{ fontSize: 18, margin: '24px 0 12px' }}>方向 (Stream) 要求</h2>

      <div className="stream-card">
        <h3>🤖 Artificial Intelligence (AI) 方向</h3>
        <p>{req.streams.AI.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>List A — AI Methods（至少 1 门）</h4>
            <ul className="course-list">
              {(req.streams.AI.listA as { courses: string[] }).courses.map(code => (
                <li key={code}><strong>{code}</strong> — {getTitle(code)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>List B — AI Applications（至少 1 门）</h4>
            <ul className="course-list">
              {(req.streams.AI.listB as { courses: string[] }).courses.map(code => (
                <li key={code}><strong>{code}</strong> — {getTitle(code)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="stream-card">
        <h3>💼 Management Consulting (MC) 方向</h3>
        <p>{req.streams.MC.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>List C — Analytical Methods（至少 1 门）</h4>
            <ul className="course-list">
              {(req.streams.MC.listC as { courses: string[] }).courses.map(code => (
                <li key={code}><strong>{code}</strong> — {getTitle(code)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>List D — Domain Expertise（至少 1 门）</h4>
            <ul className="course-list">
              {(req.streams.MC.listD as { courses: string[] }).courses.map(code => (
                <li key={code}><strong>{code}</strong> — {getTitle(code)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card req-section">
        <h2>学习规划建议</h2>
        <ul className="course-list">
          {req.planningRules.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="card req-section">
        <h2>其他说明</h2>
        <ul className="course-list">
          {req.notes.map((n, i) => (
            <li key={i} style={{ fontSize: 13, color: '#5f6368' }}>{n}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

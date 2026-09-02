import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Timetable from './pages/Timetable'
import Planner from './pages/Planner'
import CourseDetail from './pages/CourseDetail'
import Requirements from './pages/Requirements'
import { trackPageView } from './utils/analytics'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isInitialPageView = useRef(true)

  useEffect(() => {
    const path = `${location.pathname}${location.search}`
    if (isInitialPageView.current) {
      isInitialPageView.current = false
      return
    }
    trackPageView(path)
  }, [location])

  return (
    <>
      <nav className="navbar">
        <div className="container" style={{ position: 'relative' }}>
          <NavLink to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
            HKU MSc(BA) 选课助手
          </NavLink>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <NavLink to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              我的选课
            </NavLink>
            <NavLink to="/courselist" className={location.pathname === '/courselist' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              模块时间表
            </NavLink>
            <NavLink to="/requirements" className={location.pathname === '/requirements' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              培养要求
            </NavLink>
          </div>
        </div>
      </nav>
      <div className="container" style={{ paddingTop: 8, paddingBottom: 24 }}>
        <Routes>
          <Route path="/" element={<Planner />} />
          <Route path="/planner" element={<Navigate to="/" replace />} />
          <Route path="/courselist" element={<Timetable />} />
          <Route path="/course/:courseCode" element={<CourseDetail />} />
          <Route path="/requirements" element={<Requirements />} />
        </Routes>
        <footer className="site-footer">
          <p className="site-footer-credit">
            本工具由 缄默姜饼 搭建、Cursor 与 Cloudflare 提供技术支持。
          </p>
          <p className="site-footer-disclaimer">
            本工具模块时间表内信息源自 MSc(BA) Programme Office 提供的 Teaching Plan 2026-27，毕业及 Stream 培养要求源自项目官网及 Curriculum Requirements for Concentrations 文件。以上信息最后与 Programme Office 所提供的信息同步与核查时间为香港时间 2026/08/18 17:10，所有内容均”按原样提供“ (Provided as-is）。
          </p>
          <p className="site-footer-disclaimer">
            该工具不代表香港大学或经管学院的官方立场、保证或承诺。课程安排、考核方式、时间及毕业要求可能随时调整，用户使用该工具时须已知所提供的信息可能在上述”信息同步与核查“时间点后已经过时，需通过学校官方信息发布渠道、Teaching Plan 和 Programme Office 的答复完成事实核查，并独立作出选课决定。开发者不对任何选课结果、未提示的实际时间冲突、毕业进度或因使用本网站产生的其他后果承担责任。
          </p>
          <p className="site-footer-disclaimer">
            如有工具使用或选课疑问，可私聊开发者、在班群内询问或直接联系 Programme Office。
          </p>
        </footer>
      </div>
    </>
  )
}

export default App

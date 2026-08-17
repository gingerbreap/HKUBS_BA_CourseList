import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Timetable from './pages/Timetable'
import Planner from './pages/Planner'
import CourseDetail from './pages/CourseDetail'
import Requirements from './pages/Requirements'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

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
      <div className="container" style={{ paddingTop: 8, paddingBottom: 40 }}>
        <Routes>
          <Route path="/" element={<Planner />} />
          <Route path="/planner" element={<Navigate to="/" replace />} />
          <Route path="/courselist" element={<Timetable />} />
          <Route path="/course/:courseCode" element={<CourseDetail />} />
          <Route path="/requirements" element={<Requirements />} />
        </Routes>
      </div>
    </>
  )
}

export default App

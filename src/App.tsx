import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import LanguagePicker from './components/LanguagePicker'
import Timetable from './pages/Timetable'
import Planner from './pages/Planner'
import CourseDetail from './pages/CourseDetail'
import Requirements from './pages/Requirements'
import { useI18n } from './i18n/context'
import { trackPageView } from './utils/analytics'

function App() {
  const { t } = useI18n()
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
        <div className="container navbar-inner">
          <NavLink to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
            {t('nav.brand')}
          </NavLink>
          <div className="navbar-end">
            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
              <NavLink to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                {t('nav.planner')}
              </NavLink>
              <NavLink to="/courselist" className={location.pathname === '/courselist' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                {t('nav.timetable')}
              </NavLink>
              <NavLink to="/requirements" className={location.pathname === '/requirements' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                {t('nav.requirements')}
              </NavLink>
              <LanguagePicker className="lang-picker-desktop" />
            </div>
            <div className="navbar-mobile-controls">
              <LanguagePicker className="lang-picker-mobile" />
              <button type="button" className="menu-toggle navbar-icon-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                <i className="fa-solid fa-bars" aria-hidden="true" />
              </button>
            </div>
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
          <p className="site-footer-credit">{t('footer.credit')}</p>
          <p className="site-footer-disclaimer">{t('footer.disclaimer1')}</p>
          <p className="site-footer-disclaimer">{t('footer.disclaimer2')}</p>
          <p className="site-footer-disclaimer">{t('footer.disclaimer3')}</p>
        </footer>
      </div>
    </>
  )
}

export default App

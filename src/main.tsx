import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { I18nProvider } from './i18n/context'
import { PwaInstallProvider } from './hooks/usePwaInstall'
import { consumePwaRefreshQuery } from './utils/pwaStorage'
import './index.css'
import App from './App'

consumePwaRefreshQuery()
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <PwaInstallProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </PwaInstallProvider>
    </I18nProvider>
  </StrictMode>,
)

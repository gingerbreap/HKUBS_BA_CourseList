import { useEffect, useMemo, useRef, useState } from 'react'
import AboutBackLink from '../components/AboutBackLink'
import { useI18n } from '../i18n/context'
import {
  buildUserDataSnapshot,
  copyTextToClipboard,
  defaultExportFilename,
  downloadJsonFile,
  snapshotToJson,
} from '../utils/userDataTransfer'
import {
  PWA_EXPLAIN_SOURCE_URL,
  pwaExplainMarkdownForLocale,
  pwaExplainMarkdownToHtml,
} from '../utils/pwaExplainMarkdown'

type StatusKind = 'ok' | 'error'

interface Status {
  kind: StatusKind
  message: string
}

type ToastKind = 'ok' | 'error'

interface ToastState {
  kind: ToastKind
  message: string
}

const TOAST_MS = 2400
const NEW_SITE_IMPORT_URL = 'https://tpghelper.gbrp.top/msba/#/about/import-export'
const NEW_SITE_PWA_URL = 'https://tpghelper.gbrp.top/msba/#/about/pwa'

export default function ImportExport() {
  const { t, locale } = useI18n()
  const exportJsonRef = useRef<HTMLTextAreaElement>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [exportModalJson, setExportModalJson] = useState<string | null>(null)
  const [pwaModalOpen, setPwaModalOpen] = useState(false)

  const pwaHtml = useMemo(
    () => pwaExplainMarkdownToHtml(pwaExplainMarkdownForLocale(locale)),
    [locale],
  )

  const showOk = (message: string) => setStatus({ kind: 'ok', message })
  const showError = (message: string) => setStatus({ kind: 'error', message })

  const showToast = (kind: ToastKind, message: string) => {
    setToast({ kind, message })
  }

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), TOAST_MS)
    return () => window.clearTimeout(id)
  }, [toast])

  useEffect(() => {
    if (!exportModalJson) return
    const el = exportJsonRef.current
    if (!el) return
    el.focus()
    el.select()
  }, [exportModalJson])

  const handleExportFile = () => {
    try {
      const json = snapshotToJson(buildUserDataSnapshot())
      downloadJsonFile(json, defaultExportFilename())
      showOk(t('about.transfer.exportFileOk'))
    } catch {
      showError(t('about.transfer.exportFailed'))
    }
  }

  const handleExportClipboard = async () => {
    setBusy(true)
    try {
      const json = snapshotToJson(buildUserDataSnapshot())
      try {
        await copyTextToClipboard(json)
      } catch {
        /* still show modal for manual copy */
      }
      showToast('ok', t('about.transfer.toastCopied'))
      setExportModalJson(json)
    } catch {
      showError(t('about.transfer.exportFailed'))
    } finally {
      setBusy(false)
    }
  }

  const handleExportJsonClick = async () => {
    const el = exportJsonRef.current
    if (!el || !exportModalJson) return
    el.focus()
    el.select()
    try {
      await copyTextToClipboard(exportModalJson)
      showToast('ok', t('about.transfer.toastCopied'))
    } catch {
      /* selection still helps manual copy */
    }
  }

  return (
    <div className="about-subpage">
      <AboutBackLink />
      <h1 className="page-title">{t('about.transfer.title')}</h1>
      <p className="about-transfer-intro">{t('about.transfer.intro')}</p>

      <div className="card about-transfer-card">
        <h2 className="about-transfer-h2">{t('about.transfer.exportTitle')}</h2>
        <p className="about-transfer-desc">{t('about.transfer.exportDesc')}</p>
        <div className="about-transfer-actions">
          <button type="button" className="about-transfer-btn" disabled={busy} onClick={handleExportFile}>
            {t('about.transfer.exportFile')}
          </button>
          <button type="button" className="about-transfer-btn" disabled={busy} onClick={() => { void handleExportClipboard() }}>
            {t('about.transfer.exportClipboard')}
          </button>
        </div>
      </div>

      <div className="card about-transfer-card about-transfer-card--import-disabled">
        <h2 className="about-transfer-h2">{t('about.transfer.importTitle')}</h2>
        <p className="about-transfer-desc">{t('about.transfer.importDesc')}</p>
        <div className="about-transfer-actions">
          <button type="button" className="about-transfer-btn" disabled aria-disabled="true">
            {t('about.transfer.importFile')}
          </button>
          <button type="button" className="about-transfer-btn" disabled aria-disabled="true">
            {t('about.transfer.importClipboard')}
          </button>
        </div>

        <div className="about-transfer-migrate">
          <p className="about-transfer-migrate-lead">{t('about.transfer.importMigrateLead')}</p>

          <div className="about-transfer-migrate-row">
            <i className="far fa-window-restore" aria-hidden="true" />
            <p>
              {t('about.transfer.importMigrateWebBefore')}
              <strong>{t('about.transfer.exportTitle')}</strong>
              {t('about.transfer.importMigrateWebMid')}
              <a href={NEW_SITE_IMPORT_URL} target="_blank" rel="noopener noreferrer">
                {t('about.transfer.importMigrateWebLink')}
              </a>
              {t('about.transfer.importMigrateWebAfter')}
            </p>
          </div>

          <div className="about-transfer-migrate-row">
            <i className="fas fa-mobile" aria-hidden="true" />
            <p>
              {t('about.transfer.importMigratePwaBefore')}
              <button
                type="button"
                className="about-transfer-pwa-term"
                onClick={() => setPwaModalOpen(true)}
              >
                {t('about.transfer.importMigratePwaTerm')}
              </button>
              {t('about.transfer.importMigratePwaMid')}
              <strong>{t('about.transfer.exportTitle')}</strong>
              {t('about.transfer.importMigratePwaAfterExport')}
              <a href={NEW_SITE_PWA_URL} target="_blank" rel="noopener noreferrer">
                {t('about.transfer.importMigratePwaLink')}
              </a>
              {t('about.transfer.importMigratePwaAfterLink')}
              <strong>{t('about.transfer.importMigratePwaAboutPath')}</strong>
              {t('about.transfer.importMigratePwaEnd')}
            </p>
          </div>
        </div>
      </div>

      {status && (
        <p
          className={
            status.kind === 'ok' ? 'about-transfer-status about-transfer-status--ok' : 'about-transfer-status about-transfer-status--error'
          }
          role="status"
        >
          {status.message}
        </p>
      )}

      {toast && (
        <div
          className={`transfer-toast transfer-toast--${toast.kind}`}
          role="status"
          aria-live="polite"
        >
          <i
            className={toast.kind === 'ok' ? 'far fa-check-circle' : 'far fa-times-circle'}
            aria-hidden="true"
          />
          <span>{toast.message}</span>
        </div>
      )}

      {exportModalJson != null && (
        <div
          className="modal-overlay"
          onClick={() => setExportModalJson(null)}
          role="presentation"
        >
          <div
            className="modal-window transfer-json-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-export-title"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setExportModalJson(null)}
              aria-label={t('common.close')}
            >
              ×
            </button>
            <div className="modal-body">
              <h2 id="transfer-export-title" className="transfer-json-modal-title">
                {t('about.transfer.exportClipboardModalTitle')}
              </h2>
              <p className="transfer-json-modal-desc">
                {t('about.transfer.exportClipboardModalDesc')}
              </p>
              <textarea
                ref={exportJsonRef}
                className="transfer-json-textarea"
                readOnly
                value={exportModalJson}
                onClick={() => {
                  void handleExportJsonClick()
                }}
                onFocus={e => e.currentTarget.select()}
                aria-label={t('about.transfer.exportClipboardModalTitle')}
              />
            </div>
          </div>
        </div>
      )}

      {pwaModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setPwaModalOpen(false)}
          role="presentation"
        >
          <div
            className="modal-window transfer-json-modal pwa-explain-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-explain-title"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setPwaModalOpen(false)}
              aria-label={t('common.close')}
            >
              ×
            </button>
            <div className="modal-body">
              <h2 id="pwa-explain-title" className="transfer-json-modal-title">
                {t('about.transfer.pwaExplainTitle')}
              </h2>
              <div
                className="pwa-explain-body"
                dangerouslySetInnerHTML={{ __html: pwaHtml }}
              />
              <p className="pwa-explain-source">
                {t('about.transfer.pwaExplainSourceLabel')}
                {' '}
                <a href={PWA_EXPLAIN_SOURCE_URL} target="_blank" rel="noopener noreferrer">
                  {PWA_EXPLAIN_SOURCE_URL}
                </a>
                {locale === 'en' ? t('about.transfer.pwaExplainSourceInChinese') : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

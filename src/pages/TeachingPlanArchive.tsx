import { useI18n } from '../i18n/context'

/** Minimal stub — full archive UI is built separately. */
export default function TeachingPlanArchive() {
  const { t } = useI18n()

  return (
    <div>
      <h1 className="page-title">{t('teachingPlan.archiveTitle')}</h1>
      <p style={{ fontSize: 14, color: '#5f6368' }}>{t('teachingPlan.archiveComingSoon')}</p>
    </div>
  )
}

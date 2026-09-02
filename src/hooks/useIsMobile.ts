import { useState } from 'react'

function detectMobileUserAgent(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent,
  )
}

/** Mobile detection from user agent only; does not react to viewport resize. */
export function useIsMobile(): boolean {
  const [isMobile] = useState(detectMobileUserAgent)
  return isMobile
}

import { useCallback, useEffect, useState } from 'react'

function readDismissed(storageKey: string, version: string): boolean {
  if (!version) return false
  try {
    return localStorage.getItem(storageKey) === version
  } catch {
    return false
  }
}

export function usePersistentDismiss(storageKey: string, version: string, eventName: string) {
  const [dismissed, setDismissed] = useState(() => readDismissed(storageKey, version))

  useEffect(() => {
    setDismissed(readDismissed(storageKey, version))
  }, [storageKey, version])

  useEffect(() => {
    const sync = () => setDismissed(readDismissed(storageKey, version))
    window.addEventListener(eventName, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(eventName, sync)
      window.removeEventListener('storage', sync)
    }
  }, [storageKey, version, eventName])

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(storageKey, version)
    } catch {
      /* ignore quota / private mode */
    }
    setDismissed(true)
    window.dispatchEvent(new Event(eventName))
  }, [storageKey, version, eventName])

  return { dismissed, dismiss }
}
